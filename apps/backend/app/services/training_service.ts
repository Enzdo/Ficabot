import OpenAI from 'openai'
import env from '#start/env'
import logger from '@adonisjs/core/services/logger'
import type Pet from '#models/pet'
import type { TrainingLevel } from '#models/training_assessment'
import {
  AXIS_LABEL,
  CONTEXT_BY_ID,
  QUESTIONS_BY_ID,
  TRAINING_AXES,
  TRAINING_QUESTIONS,
  CONTEXT_QUESTIONS,
  type TrainingAxis,
} from '#services/training/questionnaire'
import { buildFallbackPlan } from '#services/training/exercises'

export interface TrainingPlanExercise {
  title: string
  axis: TrainingAxis
  duration: string
  steps: string[]
  tip: string
}

export interface TrainingPlanWeek {
  week: number
  theme: string
  goal: string
  sessions: string
  exercises: TrainingPlanExercise[]
  successCriteria: string
}

export interface TrainingPlan {
  summary: string
  breedInsight: string
  priorities: { axis: TrainingAxis; title: string; why: string }[]
  weeks: TrainingPlanWeek[]
  dailyRoutine: string[]
  mistakesToAvoid: string[]
  whenToSeePro: string
}

export interface ScoringResult {
  scores: Record<TrainingAxis, number>
  overallScore: number
  level: TrainingLevel
  /** Axes du plus faible au plus fort — l'ordre de priorité du plan. */
  weakest: TrainingAxis[]
}

const SESSIONS_BY_TIME: Record<string, string> = {
  short: '2 séances de 4 minutes par jour',
  medium: '2 séances de 8 minutes par jour',
  long: '3 séances de 10 minutes par jour',
}

export default class TrainingService {
  /**
   * Note les réponses axe par axe.
   *
   * Une question sans réponse est ignorée plutôt que comptée à zéro : sinon un
   * bilan interrompu afficherait un chien « nul partout » alors qu'il n'a
   * simplement pas été évalué. Un axe sans aucune réponse retombe à 0 faute de
   * mieux, mais le contrôleur exige toutes les réponses en amont.
   */
  scoreAnswers(answers: Record<string, string>): ScoringResult {
    const totals = new Map<TrainingAxis, { sum: number; weight: number }>()
    for (const axis of TRAINING_AXES) totals.set(axis.key, { sum: 0, weight: 0 })

    for (const [questionId, optionValue] of Object.entries(answers)) {
      const question = QUESTIONS_BY_ID.get(questionId)
      if (!question) continue
      const option = question.options.find((o) => o.value === optionValue)
      if (!option) continue

      const bucket = totals.get(question.axis)!
      bucket.sum += option.score * question.weight
      bucket.weight += question.weight
    }

    const scores = {} as Record<TrainingAxis, number>
    for (const axis of TRAINING_AXES) {
      const { sum, weight } = totals.get(axis.key)!
      scores[axis.key] = weight > 0 ? Math.round((sum / weight) * 100) : 0
    }

    const values = Object.values(scores)
    const overallScore = Math.round(values.reduce((a, b) => a + b, 0) / values.length)

    const weakest = [...TRAINING_AXES]
      .map((a) => a.key)
      .sort((a, b) => scores[a] - scores[b])

    return { scores, overallScore, level: this.levelFor(overallScore), weakest }
  }

  levelFor(score: number): TrainingLevel {
    if (score < 35) return 'debutant'
    if (score < 60) return 'apprenti'
    if (score < 80) return 'confirme'
    return 'expert'
  }

  /**
   * Vérifie que le bilan est complet et que chaque valeur existe bien dans le
   * catalogue. On refuse plutôt que de deviner : une option inconnue fausserait
   * la note en silence.
   */
  validateAnswers(
    answers: Record<string, string>,
    context: Record<string, string>
  ): { ok: true } | { ok: false; message: string } {
    const missing = TRAINING_QUESTIONS.filter((q) => !answers[q.id])
    if (missing.length > 0) {
      return {
        ok: false,
        message: `Bilan incomplet : ${missing.length} question${missing.length > 1 ? 's' : ''} sans réponse.`,
      }
    }

    for (const [id, value] of Object.entries(answers)) {
      const question = QUESTIONS_BY_ID.get(id)
      if (!question) return { ok: false, message: `Question inconnue : ${id}` }
      if (!question.options.some((o) => o.value === value)) {
        return { ok: false, message: `Réponse invalide pour la question « ${question.text} »` }
      }
    }

    const missingContext = CONTEXT_QUESTIONS.filter((q) => !context[q.id])
    if (missingContext.length > 0) {
      return {
        ok: false,
        message: `Il manque ${missingContext.length} réponse${missingContext.length > 1 ? 's' : ''} sur votre situation.`,
      }
    }

    for (const [id, value] of Object.entries(context)) {
      const question = CONTEXT_BY_ID.get(id)
      if (!question) return { ok: false, message: `Question de contexte inconnue : ${id}` }
      if (!question.options.some((o) => o.value === value)) {
        return { ok: false, message: `Réponse invalide pour « ${question.text} »` }
      }
    }

    return { ok: true }
  }

