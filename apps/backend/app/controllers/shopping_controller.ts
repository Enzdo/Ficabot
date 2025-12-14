import type { HttpContext } from '@adonisjs/core/http'
import ShoppingItem from '#models/shopping_item'

export default class ShoppingController {
  async index({ auth, response }: HttpContext) {
    const items = await ShoppingItem.query()
      .where('user_id', auth.user!.id)
      .orderBy('is_completed', 'asc')
      .orderBy('created_at', 'desc')
      .preload('pet')

    return response.ok({ success: true, data: items })
  }

  async store({ auth, request, response }: HttpContext) {
    const data = request.only(['name', 'category', 'quantity', 'unit', 'petId', 'notes'])
    
    const item = await ShoppingItem.create({
      userId: auth.user!.id,
      name: data.name,
      category: data.category || 'other',
      quantity: data.quantity || 1,
      unit: data.unit,
      petId: data.petId,
      notes: data.notes,
      isCompleted: false,
    })

    return response.created({ success: true, data: item })
  }

  async update({ params, auth, request, response }: HttpContext) {
    const item = await ShoppingItem.find(params.id)
    if (!item || item.userId !== auth.user!.id) {
      return response.notFound({ success: false, message: 'Article non trouvé' })
    }

    const data = request.only(['name', 'category', 'quantity', 'unit', 'notes', 'isCompleted'])
    item.merge(data)
    await item.save()

    return response.ok({ success: true, data: item })
  }

  async toggle({ params, auth, response }: HttpContext) {
    const item = await ShoppingItem.find(params.id)
    if (!item || item.userId !== auth.user!.id) {
      return response.notFound({ success: false, message: 'Article non trouvé' })
    }

    item.isCompleted = !item.isCompleted
    await item.save()

    return response.ok({ success: true, data: item })
  }

  async destroy({ params, auth, response }: HttpContext) {
    const item = await ShoppingItem.find(params.id)
    if (!item || item.userId !== auth.user!.id) {
      return response.notFound({ success: false, message: 'Article non trouvé' })
    }

    await item.delete()
    return response.ok({ success: true, message: 'Article supprimé' })
  }

  async clearCompleted({ auth, response }: HttpContext) {
    await ShoppingItem.query()
      .where('user_id', auth.user!.id)
      .where('is_completed', true)
      .delete()

    return response.ok({ success: true, message: 'Articles complétés supprimés' })
  }
}
