import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Pet from '#models/pet'
import TrainingAssessment from '#models/training_assessment'
import TrainingService from '#services/training_service'
import TrainingProgramService from '#services/training_program_service'
import { createTrainingAssessmentValidator } from '#validators/training'
import BlogPost from '#models/blog_post'
import {
  AXIS_LABEL,
  CONTEXT_QUESTIONS,
  TRAINING_AXES,
  TRAINING_QUESTIONS,
  type TrainingAxis,
} from '#services/training/questionnaire'
import { AXIS_REFERENCES, videoSearchUrl } from '#services/training/references'
import logger from '@adonisjs/core/services/logger'

const LEVEL_LABELS: Record<string, { label: string; message: string }> = {
  debutant: {
    label: 'Débutant',
    message: "Tout est encore à construire, et c'est une bonne nouvelle : les progrès seront rapides et visibles.",
  },
  apprenti: {
    label: 'En apprentissage',
    message: 'Les bases sont posées mais elles ne tiennent pas encore partout. Le travail porte sur la régularité.',
  },
  confirme: {
    label: 'Confirmé',
    message: 'Votre chien est solide dans la plupart des situations. Restent quelques domaines à consolider.',
  },
  expert: {
    label: 'Expert',
    message: "Excellent niveau. L'enjeu est maintenant l'entretien et les situations vraiment difficiles.",
  },
}

export default class TrainingController {
  private training = new TrainingService()
  private programs = new TrainingProgramService()

  /**
   * Catalogue de questions.
   * GET /training/questionnaire
   */
  async questionnaire({ response }: HttpContext) {
    return response.ok({
      success: true,
      data: {
        axes: TRAINING_AXES,
        questions: TRAINING_QUESTIONS,
        contextQuestions: CONTEXT_QUESTIONS,
      },
    })
  }

  /**
   * Fond documentaire d'un axe : le pourquoi de l'exercice, les erreurs
   * fréquentes, les repères de progression, plus des articles du blog et des
   * recherches vidéo.
   * GET /training/references/:axis
   */
  async references({ params, response }: HttpContext) {
    const axis = params.axis as TrainingAxis
    const reference = AXIS_REFERENCES[axis]
    if (!reference) {
      return response.notFound({ success: false, message: 'Domaine inconnu' })
    }

    // Les articles viennent du blog existant : rien n'est inventé. On sert
    // d'abord la sélection explicite de l'axe, dans son ordre de pertinence,
    // et on complète par la catégorie si ces articles n'existent pas encore.
    const picked = reference.blogSlugs.length
      ? await BlogPost.query().whereIn('slug', reference.blogSlugs)
      : []

    const ordered = reference.blogSlugs
      .map((slug) => picked.find((a) => a.slug === slug))
      .filter((a): a is BlogPost => !!a)

    const articles =
      ordered.length > 0
        ? ordered
        : await BlogPost.query()
            .where('target', 'owner')
            .where('category', reference.blogCategory)
            .where((q) => {
              q.orWhereRaw(`',' || species || ',' LIKE ?`, ['%,dog,%']).orWhereNull('species')
            })
            .orderBy('featured', 'desc')
            .limit(4)

    return response.ok({
      success: true,
      data: {
        axis,
        label: AXIS_LABEL[axis],
        why: reference.why,
        mechanism: reference.mechanism,
        mistakes: reference.mistakes,
        milestones: reference.milestones,
        articles: articles.map((a) => ({
          slug: a.slug,
          title: a.title,
          excerpt: a.excerpt,
          readTime: a.readTime,
          image: a.imageUrl,
        })),
        videos: reference.curatedVideos,
        // Des recherches, pas des vidéos précises : un lien inventé qui tombe
        // en 404 décrédibilise tout le reste de l'écran.
        videoSearches: reference.searchTerms.map((term) => ({
          label: term,
          url: videoSearchUrl(term),
        })),
      },
    })
  }

  /**
   * Enregistre un bilan et renvoie les notes. Gratuit : c'est le plan qui est
   * réservé aux comptes Premium, pas l'évaluation.
   * POST /pets/:id/training/assessments
   */
  async store({ params, request, auth, response }: HttpContext) {
    const user = auth.user!

    const pet = await Pet.query().where('id', params.id).where('userId', user.id).first()
    if (!pet) {
      return response.notFound({ success: false, message: 'Animal introuvable' })
    }
    if (pet.species !== 'dog') {
      return response.badRequest({
        success: false,
        message: "Le bilan d'éducation n'est disponible que pour les chiens",
      })
    }

    const payload = await request.validateUsing(createTrainingAssessmentValidator)

    const check = this.training.validateAnswers(payload.answers, payload.context)
    if (!check.ok) {
      return response.badRequest({ success: false, message: check.message })
    }

    const scoring = this.training.scoreAnswers(payload.answers)

    const assessment = await TrainingAssessment.create({
      petId: pet.id,
      userId: user.id,
      answers: payload.answers,
      context: payload.context,
      scores: scoring.scores,
      overallScore: scoring.overallScore,
      level: scoring.level,
      planStatus: 'none',
    })

    return response.created({
      success: true,
      data: this.serialize(assessment, pet),
    })
  }

