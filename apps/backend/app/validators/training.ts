import vine from '@vinejs/vine'

/**
 * Le contenu exact des réponses est vérifié par `TrainingService.validateAnswers`
 * contre le catalogue de questions : vine ne fait ici que garantir la forme
 * (deux dictionnaires de chaînes) pour éviter d'avoir à typer tous les ids.
 */
export const createTrainingAssessmentValidator = vine.compile(
  vine.object({
    answers: vine.record(vine.string().maxLength(40)),
    context: vine.record(vine.string().maxLength(40)),
  })
)
