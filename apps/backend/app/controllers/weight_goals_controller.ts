import type { HttpContext } from '@adonisjs/core/http'
import WeightGoal from '#models/weight_goal'
import WeightHistory from '#models/weight_history'
import Pet from '#models/pet'
import { DateTime } from 'luxon'

export default class WeightGoalsController {
  async index({ params, auth, response }: HttpContext) {
    const pet = await Pet.find(params.petId)
    if (!pet || pet.userId !== auth.user!.id) {
      return response.notFound({ success: false, message: 'Animal non trouvé' })
    }

    const goals = await WeightGoal.query()
      .where('pet_id', params.petId)
      .orderBy('created_at', 'desc')

    return response.ok({ success: true, data: goals })
  }

  async show({ params, auth, response }: HttpContext) {
    const pet = await Pet.find(params.petId)
    if (!pet || pet.userId !== auth.user!.id) {
      return response.notFound({ success: false, message: 'Animal non trouvé' })
    }

    const goal = await WeightGoal.query()
      .where('pet_id', params.petId)
      .where('is_active', true)
      .first()

    if (!goal) {
      return response.ok({ success: true, data: null })
    }

    // Get weight history for the goal period
    const weightHistory = await WeightHistory.query()
      .where('pet_id', params.petId)
      .where('recorded_at', '>=', goal.startDate.toISODate()!)
      .orderBy('recorded_at', 'asc')

    return response.ok({
      success: true,
      data: {
        ...goal.serialize(),
        progressPercent: goal.progressPercent,
        remainingWeight: goal.remainingWeight,
        weightHistory: weightHistory.map(w => ({
          weight: w.weight,
          date: w.recordedAt,
        })),
      },
    })
  }

  async store({ params, auth, request, response }: HttpContext) {
    const pet = await Pet.find(params.petId)
    if (!pet || pet.userId !== auth.user!.id) {
      return response.notFound({ success: false, message: 'Animal non trouvé' })
    }

    // Deactivate any existing active goal
    await WeightGoal.query()
      .where('pet_id', params.petId)
      .where('is_active', true)
      .update({ isActive: false })

    const data = request.only([
      'startWeight', 'targetWeight', 'targetDate', 'goalType',
      'ownerNotes', 'dietPlan', 'exercisePlan', 'dailyCalories',
      'foodType', 'foodQuantity'
    ])

    const goal = await WeightGoal.create({
      petId: pet.id,
      startWeight: data.startWeight || pet.weight,
      targetWeight: data.targetWeight,
      currentWeight: data.startWeight || pet.weight,
      startDate: DateTime.now(),
      targetDate: data.targetDate ? DateTime.fromISO(data.targetDate) : null,
      goalType: data.goalType || 'lose',
      ownerNotes: data.ownerNotes,
      dietPlan: data.dietPlan,
      exercisePlan: data.exercisePlan,
      dailyCalories: data.dailyCalories,
      foodType: data.foodType,
      foodQuantity: data.foodQuantity,
      isActive: true,
      isCompleted: false,
    })

    return response.created({ success: true, data: goal })
  }

  async update({ params, auth, request, response }: HttpContext) {
    const pet = await Pet.find(params.petId)
    if (!pet || pet.userId !== auth.user!.id) {
      return response.notFound({ success: false, message: 'Animal non trouvé' })
    }

    const goal = await WeightGoal.find(params.id)
    if (!goal || goal.petId !== pet.id) {
      return response.notFound({ success: false, message: 'Objectif non trouvé' })
    }

    const data = request.only([
      'targetWeight', 'targetDate', 'ownerNotes', 'dietPlan',
      'exercisePlan', 'dailyCalories', 'foodType', 'foodQuantity'
    ])

    // Owner cannot modify vetNotes - only vet routes can
    goal.merge(data)
    await goal.save()

    return response.ok({ success: true, data: goal })
  }

  /**
   * Update vet notes on a diet program (vet-only route via vetToken)
   */
  async updateVetNotes({ params, request, response }: HttpContext) {
    const pet = await Pet.query().where('vetToken', params.token).first()
    if (!pet) {
      return response.notFound({ success: false, message: 'Patient non trouvé ou accès révoqué' })
    }

    const goal = await WeightGoal.query()
      .where('pet_id', pet.id)
      .where('is_active', true)
      .first()

    if (!goal) {
      return response.notFound({ success: false, message: 'Aucun programme actif' })
    }

    const { vetNotes } = request.only(['vetNotes'])
    goal.vetNotes = vetNotes
    await goal.save()

    return response.ok({ success: true, data: goal })
  }

