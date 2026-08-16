import { DateTime } from 'luxon'
import TrainingProgram from '#models/training_program'
import TrainingAssessment from '#models/training_assessment'
import TrainingTaskLog from '#models/training_task_log'
import type { TrainingPlan, TrainingPlanWeek } from '#services/training_service'
import { TRAINING_AXES, type TrainingAxis } from '#services/training/questionnaire'

export interface DailyTask {
  key: string
  title: string
  axis: TrainingAxis
  axisLabel: string
  duration: string
  steps: string[]
  tip: string
  done: boolean
  note: string | null
}

/** Digest du cycle écoulé, relu par le modèle pour construire le suivant. */
export interface CycleJournal {
  activeDays: number
  totalChecks: number
  missedChecks: number
  byWeek: { week: number; done: number; planned: number; activeDays: number }[]
  notes: { day: string; week: number; exercise: string; done: boolean; note: string }[]
}

const AXIS_LABEL = new Map(TRAINING_AXES.map((a) => [a.key, a.label]))

export default class TrainingProgramService {
  /** `c1-w2-e0` : le cycle est dans la clé, sinon les cochages d'un cycle
   * précédent réapparaîtraient sur le suivant. */
  taskKey(cycle: number, week: number, index: number): string {
    return `c${cycle}-w${week}-e${index}`
  }

  weekOf(plan: TrainingPlan, weekNumber: number): TrainingPlanWeek | undefined {
    return plan.weeks.find((w) => w.week === weekNumber) ?? plan.weeks[weekNumber - 1]
  }

  /**
   * Les exercices de la semaine courante, avec leur état pour le jour demandé.
   * Le cochage est quotidien : un même exercice se refait chaque jour, et la
   * liste repart à vide le lendemain.
   */
  async tasksForDay(program: TrainingProgram, day: DateTime): Promise<DailyTask[]> {
    const week = this.weekOf(program.plan, program.currentWeek)
    if (!week) return []

    const iso = day.toISODate()!
    const logs = await TrainingTaskLog.query()
      .where('programId', program.id)
      .where('day', iso)

    const byKey = new Map(logs.map((l) => [l.taskKey, l]))

    return week.exercises.map((exercise, index) => {
      const key = this.taskKey(program.cycle, program.currentWeek, index)
      const log = byKey.get(key)
      return {
        key,
        title: exercise.title,
        axis: exercise.axis,
        axisLabel: AXIS_LABEL.get(exercise.axis) ?? exercise.axis,
        duration: exercise.duration,
        steps: exercise.steps,
        tip: exercise.tip,
        done: log?.done ?? false,
        note: log?.note ?? null,
      }
    })
  }

  /**
   * Enregistre une observation sur un exercice. La ligne est créée si besoin
   * sans marquer l'exercice fait : « pas réussi aujourd'hui » est une note
   * légitime sur un exercice non coché.
   */
  async setTaskNote(params: {
    program: TrainingProgram
    userId: number
    day: DateTime
    taskKey: string
    note: string | null
  }): Promise<void> {
    const { program, userId, day, taskKey, note } = params
    const iso = day.toISODate()!
    const clean = note?.trim() ? note.trim() : null

    const existing = await TrainingTaskLog.query()
      .where('programId', program.id)
      .where('day', iso)
      .where('taskKey', taskKey)
      .first()

    if (existing) {
      existing.note = clean
      // Une ligne qui ne porte plus rien n'a pas de raison d'exister.
      if (!clean && !existing.done) await existing.delete()
      else await existing.save()
      return
    }

    if (!clean) return

    await TrainingTaskLog.create({
      programId: program.id,
      userId,
      day,
      taskKey,
      done: false,
      note: clean,
    })
  }

