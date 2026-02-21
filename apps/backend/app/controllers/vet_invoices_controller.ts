import type { HttpContext } from '@adonisjs/core/http'
import VetInvoice from '#models/vet_invoice'
import Veterinarian from '#models/veterinarian'
import { createInvoiceValidator, updateInvoiceStatusValidator } from '#validators/vet_invoice'
import { DateTime } from 'luxon'

export default class VetInvoicesController {
  async index({ request, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    const { status, search } = request.qs()

    let query = VetInvoice.query()
      .where('veterinarian_id', vet.id)
      .preload('items')
      .orderBy('created_at', 'desc')

    if (status && status !== 'all') {
      query = query.where('status', status)
    }

    if (search) {
      query = query.where((q) => {
        q.whereILike('number', `%${search}%`)
          .orWhereILike('client_name', `%${search}%`)
          .orWhereILike('pet_name', `%${search}%`)
      })
    }

    const invoices = await query

    return response.ok({ success: true, data: invoices })
  }

  async stats({ response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    const now = DateTime.now()
    const startOfMonth = now.startOf('month').toSQL()
    const endOfMonth = now.endOf('month').toSQL()

    const invoices = await VetInvoice.query()
      .where('veterinarian_id', vet.id)
      .whereBetween('date', [startOfMonth!, endOfMonth!])

    const total = invoices.reduce((sum, inv) => sum + Number(inv.total), 0)
    const paid = invoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + Number(inv.total), 0)
    const pending = invoices.filter(i => i.status === 'pending').reduce((sum, inv) => sum + Number(inv.total), 0)
    const overdue = invoices.filter(i => i.status === 'overdue').reduce((sum, inv) => sum + Number(inv.total), 0)

    return response.ok({
      success: true,
      data: {
        total,
        paid,
        paidCount: invoices.filter(i => i.status === 'paid').length,
        pending,
        pendingCount: invoices.filter(i => i.status === 'pending').length,
        overdue,
        overdueCount: invoices.filter(i => i.status === 'overdue').length,
      },
    })
  }

  async store({ request, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    const data = await request.validateUsing(createInvoiceValidator)

    const subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
    const taxRate = 20
    const tax = subtotal * (taxRate / 100)
    const total = subtotal + tax

    // Generate invoice number
    const count = await VetInvoice.query().where('veterinarian_id', vet.id).count('* as total')
    const num = Number(count[0].$extras.total) + 1
    const invoiceNumber = `FAC-${DateTime.now().year}-${String(num).padStart(3, '0')}`

    const invoice = await VetInvoice.create({
      veterinarianId: vet.id,
      number: invoiceNumber,
      clientName: data.clientName,
      clientEmail: data.clientEmail || null,
      petName: data.petName || null,
      date: data.date,
      dueDate: data.dueDate,
      subtotal,
      taxRate,
      tax,
      total,
      status: data.status || 'pending',
      notes: data.notes || null,
    })

    for (const item of data.items) {
      await invoice.related('items').create({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.quantity * item.unitPrice,
      })
    }

    await invoice.load('items')

    return response.created({ success: true, data: invoice })
  }

  async show({ params, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    const invoice = await VetInvoice.query()
      .where('id', params.id)
      .where('veterinarian_id', vet.id)
      .preload('items')
      .first()

    if (!invoice) {
      return response.notFound({ success: false, message: 'Facture non trouvée' })
    }

    return response.ok({ success: true, data: invoice })
  }

  async updateStatus({ params, request, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    const { status } = await request.validateUsing(updateInvoiceStatusValidator)

    const invoice = await VetInvoice.query()
      .where('id', params.id)
      .where('veterinarian_id', vet.id)
      .first()

    if (!invoice) {
      return response.notFound({ success: false, message: 'Facture non trouvée' })
    }

    invoice.status = status
    if (status === 'paid') {
      invoice.paidAt = DateTime.now()
    }
    await invoice.save()

    return response.ok({ success: true, data: invoice })
  }

  async destroy({ params, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    const invoice = await VetInvoice.query()
      .where('id', params.id)
      .where('veterinarian_id', vet.id)
      .first()

    if (!invoice) {
      return response.notFound({ success: false, message: 'Facture non trouvée' })
    }

    await invoice.delete()
    return response.ok({ success: true, message: 'Facture supprimée' })
  }
}
