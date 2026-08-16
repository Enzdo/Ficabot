/**
 * Bilan de fin de semaine.
 *
 * On ne repose pas les 36 questions : seules les questions des axes réellement
 * travaillés dans la semaine écoulée sont rejouées. Les autres axes gardent
 * leur note — les renoter sans avoir rien travaillé ferait bouger le score sur
 * du bruit, et 30 questions par semaine feraient abandonner l'utilisateur bien
 * avant la fin du cycle.
 *
 * S'y ajoutent deux questions d'assiduité, qui ne comptent pas dans les notes
 * mais nourrissent la génération du cycle suivant : un plan non suivi ne se
 * corrige pas comme un plan suivi sans résultat.
 */

import {
  QUESTIONS_BY_ID,
  TRAINING_QUESTIONS,
  type TrainingAxis,
  type TrainingQuestion,
} from './questionnaire.js'
import type { TrainingPlanWeek } from '../training_service.js'

export interface AdherenceQuestion {
  id: string
  text: string
  help?: string
  options: { value: string; label: string; score: number }[]
}

export const ADHERENCE_QUESTIONS: AdherenceQuestion[] = [
  {
    id: 'chk_sessions',
    text: 'Combien de séances avez-vous réellement faites cette semaine ?',
    help: 'Répondez honnêtement : le plan de la semaine suivante en dépend.',
    options: [
      { value: 'daily', label: 'Presque tous les jours', score: 1 },
      { value: 'often', label: '3 à 5 fois', score: 0.66 },
      { value: 'few', label: '1 ou 2 fois', score: 0.33 },
      { value: 'none', label: 'Aucune, la semaine a été compliquée', score: 0 },
    ],
  },
  {
    id: 'chk_goal',
    text: "Où en êtes-vous sur l'objectif de la semaine ?",
    options: [
      { value: 'reached', label: "C'est acquis, il le fait sans hésiter", score: 1 },
      { value: 'close', label: 'Presque, ça marche une fois sur deux', score: 0.66 },
      { value: 'started', label: 'On a commencé, mais c\'est encore fragile', score: 0.33 },
      { value: 'stuck', label: 'On bloque, je ne vois pas de progrès', score: 0 },
    ],
  },
]

export const ADHERENCE_BY_ID = new Map(ADHERENCE_QUESTIONS.map((q) => [q.id, q]))

/** Axes distincts travaillés dans une semaine du plan, dans l'ordre d'apparition. */
export function axesOfWeek(week: TrainingPlanWeek | undefined): TrainingAxis[] {
  if (!week) return []
  const seen: TrainingAxis[] = []
  for (const exercise of week.exercises) {
    if (!seen.includes(exercise.axis)) seen.push(exercise.axis)
  }
  return seen
}

export interface CheckinQuestionnaire {
  week: number
  cycle: number
  theme: string
  successCriteria: string
  axes: TrainingAxis[]
  questions: TrainingQuestion[]
  adherenceQuestions: AdherenceQuestion[]
}

/**
 * Construit le questionnaire hebdomadaire. Si la semaine ne cible aucun axe
 * exploitable (plan abîmé, exercices sans axe), on retombe sur les deux axes
 * les plus faibles : mieux vaut un bilan approximatif qu'un écran vide qui
 * bloquerait la progression du programme.
 */
export function buildCheckin(params: {
  week: TrainingPlanWeek | undefined
  weekNumber: number
  cycle: number
  scores: Record<TrainingAxis, number>
}): CheckinQuestionnaire {
  const { week, weekNumber, cycle, scores } = params

  let axes = axesOfWeek(week)
  if (axes.length === 0) {
    axes = (Object.keys(scores) as TrainingAxis[]).sort((a, b) => scores[a] - scores[b]).slice(0, 2)
  }
  // Au-delà de trois axes le bilan redevient long : on garde les plus faibles.
  if (axes.length > 3) {
    axes = [...axes].sort((a, b) => scores[a] - scores[b]).slice(0, 3)
  }

  const questions = TRAINING_QUESTIONS.filter((q) => axes.includes(q.axis))

  return {
    week: weekNumber,
    cycle,
    theme: week?.theme ?? `Semaine ${weekNumber}`,
    successCriteria: week?.successCriteria ?? '',
    axes,
    questions,
    adherenceQuestions: ADHERENCE_QUESTIONS,
  }
}

/**
 * Renote les seuls axes rejoués et laisse les autres inchangés.
 * Renvoie aussi le delta par axe, pour que l'app puisse dire « +12 » plutôt
 * que d'obliger l'utilisateur à comparer deux chiffres de tête.
 */
export function applyCheckinScores(params: {
  previous: Record<TrainingAxis, number>
  answers: Record<string, string>
  axes: TrainingAxis[]
}): {
  scores: Record<TrainingAxis, number>
  deltas: Record<string, number>
  overallScore: number
} {
  const { previous, answers, axes } = params
  const scores = { ...previous }
  const deltas: Record<string, number> = {}

  for (const axis of axes) {
    let sum = 0
    let weight = 0
    for (const [id, value] of Object.entries(answers)) {
      const question = QUESTIONS_BY_ID.get(id)
      if (!question || question.axis !== axis) continue
      const option = question.options.find((o) => o.value === value)
      if (!option) continue
      sum += option.score * question.weight
      weight += question.weight
    }
    // Un axe sans aucune réponse exploitable garde sa note plutôt que de
    // retomber à zéro et de faire chuter le score global sans raison.
    if (weight === 0) continue

    const next = Math.round((sum / weight) * 100)
    deltas[axis] = next - previous[axis]
    scores[axis] = next
  }

  const values = Object.values(scores)
  const overallScore = Math.round(values.reduce((a, b) => a + b, 0) / values.length)

  return { scores, deltas, overallScore }
}
