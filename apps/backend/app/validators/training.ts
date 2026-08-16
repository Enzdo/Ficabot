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

export const toggleTrainingTaskValidator = vine.compile(
  vine.object({
    taskKey: vine.string().maxLength(80),
    // Optionnel : on écrit parfois une note sans toucher à la coche.
    done: vine.boolean().optional(),
    // `null` efface l'observation ; absent la laisse telle quelle.
    note: vine.string().maxLength(1000).nullable().optional(),
    // Le jour vient du téléphone : le serveur ne peut pas deviner le fuseau de
    // l'utilisateur, et cocher à 23h ne doit pas atterrir sur le lendemain.
    day: vine.string().fixedLength(10).optional(),
  })
)

export const trainingCheckinValidator = vine.compile(
  vine.object({
    answers: vine.record(vine.string().maxLength(40)),
    adherence: vine.record(vine.string().maxLength(40)),
  })
)
