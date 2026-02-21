import type { HttpContext } from '@adonisjs/core/http'
import Veterinarian from '#models/veterinarian'
import VetInventoryItem from '#models/vet_inventory_item'
import VetInventoryMovement from '#models/vet_inventory_movement'

export default class VetInventoryController {
  async index({ response, auth, request }: HttpContext) {
    const vet = auth.user as Veterinarian
    const { category, search, lowStock } = request.qs()

    let query = VetInventoryItem.query()
      .where('veterinarian_id', vet.id)
      .where('is_active', true)
      .orderBy('name', 'asc')

    if (category) query = query.where('category', category)
    if (search) query = query.where('name', 'ILIKE', `%${search}%`)
    if (lowStock === 'true') query = query.whereRaw('quantity <= min_stock')

    const items = await query

    return response.ok({
      success: true,
      data: items.map((i) => ({
        id: i.id,
        name: i.name,
        category: i.category,
        sku: i.sku,
        quantity: i.quantity,
        unit: i.unit,
        minStock: i.minStock,
        price: Number(i.price),
        supplier: i.supplier,
        expiryDate: i.expiryDate,
        notes: i.notes,
        isLowStock: i.quantity <= i.minStock,
      })),
    })
  }

  async stats({ response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian

    const items = await VetInventoryItem.query()
      .where('veterinarian_id', vet.id)
      .where('is_active', true)

    const totalItems = items.length
    const lowStockCount = items.filter((i) => i.quantity <= i.minStock).length
    const totalValue = items.reduce((sum, i) => sum + i.quantity * Number(i.price), 0)
    const expiredCount = items.filter(
      (i) => i.expiryDate && new Date(i.expiryDate) < new Date()
    ).length

    return response.ok({
      success: true,
      data: { totalItems, lowStockCount, totalValue, expiredCount },
    })
  }

  async store({ request, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    const data = request.only([
      'name',
      'category',
      'sku',
      'quantity',
      'unit',
      'minStock',
      'price',
      'supplier',
      'expiryDate',
      'notes',
    ])

    const item = await VetInventoryItem.create({
      veterinarianId: vet.id,
      ...data,
      isActive: true,
    })

    if (data.quantity > 0) {
      await VetInventoryMovement.create({
        itemId: item.id,
        type: 'in',
        quantity: data.quantity,
        reason: 'Stock initial',
      })
    }

    return response.created({
      success: true,
      data: {
        id: item.id,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        minStock: item.minStock,
        price: Number(item.price),
        supplier: item.supplier,
        isLowStock: item.quantity <= item.minStock,
      },
    })
  }

  async update({ params, request, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    const item = await VetInventoryItem.query()
      .where('id', params.id)
      .where('veterinarian_id', vet.id)
      .first()

    if (!item) {
      return response.notFound({ success: false, message: 'Article non trouvé' })
    }

    const data = request.only([
      'name',
      'category',
      'sku',
      'unit',
      'minStock',
      'price',
      'supplier',
      'expiryDate',
      'notes',
    ])
    item.merge(data)
    await item.save()

    return response.ok({ success: true, data: item })
  }

  async addMovement({ params, request, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    const item = await VetInventoryItem.query()
      .where('id', params.id)
      .where('veterinarian_id', vet.id)
      .first()

    if (!item) {
      return response.notFound({ success: false, message: 'Article non trouvé' })
    }

    const { type, quantity, reason, notes } = request.only(['type', 'quantity', 'reason', 'notes'])

    if (type === 'out' && item.quantity < quantity) {
      return response.badRequest({ success: false, message: 'Stock insuffisant' })
    }

    await VetInventoryMovement.create({
      itemId: item.id,
      type,
      quantity,
      reason,
      notes,
    })

    if (type === 'in') {
      item.quantity += quantity
    } else if (type === 'out') {
      item.quantity -= quantity
    } else {
      item.quantity = quantity
    }
    await item.save()

    return response.ok({
      success: true,
      data: { id: item.id, quantity: item.quantity, isLowStock: item.quantity <= item.minStock },
    })
  }

  async movements({ params, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    const item = await VetInventoryItem.query()
      .where('id', params.id)
      .where('veterinarian_id', vet.id)
      .first()

    if (!item) {
      return response.notFound({ success: false, message: 'Article non trouvé' })
    }

    const movements = await VetInventoryMovement.query()
      .where('item_id', item.id)
      .orderBy('created_at', 'desc')
      .limit(50)

    return response.ok({ success: true, data: movements })
  }

  async destroy({ params, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    const item = await VetInventoryItem.query()
      .where('id', params.id)
      .where('veterinarian_id', vet.id)
      .first()

    if (!item) {
      return response.notFound({ success: false, message: 'Article non trouvé' })
    }

    item.isActive = false
    await item.save()
    return response.ok({ success: true, message: 'Article supprimé' })
  }
}
