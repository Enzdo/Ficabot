import { test } from '@japa/runner'
import TrainingService from '#services/training_service'
import {
  CONTEXT_QUESTIONS,
  TRAINING_AXES,
  TRAINING_QUESTIONS,
  type TrainingAxis,
} from '#services/training/questionnaire'

/** Répond à toutes les questions avec l'option d'index donné (0 = la meilleure). */
function answerAll(optionIndex: number): Record<string, string> {
  return Object.fromEntries(
    TRAINING_QUESTIONS.map((q) => [
      q.id,
      q.options[Math.min(optionIndex, q.options.length - 1)].value,
    ])
  )
}

const fullContext = Object.fromEntries(CONTEXT_QUESTIONS.map((q) => [q.id, q.options[0].value]))

test.group('TrainingService — notation', () => {
  test('le catalogue couvre les six axes', ({ assert }) => {
    const axes = new Set(TRAINING_QUESTIONS.map((q) => q.axis))
    assert.equal(axes.size, TRAINING_AXES.length)
    for (const axis of TRAINING_AXES) {
      assert.isTrue(axes.has(axis.key), `aucune question pour l'axe ${axis.key}`)
    }
  })

  test('chaque question propose une option parfaite et une option nulle', ({ assert }) => {
    for (const q of TRAINING_QUESTIONS) {
      const scores = q.options.map((o) => o.score)
      assert.include(scores, 1, `question ${q.id} sans option à 1`)
      assert.include(scores, 0, `question ${q.id} sans option à 0`)
    }
  })

  test('les identifiants de questions sont uniques', ({ assert }) => {
    const ids = [...TRAINING_QUESTIONS, ...CONTEXT_QUESTIONS].map((q) => q.id)
    assert.equal(new Set(ids).size, ids.length)
  })

  test('les meilleures réponses donnent 100 partout', ({ assert }) => {
    const result = new TrainingService().scoreAnswers(answerAll(0))
    assert.equal(result.overallScore, 100)
    assert.equal(result.level, 'expert')
    for (const axis of TRAINING_AXES) {
      assert.equal(result.scores[axis.key], 100)
    }
  })

  test('les pires réponses donnent 0 partout', ({ assert }) => {
    const result = new TrainingService().scoreAnswers(answerAll(3))
    assert.equal(result.overallScore, 0)
    assert.equal(result.level, 'debutant')
  })

  test("l'axe le plus faible remonte en tête des priorités", ({ assert }) => {
    const answers = answerAll(0)
    // On dégrade uniquement le rappel.
    for (const q of TRAINING_QUESTIONS.filter((x) => x.axis === 'recall')) {
      answers[q.id] = q.options[q.options.length - 1].value
    }

    const result = new TrainingService().scoreAnswers(answers)
    assert.equal(result.scores.recall, 0)
    assert.equal(result.scores.obedience, 100)
    assert.equal(result.weakest[0], 'recall' satisfies TrainingAxis)
  })

  test('un bilan incomplet est refusé', ({ assert }) => {
    const answers = answerAll(0)
    delete answers[TRAINING_QUESTIONS[0].id]

    const check = new TrainingService().validateAnswers(answers, fullContext)
    assert.isFalse(check.ok)
  })

  test('une option inconnue est refusée', ({ assert }) => {
    const answers = answerAll(0)
    answers[TRAINING_QUESTIONS[0].id] = 'valeur_bidon'

    const check = new TrainingService().validateAnswers(answers, fullContext)
    assert.isFalse(check.ok)
  })

  test('un bilan complet passe la validation', ({ assert }) => {
    const check = new TrainingService().validateAnswers(answerAll(1), fullContext)
    assert.isTrue(check.ok)
  })
})
