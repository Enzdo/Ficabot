import vine from '@vinejs/vine'

export const chatValidator = vine.compile(
  vine.object({
    petId: vine.number().optional(),
    message: vine.string().minLength(1).maxLength(2000),
  })
)
