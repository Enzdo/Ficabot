import type { HttpContext } from '@adonisjs/core/http'
import Pet from '#models/pet'
import HealthNote from '#models/health_note'
import { createHealthNoteValidator } from '#validators/health_note_validator'

export default class HealthNotesController {
    /**
     * Get all health notes for a pet
     */
    async index({ auth, params, response }: HttpContext) {
        const pet = await Pet.findOrFail(params.id)

        // Verify ownership
        if (pet.userId !== auth.user!.id) {
            return response.forbidden({ message: 'Unauthorized' })
        }

        const notes = await HealthNote
            .query()
            .where('pet_id', pet.id)
            .orderBy('date', 'desc')
            .orderBy('created_at', 'desc')

        return response.ok({ data: notes })
    }

    /**
     * Create a new health note
     */
    async store({ auth, params, request, response }: HttpContext) {
        const pet = await Pet.findOrFail(params.id)

        // Verify ownership
        if (pet.userId !== auth.user!.id) {
            return response.forbidden({ message: 'Unauthorized' })
        }

        const data = await request.validateUsing(createHealthNoteValidator)

        const note = await HealthNote.create({
            petId: pet.id,
            type: data.type,
            content: data.content,
            date: data.date || new Date(),
        })

        return response.created({ data: note })
    }

    /**
     * Delete a health note
     */
    async destroy({ auth, params, response }: HttpContext) {
        const note = await HealthNote.query()
            .where('id', params.noteId)
            .preload('pet')
            .firstOrFail()

        // Verify ownership
        if (note.pet.userId !== auth.user!.id) {
            return response.forbidden({ message: 'Unauthorized' })
        }

        await note.delete()

        return response.ok({ message: 'Health note deleted' })
    }
}
