import type { HttpContext } from '@adonisjs/core/http'
import Veterinarian from '#models/veterinarian'
import VetPrescription from '#models/vet_prescription'
import VetPrescriptionItem from '#models/vet_prescription_item'
import VetInventoryItem from '#models/vet_inventory_item'
import VetInventoryMovement from '#models/vet_inventory_movement'
import HealthBook from '#models/health_book'

export default class VetPrescriptionsController {
  async index({ request, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    const { status, petId, search } = request.qs()

    const query = VetPrescription.query()
      .where('veterinarian_id', vet.id)
      .preload('items')
      .orderBy('date', 'desc')

    if (status) query.where('status', status)
    if (petId) query.where('pet_id', petId)
    if (search) {
      query.where((q) => {
        q.where('pet_name', 'ilike', `%${search}%`)
          .orWhere('client_name', 'ilike', `%${search}%`)
          .orWhere('diagnosis', 'ilike', `%${search}%`)
      })
    }

    const prescriptions = await query

    return response.ok({
      success: true,
      data: prescriptions.map((p) => ({
        id: p.id,
        date: p.date,
        petName: p.petName,
        clientName: p.clientName,
        petId: p.petId,
        diagnosis: p.diagnosis,
        notes: p.notes,
        status: p.status,
        items: p.items.map((i) => ({
          id: i.id,
          medicationName: i.medicationName,
          dosage: i.dosage,
          frequency: i.frequency,
          duration: i.duration,
          instructions: i.instructions,
          quantity: i.quantity,
        })),
        createdAt: p.createdAt,
      })),
    })
  }

  async store({ request, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    const { date, petId, userId, petName, clientName, diagnosis, notes, items } = request.only([
      'date', 'petId', 'userId', 'petName', 'clientName', 'diagnosis', 'notes', 'items',
    ])

    if (!items || !Array.isArray(items) || items.length === 0) {
      return response.badRequest({
        success: false,
        message: 'Au moins un médicament est requis',
      })
    }

    const prescription = await VetPrescription.create({
      veterinarianId: vet.id,
      date: date || new Date().toISOString().split('T')[0],
      petId,
      userId,
      petName,
      clientName,
      diagnosis,
      notes,
      status: 'active',
    })

    for (const item of items) {
      await VetPrescriptionItem.create({
        prescriptionId: prescription.id,
        medicationName: item.medicationName,
        dosage: item.dosage,
        frequency: item.frequency,
        duration: item.duration,
        instructions: item.instructions || null,
        quantity: item.quantity || 1,
      })
    }

    await prescription.load('items')

    // Auto-destock inventory items matching medication names
    try {
      for (const item of items) {
        const inventoryItem = await VetInventoryItem.query()
          .where('veterinarian_id', vet.id)
          .where('is_active', true)
          .where('name', 'ilike', `%${item.medicationName}%`)
          .first()

        if (inventoryItem && inventoryItem.quantity >= (item.quantity || 1)) {
          inventoryItem.quantity -= item.quantity || 1
          await inventoryItem.save()

          await VetInventoryMovement.create({
            itemId: inventoryItem.id,
            type: 'out',
            quantity: item.quantity || 1,
            reason: `Ordonnance #${prescription.id} - ${petName || clientName}`,
            notes: `Auto-déstock: ${item.medicationName}`,
          })
        }
      }
    } catch (e) {
      console.error('Auto-destock error (non-blocking):', e)
    }

    // Auto-update pet health book if petId is provided
    if (petId) {
      try {
        const healthBook = await HealthBook.query().where('pet_id', petId).first()
        if (healthBook) {
          const currentMedications = healthBook.parseArrayField(healthBook.medications)
          const currentVisits = healthBook.parseArrayField(healthBook.vetVisits)

          for (const item of items) {
            currentMedications.push({
              name: item.medicationName,
              dosage: item.dosage || '',
              frequency: item.frequency || '',
              startDate: date || new Date().toISOString().split('T')[0],
              endDate: null,
              prescribedBy: `Dr. ${vet.firstName || ''} ${vet.lastName || ''}`.trim(),
            })
          }

          currentVisits.push({
            date: date || new Date().toISOString().split('T')[0],
            reason: 'Ordonnance',
            diagnosis: diagnosis || '',
            treatment: items.map((i: any) => i.medicationName).join(', '),
            vetName: `Dr. ${vet.firstName || ''} ${vet.lastName || ''}`.trim(),
            clinic: vet.clinicName || '',
            notes: notes || '',
            cost: null,
          })

          healthBook.medications = currentMedications as any
          healthBook.vetVisits = currentVisits as any
          await healthBook.save()
        }
      } catch (e) {
        console.error('Auto health book update error (non-blocking):', e)
      }
    }

    return response.created({
      success: true,
      data: {
        id: prescription.id,
        date: prescription.date,
        petName: prescription.petName,
        clientName: prescription.clientName,
        diagnosis: prescription.diagnosis,
        status: prescription.status,
        items: prescription.items.map((i) => ({
          id: i.id,
          medicationName: i.medicationName,
          dosage: i.dosage,
          frequency: i.frequency,
          duration: i.duration,
          instructions: i.instructions,
          quantity: i.quantity,
        })),
      },
    })
  }

  async show({ params, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian

    const prescription = await VetPrescription.query()
      .where('id', params.id)
      .where('veterinarian_id', vet.id)
      .preload('items')
      .first()

    if (!prescription) {
      return response.notFound({ success: false, message: 'Ordonnance non trouvée' })
    }

    return response.ok({
      success: true,
      data: {
        id: prescription.id,
        date: prescription.date,
        petId: prescription.petId,
        userId: prescription.userId,
        petName: prescription.petName,
        clientName: prescription.clientName,
        diagnosis: prescription.diagnosis,
        notes: prescription.notes,
        status: prescription.status,
        items: prescription.items.map((i) => ({
          id: i.id,
          medicationName: i.medicationName,
          dosage: i.dosage,
          frequency: i.frequency,
          duration: i.duration,
          instructions: i.instructions,
          quantity: i.quantity,
        })),
        createdAt: prescription.createdAt,
      },
    })
  }

  async update({ params, request, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian

    const prescription = await VetPrescription.query()
      .where('id', params.id)
      .where('veterinarian_id', vet.id)
      .first()

    if (!prescription) {
      return response.notFound({ success: false, message: 'Ordonnance non trouvée' })
    }

    const { status } = request.only(['status'])
    if (status) prescription.status = status
    await prescription.save()

    return response.ok({ success: true, message: 'Ordonnance mise à jour' })
  }

  async destroy({ params, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian

    const prescription = await VetPrescription.query()
      .where('id', params.id)
      .where('veterinarian_id', vet.id)
      .first()

    if (!prescription) {
      return response.notFound({ success: false, message: 'Ordonnance non trouvée' })
    }

    await prescription.delete()
    return response.ok({ success: true, message: 'Ordonnance supprimée' })
  }
}