  /**
   * Coche ou décoche un exercice. Idempotent des deux côtés : un double appui
   * ne doit ni créer de doublon ni renvoyer d'erreur.
   */
  async toggleTask(params: {
    program: TrainingProgram
    userId: number
    day: DateTime
    taskKey: string
    done: boolean
  }): Promise<void> {
    const { program, userId, day, taskKey, done } = params
    const iso = day.toISODate()!

    const existing = await TrainingTaskLog.query()
      .where('programId', program.id)
      .where('day', iso)
      .where('taskKey', taskKey)
      .first()

    if (existing) {
      existing.done = done
      // Décocher n'efface pas l'observation : seule une ligne vide disparaît.
      if (!done && !existing.note) await existing.delete()
      else await existing.save()
      return
    }

    if (!done) return

    await TrainingTaskLog.create({
      programId: program.id,
      userId,
      day,
      taskKey,
      done: true,
      note: null,
    })
  }

  /**
   * Assiduité de la semaine écoulée : jours où au moins un exercice a été
   * coché, sur les sept derniers. Sert à l'affichage et au prompt du cycle
   * suivant.
   */
  async weekAdherence(program: TrainingProgram): Promise<{ activeDays: number; totalChecks: number }> {
    const logs = await TrainingTaskLog.query()
      .where('programId', program.id)
      .where('done', true)
      .where('day', '>=', program.weekStartedAt.toISODate()!)

    const days = new Set(logs.map((l) => l.day.toISODate()))
    return { activeDays: days.size, totalChecks: logs.length }
  }

  /**
   * Ce qui s'est réellement passé pendant le cycle, mis en forme pour le
   * modèle : volume fait semaine par semaine, et surtout les observations
   * écrites par le propriétaire. C'est là que se trouve l'information qu'aucune
   * case à cocher ne porte — « il tire encore dès qu'il voit un chien ».
   */
  async collectJournal(program: TrainingProgram): Promise<CycleJournal> {
    const logs = await TrainingTaskLog.query()
      .where('programId', program.id)
      .where('taskKey', 'like', `c${program.cycle}-%`)
      .orderBy('day', 'asc')

    const planned = new Map<number, number>()
    for (const week of program.plan.weeks) planned.set(week.week, week.exercises.length * 7)

    const byWeek = program.plan.weeks.map((week) => {
      const weekLogs = logs.filter((l) => l.taskKey.startsWith(`c${program.cycle}-w${week.week}-`))
      const doneLogs = weekLogs.filter((l) => l.done)
      return {
        week: week.week,
        done: doneLogs.length,
        planned: planned.get(week.week) ?? 0,
        activeDays: new Set(doneLogs.map((l) => l.day.toISODate())).size,
      }
    })

    const titleOf = (taskKey: string): string => {
      const match = /^c\d+-w(\d+)-e(\d+)$/.exec(taskKey)
      if (!match) return taskKey
      const week = this.weekOf(program.plan, Number(match[1]))
      return week?.exercises[Number(match[2])]?.title ?? taskKey
    }
    const weekOfKey = (taskKey: string): number => Number(/-w(\d+)-/.exec(taskKey)?.[1] ?? 0)

    // Les notes les plus récentes d'abord, plafonnées : au-delà, le prompt
    // gonfle sans rien apporter, et les dernières semaines sont les plus
    // représentatives de l'état actuel du chien.
    const notes = logs
      .filter((l) => !!l.note)
      .slice(-40)
      .map((l) => ({
        day: l.day.toISODate()!,
        week: weekOfKey(l.taskKey),
        exercise: titleOf(l.taskKey),
        done: l.done,
        note: l.note!.slice(0, 400),
      }))

    const doneLogs = logs.filter((l) => l.done)

    return {
      activeDays: new Set(doneLogs.map((l) => l.day.toISODate())).size,
      totalChecks: doneLogs.length,
      missedChecks: byWeek.reduce((acc, w) => acc + Math.max(0, w.planned - w.done), 0),
      byWeek,
      notes,
    }
  }

  /**
   * Fait avancer le programme après un bilan hebdomadaire validé.
   * Au bout de la dernière semaine du plan, le programme passe en `completed` :
   * c'est le déclencheur de l'écran de fin de cycle côté app.
   */
  advanceAfterCheckin(program: TrainingProgram): { finished: boolean } {
    const lastWeek = program.plan.weeks.length

    if (program.currentWeek >= lastWeek) {
      program.status = 'completed'
      program.completedAt = DateTime.now()
      return { finished: true }
    }

    program.currentWeek += 1
    program.weekStartedAt = DateTime.now()
    return { finished: false }
  }