  /**
   * Historique des bilans d'un chien.
   * GET /pets/:id/training/assessments
   */
  async index({ params, auth, response }: HttpContext) {
    const user = auth.user!

    const pet = await Pet.query().where('id', params.id).where('userId', user.id).first()
    if (!pet) {
      return response.notFound({ success: false, message: 'Animal introuvable' })
    }

    const assessments = await TrainingAssessment.query()
      .where('petId', pet.id)
      .where('userId', user.id)
      .orderBy('createdAt', 'desc')
      .limit(20)

    return response.ok({
      success: true,
      data: assessments.map((a) => ({
        id: a.id,
        overallScore: a.overallScore,
        level: a.level,
        scores: a.scores,
        hasPlan: a.planStatus === 'completed',
        planStatus: a.planStatus,
        createdAt: a.createdAt,
      })),
    })
  }

  /**
   * Détail d'un bilan, avec le plan s'il a été généré.
   * GET /training/assessments/:id
   */
  async show({ params, auth, response }: HttpContext) {
    const user = auth.user!

    const assessment = await TrainingAssessment.query()
      .where('id', params.id)
      .where('userId', user.id)
      .preload('pet')
      .first()

    if (!assessment) {
      return response.notFound({ success: false, message: 'Bilan introuvable' })
    }

    return response.ok({ success: true, data: this.serialize(assessment, assessment.pet) })
  }

  /**
   * Génère (ou régénère) le plan d'éducation. Premium.
   * POST /training/assessments/:id/plan
   */
  async generatePlan({ params, auth, response }: HttpContext) {
    const user = auth.user!

    const assessment = await TrainingAssessment.query()
      .where('id', params.id)
      .where('userId', user.id)
      .preload('pet', (query) => query.preload('healthBook'))
      .first()

    if (!assessment) {
      return response.notFound({ success: false, message: 'Bilan introuvable' })
    }

    // Un plan déjà généré est renvoyé tel quel : régénérer coûterait un appel
    // au modèle pour un résultat équivalent, et le propriétaire perdrait le
    // plan qu'il a commencé à suivre.
    if (assessment.planStatus === 'completed' && assessment.plan) {
      const program = await this.ensureProgram(assessment)
      return response.ok({
        success: true,
        data: this.serialize(assessment, assessment.pet, program?.id ?? null),
      })
    }

    assessment.planStatus = 'processing'
    assessment.planError = null
    await assessment.save()

    try {
      const scoring = this.training.scoreAnswers(assessment.answers)
      const { plan, fromAi } = await this.training.generatePlan({
        pet: assessment.pet,
        scoring,
        context: assessment.context,
        healthBook: assessment.pet.healthBook ?? null,
      })

      assessment.plan = plan
      assessment.planFromAi = fromAi
      assessment.planStatus = 'completed'
      assessment.planGeneratedAt = DateTime.now()
      await assessment.save()

      const program = await this.ensureProgram(assessment)

      return response.ok({
        success: true,
        data: this.serialize(assessment, assessment.pet, program?.id ?? null),
      })
    } catch (error) {
      logger.error({ err: error }, `[Training] Plan ${assessment.id} en échec`)
      assessment.planStatus = 'failed'
      assessment.planError = error instanceof Error ? error.message : 'Erreur inconnue'
      await assessment.save()

      return response.internalServerError({
        success: false,
        message: `Le plan n'a pas pu être généré : ${assessment.planError}`,
      })
    }
  }

  /**
   * DELETE /training/assessments/:id
   */
  async destroy({ params, auth, response }: HttpContext) {
    const user = auth.user!

    const assessment = await TrainingAssessment.query()
      .where('id', params.id)
      .where('userId', user.id)
      .first()

    if (!assessment) {
      return response.notFound({ success: false, message: 'Bilan introuvable' })
    }

    await assessment.delete()
    return response.ok({ success: true, message: 'Bilan supprimé' })
  }

  /**
   * Le programme naît avec le plan : sans lui, l'utilisateur repartirait avec
   * un document à lire au lieu d'un suivi.
   */
  private ensureProgram(assessment: TrainingAssessment) {
    return this.programs.ensureProgram(assessment)
  }

  private serialize(assessment: TrainingAssessment, pet: Pet, programId: number | null = null) {
    const level = LEVEL_LABELS[assessment.level] ?? LEVEL_LABELS.apprenti
    const weakest = [...TRAINING_AXES]
      .map((a) => a.key)
      .sort((a, b) => assessment.scores[a] - assessment.scores[b])

    return {
      id: assessment.id,
      petId: assessment.petId,
      petName: pet?.name ?? null,
      petBreed: pet?.breed ?? null,
      scores: assessment.scores,
      overallScore: assessment.overallScore,
      level: assessment.level,
      levelLabel: level.label,
      levelMessage: level.message,
      strongest: weakest[weakest.length - 1],
      weakest: weakest.slice(0, 2),
      plan: assessment.plan,
      planStatus: assessment.planStatus,
      planFromAi: assessment.planFromAi,
      planError: assessment.planError,
      programId,
      createdAt: assessment.createdAt,
    }
  }
}
