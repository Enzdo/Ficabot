import type { HttpContext } from '@adonisjs/core/http'
import Expense from '#models/expense'
import Pet from '#models/pet'

export default class ExpensesController {
  async index({ auth, request, response }: HttpContext) {
    const petId = request.input('petId')
    
    let query = Expense.query().where('user_id', auth.user!.id)
    
    if (petId) {
      query = query.where('pet_id', petId)
    }
    
    const expenses = await query.orderBy('expense_date', 'desc').preload('pet')

    // Calculate totals by category
    const totals = await Expense.query()
      .where('user_id', auth.user!.id)
      .select('category')
      .sum('amount as total')
      .groupBy('category')

    return response.ok({ 
      success: true, 
      data: expenses,
      totals: totals.reduce((acc: any, t: any) => {
        acc[t.category] = parseFloat(t.$extras.total || 0)
        return acc
      }, {})
    })
  }

  async store({ auth, request, response }: HttpContext) {
    const data = request.only(['petId', 'category', 'title', 'description', 'amount', 'expenseDate', 'receiptUrl'])
    
    // Verify pet ownership if petId provided
    if (data.petId) {
      const pet = await Pet.find(data.petId)
      if (!pet || pet.userId !== auth.user!.id) {
        return response.notFound({ success: false, message: 'Animal non trouvé' })
      }
    }

    const expense = await Expense.create({
      userId: auth.user!.id,
      petId: data.petId,
      category: data.category,
      title: data.title,
      description: data.description,
      amount: data.amount,
      expenseDate: data.expenseDate,
      receiptUrl: data.receiptUrl,
    })

    return response.created({ success: true, data: expense })
  }

  async update({ params, auth, request, response }: HttpContext) {
    const expense = await Expense.find(params.id)
    if (!expense || expense.userId !== auth.user!.id) {
      return response.notFound({ success: false, message: 'Dépense non trouvée' })
    }

    const data = request.only(['category', 'title', 'description', 'amount', 'expenseDate', 'receiptUrl'])
    expense.merge(data)
    await expense.save()

    return response.ok({ success: true, data: expense })
  }

  async destroy({ params, auth, response }: HttpContext) {
    const expense = await Expense.find(params.id)
    if (!expense || expense.userId !== auth.user!.id) {
      return response.notFound({ success: false, message: 'Dépense non trouvée' })
    }

    await expense.delete()
    return response.ok({ success: true, message: 'Dépense supprimée' })
  }

  async stats({ auth, response }: HttpContext) {
    const thisMonth = new Date()
    thisMonth.setDate(1)
    
    const monthlyTotal = await Expense.query()
      .where('user_id', auth.user!.id)
      .where('expense_date', '>=', thisMonth.toISOString().split('T')[0])
      .sum('amount as total')

    const yearlyTotal = await Expense.query()
      .where('user_id', auth.user!.id)
      .whereRaw('strftime("%Y", expense_date) = ?', [new Date().getFullYear().toString()])
      .sum('amount as total')

    return response.ok({
      success: true,
      data: {
        monthly: parseFloat(monthlyTotal[0].$extras.total || 0),
        yearly: parseFloat(yearlyTotal[0].$extras.total || 0),
      }
    })
  }
}