  /**
   * Crée le suivi attaché à un bilan, s'il n'existe pas déjà.
   *
   * Un seul programme par animal : relancer un bilan remplace l'ancien plutôt
   * que d'empiler deux suivis contradictoires sur le même chien.
   */
  async ensureProgram(assessment: TrainingAssessment): Promise<TrainingProgram | null> {
    if (!assessment.plan || assessment.planStatus !== 'completed') return null

    const existing = await TrainingProgram.query().where('assessmentId', assessment.id).first()
    if (existing) return existing

    await TrainingProgram.query().where('petId', assessment.petId).delete()

    const now = DateTime.now()
    return TrainingProgram.create({
      petId: assessment.petId,
      userId: assessment.userId,
      assessmentId: assessment.id,
      plan: assessment.plan,
      scores: assessment.scores,
      scoresHistory: [
        {
          at: now.toISO()!,
          cycle: 1,
          week: 0,
          scores: assessment.scores,
          overallScore: assessment.overallScore,
          source: 'initial',
        },
      ],
      overallScore: assessment.overallScore,
      level: assessment.level,
      cycle: 1,
      currentWeek: 1,
      weekStartedAt: now,
      status: 'active',
      planFromAi: assessment.planFromAi,
      startedAt: now,
    })
  }

  /**
   * Rattrape les plans générés avant l'existence des programmes : sans ça, un
   * propriétaire qui a déjà son plan ne verrait jamais le suivi apparaître, et
   * devrait refaire tout le questionnaire pour rien.
   *
   * Idempotent : ne crée un programme que pour les animaux qui n'en ont pas.
   */
  async backfillMissingPrograms(userId: number): Promise<number> {
    const orphans = await TrainingAssessment.query()
      .where('userId', userId)
      .where('kind', 'initial')
      .where('planStatus', 'completed')
      .whereNotExists((sub) => {
        sub
          .from('training_programs')
          .whereRaw('training_programs.pet_id = training_assessments.pet_id')
      })
      .orderBy('createdAt', 'desc')

    // Un seul bilan par animal : le plus récent fait foi.
    const seen = new Set<number>()
    let created = 0
    for (const assessment of orphans) {
      if (seen.has(assessment.petId)) continue
      seen.add(assessment.petId)
      if (await this.ensureProgram(assessment)) created++
    }
    return created
  }

  /** Vue compacte pour l'accueil : rien de ce qui n'est pas affiché n'est calculé. */
  async summarize(program: TrainingProgram, day: DateTime) {
    const checkinDue = program.checkinDue
    // Tant que le bilan n'est pas fait, les exercices de la semaine suivante
    // ne sont pas servis : c'est le verrou qui rend le suivi réel plutôt
    // qu'une liste de cases à cocher indéfiniment.
    const tasks = checkinDue ? [] : await this.tasksForDay(program, day)
    const week = this.weekOf(program.plan, program.currentWeek)

    return {
      id: program.id,
      petId: program.petId,
      // La fiche animal ouvre le bilan à partir de là : sans cet identifiant
      // elle devrait faire un second appel pour retrouver le résultat.
      assessmentId: program.assessmentId,
      cycle: program.cycle,
      week: program.currentWeek,
      totalWeeks: program.plan.weeks.length,
      theme: week?.theme ?? '',
      goal: week?.goal ?? '',
      sessions: week?.sessions ?? '',
      successCriteria: week?.successCriteria ?? '',
      status: program.status,
      checkinDue,
      daysUntilCheckin: program.daysUntilCheckin,
      // Décroché depuis trop longtemps : l'app propose de repartir sur la
      // semaine plutôt que d'exiger un bilan sur une période non travaillée.
      isStale: program.isStale,
      daysSinceWeekStart: program.daysSinceWeekStart,
      scores: program.scores,
      overallScore: program.overallScore,
      level: program.level,
      tasks,
      doneCount: tasks.filter((t) => t.done).length,
      totalCount: tasks.length,
      startedAt: program.startedAt,
      weekStartedAt: program.weekStartedAt,
    }
  }
}
