import vine from '@vinejs/vine'

export const createMedicalRecordValidator = vine.compile(
  vine.object({
    type: vine.enum(['vaccine', 'treatment', 'visit']),
    title: vine.string().minLength(1).maxLength(200),
    description: vine.string().optional(),
    date: vine.string(),
    nextDueDate: vine.string().optional(),
    vetName: vine.string().maxLength(200).optional(),
  })
)

export const updateMedicalRecordValidator = vine.compile(
  vine.object({
    type: vine.enum(['vaccine', 'treatment', 'visit']).optional(),
    title: vine.string().minLength(1).maxLength(200).optional(),
    description: vine.string().optional().nullable(),
    date: vine.string().optional(),
    nextDueDate: vine.string().optional().nullable(),
    vetName: vine.string().maxLength(200).optional().nullable(),
  })
)
