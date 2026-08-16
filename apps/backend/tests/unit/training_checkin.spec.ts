import { test } from '@japa/runner'
import { applyCheckinScores, axesOfWeek, buildCheckin } from '#services/training/checkin'
import { TRAINING_QUESTIONS, type TrainingAxis } from '#services/training/questionnaire'
import type { TrainingPlanWeek } from '#services/training_service'

const BASE_SCORES: Record<TrainingAxis, number> = {
  obedience: 70,
  recall: 30,
  leash: 45,
  social: 80,
  calm: 55,
  daily: 65,
}

function weekWith(axes: TrainingAxis[]): TrainingPlanWeek {
  return {
    week: 1,
    theme: 'Test',
    goal: 'Test',
    sessions: '2 séances',
    successCriteria: 'Test',
    exercises: axes.map((axis) => ({
      title: `Exercice ${axis}`,
      axis,
      duration: '5 min',
      steps: ['a', 'b'],
      tip: 'x',
    })),
  }
}

/** Répond à toutes les questions d'un axe avec l'option d'index donné. */
function answerAxis(axis: TrainingAxis, optionIndex: number): Record<string, string> {
  return Object.fromEntries(
    TRAINING_QUESTIONS.filter((q) => q.axis === axis).map((q) => [
      q.id,
      q.options[Math.min(optionIndex, q.options.length - 1)].value,
    ])
  )
}

test.group('Bilan hebdomadaire — construction', () => {
  test('ne repose que les questions des axes travaillés', ({ assert }) => {
    const checkin = buildCheckin({
      week: weekWith(['recall', 'leash']),
      weekNumber: 2,
      cycle: 1,
      scores: BASE_SCORES,
    })

    assert.deepEqual(checkin.axes, ['recall', 'leash'])
    const axes = new Set(checkin.questions.map((q) => q.axis))
    assert.deepEqual([...axes].sort(), ['leash', 'recall'])
    assert.isBelow(checkin.questions.length, TRAINING_QUESTIONS.length)
  })

  test('dédoublonne les axes répétés dans une semaine', ({ assert }) => {
    assert.deepEqual(axesOfWeek(weekWith(['recall', 'recall', 'calm'])), ['recall', 'calm'])
  })

  test('retombe sur les deux axes les plus faibles si la semaine est vide', ({ assert }) => {
    const checkin = buildCheckin({
      week: undefined,
      weekNumber: 1,
      cycle: 1,
      scores: BASE_SCORES,
    })

    // recall (30) puis leash (45) sont les plus faibles.
    assert.deepEqual(checkin.axes, ['recall', 'leash'])
    assert.isAbove(checkin.questions.length, 0)
  })

  test('plafonne à trois axes pour ne pas rallonger le bilan', ({ assert }) => {
    const checkin = buildCheckin({
      week: weekWith(['obedience', 'recall', 'leash', 'social', 'calm']),
      weekNumber: 3,
      cycle: 1,
      scores: BASE_SCORES,
    })

    assert.lengthOf(checkin.axes, 3)
  })

  test('deux questions d\'assiduité accompagnent toujours le bilan', ({ assert }) => {
    const checkin = buildCheckin({
      week: weekWith(['recall']),
      weekNumber: 1,
      cycle: 1,
      scores: BASE_SCORES,
    })
    assert.lengthOf(checkin.adherenceQuestions, 2)
  })
})

test.group('Bilan hebdomadaire — notation', () => {
  test('renote les axes rejoués et laisse les autres intacts', ({ assert }) => {
    const { scores, deltas } = applyCheckinScores({
      previous: BASE_SCORES,
      answers: answerAxis('recall', 0), // meilleures réponses
      axes: ['recall'],
    })

    assert.equal(scores.recall, 100)
    assert.equal(deltas.recall, 70)
    // Les autres axes n'ont pas bougé d'un point.
    assert.equal(scores.obedience, BASE_SCORES.obedience)
    assert.equal(scores.social, BASE_SCORES.social)
    assert.isUndefined(deltas.social)
  })

  test('une régression est bien reflétée par un delta négatif', ({ assert }) => {
    const { scores, deltas } = applyCheckinScores({
      previous: BASE_SCORES,
      answers: answerAxis('social', 3), // pires réponses
      axes: ['social'],
    })

    assert.equal(scores.social, 0)
    assert.equal(deltas.social, -80)
  })

  test('un axe sans réponse exploitable garde sa note', ({ assert }) => {
    const { scores, deltas } = applyCheckinScores({
      previous: BASE_SCORES,
      answers: {},
      axes: ['recall'],
    })

    assert.equal(scores.recall, BASE_SCORES.recall)
    assert.isUndefined(deltas.recall)
  })

  test('la note globale suit la moyenne des six axes', ({ assert }) => {
    const { scores, overallScore } = applyCheckinScores({
      previous: BASE_SCORES,
      answers: answerAxis('recall', 0),
      axes: ['recall'],
    })

    const expected = Math.round(
      Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length
    )
    assert.equal(overallScore, expected)
    // 30 → 100 sur un axe sur six : la globale doit monter.
    assert.isAbove(overallScore, 57)
  })
})
