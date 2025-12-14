import vine from '@vinejs/vine'

export const createPetValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(1).maxLength(100),
    species: vine.enum(['dog', 'cat']),
    breed: vine.string().maxLength(100).optional(),
    birthDate: vine.string().optional(),
    weight: vine.number().positive().optional(),
    avatarUrl: vine.string().url().optional(),
  })
)

export const updatePetValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(1).maxLength(100).optional(),
    species: vine.enum(['dog', 'cat']).optional(),
    breed: vine.string().maxLength(100).optional().nullable(),
    birthDate: vine.string().optional().nullable(),
    weight: vine.number().positive().optional().nullable(),
    avatarUrl: vine.string().url().optional().nullable(),
  })
)
