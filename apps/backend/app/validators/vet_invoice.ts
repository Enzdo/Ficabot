import vine from '@vinejs/vine'

export const createInvoiceValidator = vine.compile(
  vine.object({
    clientName: vine.string(),
    clientEmail: vine.string().email().optional(),
    petName: vine.string().optional(),
    date: vine.string(),
    dueDate: vine.string(),
    notes: vine.string().optional(),
    status: vine.enum(['draft', 'pending']).optional(),
    items: vine.array(
      vine.object({
        description: vine.string(),
        quantity: vine.number().min(1),
        unitPrice: vine.number().min(0),
      })
    ).minLength(1),
  })
)

export const updateInvoiceStatusValidator = vine.compile(
  vine.object({
    status: vine.enum(['draft', 'pending', 'paid', 'overdue']),
  })
)
