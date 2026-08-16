import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import logger from '@adonisjs/core/services/logger'
import TrainingProgram from '#models/training_program'
import TrainingAssessment from '#models/training_assessment'
import TrainingProgramService from '#services/training_program_service'
import TrainingService from '#services/training_service'
import {
  ADHERENCE_BY_ID,
  ADHERENCE_QUESTIONS,
  applyCheckinScores,
  buildCheckin,
} from '#services/training/checkin'
import { QUESTIONS_BY_ID, TRAINING_AXES } from '#services/training/questionnaire'
import { toggleTrainingTaskValidator, trainingCheckinValidator } from '#validators/training'

export default class TrainingProgramsController {
  private programs = new TrainingProgramService()
  private training = new TrainingService()

  /** Le jour de l'utilisateur, pas celui du serveur. */
  private dayFrom(raw?: string): DateTime {
    if (raw) {
      const parsed = DateTime.fromISO(raw)
      if (parsed.isValid) return parsed
    }
    return DateTime.now()
  }

  private async findOwned(id: string, userId: number) {
    return TrainingProgram.query().where('id', id).where('userId', userId).preload('pet').first()
  }

  /**
   * Tous les programmes actifs de l'utilisateur, avec les exercices du jour.
   * C'est ce que consomme la section « Suivi éducation » de l'accueil.
   * GET /training/today
   */
  async today({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const day = this.dayFrom(request.input('day'))

    // Rattrapage des plans antérieurs aux programmes, avant de lire la liste.
    await this.programs.backfillMissingPrograms(user.id)

    const programs = await TrainingProgram.query()
      .where('userId', user.id)
      .whereIn('status', ['active', 'completed'])
      .preload('pet')
      .orderBy('createdAt', 'desc')

    // Un seul programme par animal : si un ancien cycle traîne, on ne garde
    // que le plus récent pour ne pas afficher deux suivis pour le même chien.
    const seen = new Set<number>()
    const latest = programs.filter((p) => {
      if (seen.has(p.petId)) return false
      seen.add(p.petId)
      return true
    })

    const data = []
    for (const program of latest) {
      const summary = await this.programs.summarize(program, day)
      data.push({
        ...summary,
        petName: program.pet?.name ?? null,
        petBreed: program.pet?.breed ?? null,
        petAvatarUrl: program.pet?.avatarUrl ?? null,
      })
    }

    return response.ok({ success: true, data })
  }

  /**
   * Détail complet : plan, progression par axe, historique des bilans.
   * GET /training/programs/:id
   */
  async show({ params, auth, request, response }: HttpContext) {
    const user = auth.user!
    const program = await this.findOwned(params.id, user.id)
    if (!program) {
      return response.notFound({ success: false, message: 'Programme introuvable' })
    }

    const day = this.dayFrom(request.input('day'))
    const summary = await this.programs.summarize(program, day)
    const adherence = await this.programs.weekAdherence(program)

    return response.ok({
      success: true,
      data: {
        ...summary,
        petName: program.pet?.name ?? null,
        petBreed: program.pet?.breed ?? null,
        plan: program.plan,
        planFromAi: program.planFromAi,
        scoresHistory: program.scoresHistory,
        adherence,
        axes: TRAINING_AXES,
      },
    })
  }

  /**
   * Coche ou décoche un exercice du jour.
   * POST /training/programs/:id/tasks
   */
  async toggleTask({ params, auth, request, response }: HttpContext) {
    const user = auth.user!
    const program = await this.findOwned(params.id, user.id)
    if (!program) {
      return response.notFound({ success: false, message: 'Programme introuvable' })
    }
    if (program.status !== 'active') {
      return response.badRequest({ success: false, message: 'Ce programme est terminé' })
    }
    if (program.checkinDue) {
      return response.badRequest({
        success: false,
        message: 'Faites le bilan de la semaine pour débloquer les exercices suivants',
      })
    }

    const payload = await request.validateUsing(toggleTrainingTaskValidator)
    const day = this.dayFrom(payload.day)

    // La clé doit appartenir à la semaine en cours : sinon on pourrait valider
    // des exercices d'une semaine qu'on n'a pas encore atteinte.
    const expected = new Set(
      (this.programs.weekOf(program.plan, program.currentWeek)?.exercises ?? []).map((_, i) =>
        this.programs.taskKey(program.cycle, program.currentWeek, i)
      )
    )
    if (!expected.has(payload.taskKey)) {
      return response.badRequest({ success: false, message: 'Exercice inconnu pour cette semaine' })
    }

    await this.programs.toggleTask({
      program,
      userId: user.id,
      day,
      taskKey: payload.taskKey,
      done: payload.done,
    })

    const summary = await this.programs.summarize(program, day)
    return response.ok({ success: true, data: summary })
  }

  /**
   * Questions du bilan de fin de semaine.
   * GET /training/programs/:id/checkin
   */
  async checkinQuestions({ params, auth, response }: HttpContext) {
    const user = auth.user!
    const program = await this.findOwned(params.id, user.id)
    if (!program) {
      return response.notFound({ success: false, message: 'Programme introuvable' })
    }

    const checkin = buildCheckin({
      week: this.programs.weekOf(program.plan, program.currentWeek),
      weekNumber: program.currentWeek,
      cycle: program.cycle,
      scores: program.scores,
    })

    const adherence = await this.programs.weekAdherence(program)

    return response.ok({
      success: true,
      data: {
        ...checkin,
        petName: program.pet?.name ?? null,
        currentScores: program.scores,
        activeDays: adherence.activeDays,
        due: program.checkinDue,
        daysUntilCheckin: program.daysUntilCheckin,
      },
    })
  }

  /**
   * Enregistre le bilan hebdomadaire, met à jour les notes des axes rejoués et
   * fait avancer le programme d'une semaine.
   * POST /training/programs/:id/checkin
   */
  async submitCheckin({ params, auth, request, response }: HttpContext) {
    const user = auth.user!
    const program = await this.findOwned(params.id, user.id)
    if (!program) {
      return response.notFound({ success: false, message: 'Programme introuvable' })
    }
    if (program.status !== 'active') {
      return response.badRequest({ success: false, message: 'Ce programme est terminé' })
    }

    const payload = await request.validateUsing(trainingCheckinValidator)

    const checkin = buildCheckin({
      week: this.programs.weekOf(program.plan, program.currentWeek),
      weekNumber: program.currentWeek,
      cycle: program.cycle,
      scores: program.scores,
    })

    // Toutes les questions posées doivent avoir une réponse valide : accepter
    // un bilan partiel ferait bouger la note sur la moitié des critères sans
    // que l'utilisateur le sache.
    const missing = checkin.questions.filter((q) => !payload.answers[q.id])
    if (missing.length > 0) {
      return response.badRequest({
        success: false,
        message: `Bilan incomplet : ${missing.length} question${missing.length > 1 ? 's' : ''} sans réponse.`,
      })
    }
    for (const [id, value] of Object.entries(payload.answers)) {
      const question = QUESTIONS_BY_ID.get(id)
      if (!question) return response.badRequest({ success: false, message: `Question inconnue : ${id}` })
      if (!question.options.some((o) => o.value === value)) {
        return response.badRequest({
          success: false,
          message: `Réponse invalide pour « ${question.text} »`,
        })
      }
    }
    for (const q of ADHERENCE_QUESTIONS) {
      const value = payload.adherence[q.id]
      if (!value || !q.options.some((o) => o.value === value)) {
        return response.badRequest({
          success: false,
          message: `Réponse manquante ou invalide pour « ${q.text} »`,
        })
      }
    }

    const previousScores = { ...program.scores }
    const { scores, deltas, overallScore } = applyCheckinScores({
      previous: program.scores,
      answers: payload.answers,
      axes: checkin.axes,
    })

    const closedWeek = program.currentWeek

    await TrainingAssessment.create({
      petId: program.petId,
      userId: user.id,
      kind: 'weekly',
      programId: program.id,
      week: closedWeek,
      cycle: program.cycle,
      answers: payload.answers,
      context: payload.adherence,
      scores,
      overallScore,
      level: this.training.levelFor(overallScore),
      planStatus: 'none',
    })

    program.scores = scores
    program.overallScore = overallScore
    program.level = this.training.levelFor(overallScore)
    program.scoresHistory = [
      ...program.scoresHistory,
      {
        at: DateTime.now().toISO()!,
        cycle: program.cycle,
        week: closedWeek,
        scores,
        overallScore,
        source: 'weekly',
      },
    ]

    const { finished } = this.programs.advanceAfterCheckin(program)
    await program.save()

    return response.ok({
      success: true,
      data: {
        finished,
        week: closedWeek,
        nextWeek: finished ? null : program.currentWeek,
        scores,
        previousScores,
        deltas,
        overallScore,
        level: program.level,
        axesUpdated: checkin.axes,
      },
    })
  }

  /**
   * Relance un cycle de quatre semaines sur les notes à jour. Premium, comme la
   * génération initiale.
   * POST /training/programs/:id/next-cycle
   */
  async nextCycle({ params, auth, response }: HttpContext) {
    const user = auth.user!
    const program = await this.findOwned(params.id, user.id)
    if (!program) {
      return response.notFound({ success: false, message: 'Programme introuvable' })
    }
    if (program.status !== 'completed') {
      return response.badRequest({
        success: false,
        message: 'Terminez le cycle en cours avant d\'en relancer un',
      })
    }

    const initial = await TrainingAssessment.find(program.assessmentId)
    const context = initial?.context ?? {}

    const lastCheckin = await TrainingAssessment.query()
      .where('programId', program.id)
      .where('kind', 'weekly')
      .orderBy('createdAt', 'desc')
      .first()

    const adherenceLabel = (id: string) => {
      const value = lastCheckin?.context?.[id]
      const question = ADHERENCE_BY_ID.get(id)
      return question?.options.find((o) => o.value === value)?.label ?? 'non renseigné'
    }

    const weakest = [...TRAINING_AXES]
      .map((a) => a.key)
      .sort((a, b) => program.scores[a] - program.scores[b])

    try {
      const { plan, fromAi } = await this.training.generatePlan({
        pet: program.pet,
        scoring: {
          scores: program.scores,
          overallScore: program.overallScore,
          level: this.training.levelFor(program.overallScore),
          weakest,
        },
        context,
        progress: {
          cycle: program.cycle + 1,
          previousScores: program.scoresHistory[0]?.scores ?? program.scores,
          adherence: adherenceLabel('chk_sessions'),
          goalProgress: adherenceLabel('chk_goal'),
        },
      })

      program.plan = plan
      program.planFromAi = fromAi
      program.cycle += 1
      program.currentWeek = 1
      program.weekStartedAt = DateTime.now()
      program.status = 'active'
      program.completedAt = null
      await program.save()

      return response.ok({ success: true, data: { id: program.id, cycle: program.cycle } })
    } catch (error) {
      logger.error({ err: error }, `[Training] Cycle suivant du programme ${program.id} en échec`)
      return response.internalServerError({
        success: false,
        message: `Le nouveau cycle n'a pas pu être généré : ${
          error instanceof Error ? error.message : 'erreur inconnue'
        }`,
      })
    }
  }

  /**
   * Arrête le suivi. Le bilan initial et l'historique restent en base.
   * DELETE /training/programs/:id
   */
  async destroy({ params, auth, response }: HttpContext) {
    const user = auth.user!
    const program = await this.findOwned(params.id, user.id)
    if (!program) {
      return response.notFound({ success: false, message: 'Programme introuvable' })
    }

    await program.delete()
    return response.ok({ success: true, message: 'Suivi arrêté' })
  }
}
