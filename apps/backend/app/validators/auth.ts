import vine from '@vinejs/vine'

export const registerValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail(),
    password: vine.string().minLength(8),
    // Envoyés par les formulaires d'inscription web et mobile : sans ces règles,
    // la validation les supprimait silencieusement du payload.
    firstName: vine.string().trim().maxLength(100).optional(),
    lastName: vine.string().trim().maxLength(100).optional(),
  })
)

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail(),
    password: vine.string().minLength(1),
  })
)
