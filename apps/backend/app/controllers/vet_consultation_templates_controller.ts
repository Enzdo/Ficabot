import type { HttpContext } from '@adonisjs/core/http'
import Veterinarian from '#models/veterinarian'
import VetConsultationTemplate from '#models/vet_consultation_template'

export default class VetConsultationTemplatesController {
  async index({ response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian

    const templates = await VetConsultationTemplate.query()
      .where('veterinarian_id', vet.id)
      .orderBy('name', 'asc')

    return response.ok({
      success: true,
      data: templates.map((t) => ({
        id: t.id,
        name: t.name,
        type: t.type,
        defaultDuration: t.defaultDuration,
        defaultNotes: t.defaultNotes,
        defaultItems: t.defaultItems,
        isActive: t.isActive,
      })),
    })
  }

  async store({ request, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    const data = request.only(['name', 'type', 'defaultDuration', 'defaultNotes', 'defaultItems'])

    const template = await VetConsultationTemplate.create({
      veterinarianId: vet.id,
      ...data,
      isActive: true,
    })

    return response.created({
      success: true,
      data: {
        id: template.id,
        name: template.name,
        type: template.type,
        defaultDuration: template.defaultDuration,
        defaultNotes: template.defaultNotes,
        defaultItems: template.defaultItems,
        isActive: template.isActive,
      },
    })
  }

  async update({ params, request, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    const template = await VetConsultationTemplate.query()
      .where('id', params.id)
      .where('veterinarian_id', vet.id)
      .first()

    if (!template) {
      return response.notFound({ success: false, message: 'Template non trouvé' })
    }

    const data = request.only(['name', 'type', 'defaultDuration', 'defaultNotes', 'defaultItems', 'isActive'])
    template.merge(data)
    await template.save()

    return response.ok({
      success: true,
      data: {
        id: template.id,
        name: template.name,
        type: template.type,
        defaultDuration: template.defaultDuration,
        defaultNotes: template.defaultNotes,
        defaultItems: template.defaultItems,
        isActive: template.isActive,
      },
    })
  }

  async destroy({ params, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    const template = await VetConsultationTemplate.query()
      .where('id', params.id)
      .where('veterinarian_id', vet.id)
      .first()

    if (!template) {
      return response.notFound({ success: false, message: 'Template non trouvé' })
    }

    await template.delete()
    return response.ok({ success: true, message: 'Template supprimé' })
  }
}
