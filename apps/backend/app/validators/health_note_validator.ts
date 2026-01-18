import vine from '@vinejs/vine'

export const createHealthNoteValidator = vine.compile(
    vine.object({
        type: vine.enum(['symptom', 'observation', 'medication', 'general']),
        content: vine.string().trim().minLength(1).maxLength(5000),
        date: vine.date().optional(),
    })
)