  /**
   * Génère le plan sur quatre semaines.
   *
   * Les notes ne viennent jamais de l'IA : elles sont déjà calculées ici, et
   * seules la mise en forme du programme et l'adaptation à la race sont
   * confiées au modèle. Sans clé API ou en cas d'échec, on retombe sur la
   * bibliothèque d'exercices — un plan générique vaut mieux qu'un écran vide.
   */
  async generatePlan(params: {
    pet: Pet
    scoring: ScoringResult
    context: Record<string, string>
  }): Promise<{ plan: TrainingPlan; fromAi: boolean }> {
    const { pet, scoring, context } = params
    const sessions = SESSIONS_BY_TIME[context.ctx_time] ?? SESSIONS_BY_TIME.medium

    const fallback = () =>
      buildFallbackPlan({
        petName: pet.name,
        breed: pet.breed,
        scores: scoring.scores,
        weakest: scoring.weakest,
        axisLabel: AXIS_LABEL,
        sessionsPerDay: sessions,
      }) as TrainingPlan

    const apiKey = env.get('OPENAI_API_KEY')
    if (!apiKey) {
      logger.warn('[Training] OPENAI_API_KEY absente, plan générique servi')
      return { plan: fallback(), fromAi: false }
    }

    try {
      const client = new OpenAI({ apiKey })
      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.6,
        max_tokens: 4000,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: this.buildSystemPrompt() },
          { role: 'user', content: this.buildUserPrompt(pet, scoring, context, sessions) },
        ],
      })

      const raw = response.choices[0]?.message?.content
      if (!raw) throw new Error('Réponse vide du modèle')

      const parsed = JSON.parse(raw)
      const plan = this.normalizePlan(parsed, scoring)
      if (!plan) throw new Error('Plan incomplet renvoyé par le modèle')

      return { plan, fromAi: true }
    } catch (error) {
      logger.error({ err: error }, '[Training] Génération IA échouée, repli sur le plan générique')
      return { plan: fallback(), fromAi: false }
    }
  }

  private buildSystemPrompt(): string {
    return `Tu es éducateur canin professionnel, formé aux méthodes positives (renforcement positif, pas de coercition, pas de collier étrangleur ni électrique).

Tu rédiges un plan d'éducation de 4 semaines à partir d'un bilan déjà noté. Les notes te sont fournies : ne les recalcule pas, ne les commente pas comme si tu les avais établies.

Règles de fond :
- Écris en français, en tutoyant jamais : vouvoie le propriétaire.
- Adapte réellement le plan à la race indiquée (prédispositions, besoins de dépense, sensibilités connues). Si la race est absente, dis-le franchement.
- Un seul critère progresse à la fois : durée, distance OU distraction.
- Les exercices doivent être concrets et exécutables sans matériel spécifique.
- Ne promets jamais de résultat médical ni comportemental garanti.
- Si le bilan révèle une agression, une morsure ou une détresse de séparation sévère, dis clairement qu'un professionnel en présentiel est nécessaire.

Réponds UNIQUEMENT avec un objet JSON valide de cette forme exacte :
{
  "summary": "3 à 4 phrases sur l'état actuel du chien et le cap des 4 semaines",
  "breedInsight": "2 à 3 phrases sur ce que la race implique concrètement pour ce travail",
  "priorities": [{ "axis": "obedience|recall|leash|social|calm|daily", "title": "…", "why": "…" }],
  "weeks": [
    {
      "week": 1,
      "theme": "…",
      "goal": "…",
      "sessions": "…",
      "exercises": [
        { "title": "…", "axis": "obedience|recall|leash|social|calm|daily", "duration": "…", "steps": ["…", "…", "…", "…"], "tip": "…" }
      ],
      "successCriteria": "critère observable pour passer à la suite"
    }
  ],
  "dailyRoutine": ["…"],
  "mistakesToAvoid": ["…"],
  "whenToSeePro": "…"
}

Contraintes de format : exactement 4 semaines numérotées de 1 à 4, 2 ou 3 exercices par semaine, 3 à 5 étapes par exercice, 2 ou 3 priorités, 3 à 5 entrées dans dailyRoutine et mistakesToAvoid.`
  }

  private buildUserPrompt(
    pet: Pet,
    scoring: ScoringResult,
    context: Record<string, string>,
    sessions: string
  ): string {
    const age = pet.birthDate
      ? `${Math.floor(Math.abs(pet.birthDate.diffNow('months').months) / 12)} an(s) et ${
          Math.floor(Math.abs(pet.birthDate.diffNow('months').months)) % 12
        } mois`
      : 'non renseigné'

    const scoreLines = TRAINING_AXES.map(
      (a) => `- ${a.label} : ${scoring.scores[a.key]}/100`
    ).join('\n')

    const contextLines = CONTEXT_QUESTIONS.map((q) => {
      const chosen = q.options.find((o) => o.value === context[q.id])
      return chosen ? `- ${q.text} → ${chosen.label}` : null
    })
      .filter(Boolean)
      .join('\n')

    return `CHIEN
- Nom : ${pet.name}
- Race : ${pet.breed ?? 'non renseignée'}
- Âge : ${age}
- Poids : ${pet.weight ? `${pet.weight} kg` : 'non renseigné'}

BILAN (note globale ${scoring.overallScore}/100, niveau « ${scoring.level} »)
${scoreLines}

Axes du plus faible au plus fort : ${scoring.weakest.map((a) => AXIS_LABEL[a]).join(' → ')}

SITUATION DU PROPRIÉTAIRE
${contextLines}

Rythme réaliste à respecter dans le champ "sessions" : ${sessions}

Construis le plan en attaquant en priorité les deux axes les plus faibles, sans abandonner les autres.`
  }

  /**
   * Le modèle rend du JSON libre : on vérifie la forme avant de la stocker,
   * sinon l'app afficherait un plan à moitié vide sans que rien ne le signale.
   */
  private normalizePlan(raw: any, scoring: ScoringResult): TrainingPlan | null {
    if (!raw || typeof raw !== 'object') return null

    const axes = new Set(TRAINING_AXES.map((a) => a.key))
    const str = (v: unknown, fallback = ''): string => (typeof v === 'string' && v.trim() ? v.trim() : fallback)
    const list = (v: unknown): string[] =>
      Array.isArray(v) ? v.filter((x) => typeof x === 'string' && x.trim()).map((x) => x.trim()) : []

    const weeks: TrainingPlanWeek[] = Array.isArray(raw.weeks)
      ? raw.weeks
          .map((w: any, i: number): TrainingPlanWeek | null => {
            const exercises: TrainingPlanExercise[] = Array.isArray(w?.exercises)
              ? w.exercises
                  .map((e: any): TrainingPlanExercise | null => {
                    const steps = list(e?.steps)
                    const title = str(e?.title)
                    if (!title || steps.length === 0) return null
                    return {
                      title,
                      axis: axes.has(e?.axis) ? e.axis : scoring.weakest[0],
                      duration: str(e?.duration, '5 minutes'),
                      steps,
                      tip: str(e?.tip),
                    }
                  })
                  .filter(Boolean) as TrainingPlanExercise[]
              : []

            if (exercises.length === 0) return null
            return {
              week: typeof w?.week === 'number' ? w.week : i + 1,
              theme: str(w?.theme, `Semaine ${i + 1}`),
              goal: str(w?.goal),
              sessions: str(w?.sessions),
              exercises,
              successCriteria: str(w?.successCriteria),
            }
          })
          .filter(Boolean) as TrainingPlanWeek[]
      : []

    if (weeks.length < 3) return null

    const priorities = Array.isArray(raw.priorities)
      ? raw.priorities
          .filter((p: any) => p && axes.has(p.axis))
          .map((p: any) => ({
            axis: p.axis as TrainingAxis,
            title: str(p.title, AXIS_LABEL[p.axis as TrainingAxis]),
            why: str(p.why),
          }))
      : []

    const summary = str(raw.summary)
    if (!summary) return null

    return {
      summary,
      breedInsight: str(raw.breedInsight),
      priorities: priorities.length
        ? priorities
        : scoring.weakest.slice(0, 2).map((axis) => ({
            axis,
            title: AXIS_LABEL[axis],
            why: `Note actuelle : ${scoring.scores[axis]}/100.`,
          })),
      weeks,
      dailyRoutine: list(raw.dailyRoutine),
      mistakesToAvoid: list(raw.mistakesToAvoid),
      whenToSeePro: str(
        raw.whenToSeePro,
        "Consultez un éducateur canin comportementaliste en cas de grognement, de morsure ou de détresse lors des absences."
      ),
    }
  }
}