  async updateWeight({ params, auth, request, response }: HttpContext) {
    const pet = await Pet.find(params.petId)
    if (!pet || pet.userId !== auth.user!.id) {
      return response.notFound({ success: false, message: 'Animal non trouvé' })
    }

    const goal = await WeightGoal.query()
      .where('pet_id', params.petId)
      .where('is_active', true)
      .first()

    if (!goal) {
      return response.notFound({ success: false, message: 'Aucun objectif actif' })
    }

    const { weight } = request.only(['weight'])

    // Update goal's current weight
    goal.currentWeight = weight
    
    // Check if goal is reached
    if (goal.goalType === 'lose' && weight <= goal.targetWeight) {
      goal.isCompleted = true
      goal.isActive = false
      goal.completedAt = DateTime.now()
    } else if (goal.goalType === 'gain' && weight >= goal.targetWeight) {
      goal.isCompleted = true
      goal.isActive = false
      goal.completedAt = DateTime.now()
    }

    await goal.save()

    // Also add to weight history
    await WeightHistory.create({
      petId: pet.id,
      weight,
      recordedAt: DateTime.now(),
      notes: 'Pesée programme minceur',
    })

    // Update pet's current weight
    pet.weight = weight
    await pet.save()

    return response.ok({
      success: true,
      data: {
        ...goal.serialize(),
        progressPercent: goal.progressPercent,
        remainingWeight: goal.remainingWeight,
        isCompleted: goal.isCompleted,
      },
      message: goal.isCompleted ? '🎉 Objectif atteint !' : 'Poids mis à jour',
    })
  }

  async complete({ params, auth, response }: HttpContext) {
    const pet = await Pet.find(params.petId)
    if (!pet || pet.userId !== auth.user!.id) {
      return response.notFound({ success: false, message: 'Animal non trouvé' })
    }

    const goal = await WeightGoal.find(params.id)
    if (!goal || goal.petId !== pet.id) {
      return response.notFound({ success: false, message: 'Objectif non trouvé' })
    }

    goal.isCompleted = true
    goal.isActive = false
    goal.completedAt = DateTime.now()
    await goal.save()

    return response.ok({ success: true, message: 'Programme terminé' })
  }

  async destroy({ params, auth, response }: HttpContext) {
    const pet = await Pet.find(params.petId)
    if (!pet || pet.userId !== auth.user!.id) {
      return response.notFound({ success: false, message: 'Animal non trouvé' })
    }

    const goal = await WeightGoal.find(params.id)
    if (!goal || goal.petId !== pet.id) {
      return response.notFound({ success: false, message: 'Objectif non trouvé' })
    }

    await goal.delete()
    return response.ok({ success: true, message: 'Programme supprimé' })
  }

  // AI-assisted goal creation from chat
  async createFromAI({ params, auth, request, response }: HttpContext) {
    const pet = await Pet.find(params.petId)
    if (!pet || pet.userId !== auth.user!.id) {
      return response.notFound({ success: false, message: 'Animal non trouvé' })
    }

    const { aiRecommendation } = request.only(['aiRecommendation'])

    // Parse AI recommendation (expected JSON format)
    let recommendation
    try {
      recommendation = typeof aiRecommendation === 'string' 
        ? JSON.parse(aiRecommendation) 
        : aiRecommendation
    } catch {
      return response.badRequest({ success: false, message: 'Format de recommandation invalide' })
    }

    // Deactivate existing goals
    await WeightGoal.query()
      .where('pet_id', params.petId)
      .where('is_active', true)
      .update({ isActive: false })

    const goal = await WeightGoal.create({
      petId: pet.id,
      startWeight: pet.weight || recommendation.startWeight,
      targetWeight: recommendation.targetWeight,
      currentWeight: pet.weight || recommendation.startWeight,
      startDate: DateTime.now(),
      targetDate: recommendation.targetDate ? DateTime.fromISO(recommendation.targetDate) : null,
      goalType: recommendation.goalType || 'lose',
      vetNotes: recommendation.vetNotes,
      dietPlan: recommendation.dietPlan,
      exercisePlan: recommendation.exercisePlan,
      dailyCalories: recommendation.dailyCalories,
      foodType: recommendation.foodType,
      foodQuantity: recommendation.foodQuantity,
      isActive: true,
      isCompleted: false,
    })

    return response.created({ 
      success: true, 
      data: goal,
      message: 'Programme créé avec les recommandations de l\'IA',
    })
  }
}
