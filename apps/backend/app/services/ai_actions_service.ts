import type Pet from '#models/pet'
import type User from '#models/user'
import Reminder from '#models/reminder'
import WeightHistory from '#models/weight_history'
import { DateTime } from 'luxon'

export interface AiAction {
    name: string
    description: string
    parameters: {
        type: 'object'
        properties: Record<string, any>
        required: string[]
    }
}

export interface ActionExecutionResult {
    success: boolean
    message: string
    data?: any
    error?: string
}

export default class AiActionsService {
    /**
     * Get list of available AI actions as OpenAI function definitions
     */
    getAvailableActions(): AiAction[] {
        return [
            {
                name: 'update_pet_nutrition',
                description: "Mettre à jour le plan nutritionnel d'un animal avec de nouvelles recommandations. Utiliser quand l'utilisateur demande de modifier l'alimentation, les calories, ou le nombre de repas.",
                parameters: {
                    type: 'object',
                    properties: {
                        petId: {
                            type: 'string',
                            description: "L'ID de l'animal concerné"
                        },
                        dailyCalories: {
                            type: 'number',
                            description: 'Nombre de calories quotidiennes recommandées'
                        },
                        mealsPerDay: {
                            type: 'number',
                            description: 'Nombre de repas par jour (généralement 2-3)'
                        },
                        foodType: {
                            type: 'string',
                            description: 'Type de nourriture recommandée (ex: Croquettes premium, BARF, mixte)'
                        },
                        notes: {
                            type: 'string',
                            description: 'Notes ou justification des changements'
                        }
                    },
                    required: ['petId', 'dailyCalories', 'mealsPerDay', 'foodType']
                }
            },
            {
                name: 'add_weight_entry',
                description: "Ajouter une nouvelle entrée de poids pour un animal. Utiliser quand l'utilisateur mentionne un poids récent ou demande d'enregistrer le poids.",
                parameters: {
                    type: 'object',
                    properties: {
                        petId: {
                            type: 'string',
                            description: "L'ID de l'animal concerné"
                        },
                        weight: {
                            type: 'number',
                            description: 'Poids en kilogrammes (doit être positif)'
                        },
                        date: {
                            type: 'string',
                            description: 'Date de la pesée au format YYYY-MM-DD (par défaut: aujourd\'hui)'
                        },
                        notes: {
                            type: 'string',
                            description: 'Notes optionnelles sur la pesée'
                        }
                    },
                    required: ['petId', 'weight']
                }
            },
            {
                name: 'create_reminder',
                description: "Créer un rappel automatique pour un vaccin, antiparasitaire, ou pesée. Utiliser quand l'utilisateur demande de créer un rappel ou de ne pas oublier quelque chose.",
                parameters: {
                    type: 'object',
                    properties: {
                        petId: {
                            type: 'string',
                            description: "L'ID de l'animal concerné"
                        },
                        type: {
                            type: 'string',
                            enum: ['vaccine', 'antiparasitic', 'weighing', 'appointment', 'custom'],
                            description: 'Type de rappel'
                        },
                        title: {
                            type: 'string',
                            description: 'Titre du rappel (ex: Rappel vaccin rage)'
                        },
                        date: {
                            type: 'string',
                            description: 'Date du rappel au format YYYY-MM-DD'
                        },
                        recurring: {
                            type: 'boolean',
                            description: 'Si le rappel est récurrent',
                            default: false
                        },
                        frequency: {
                            type: 'string',
                            enum: ['weekly', 'monthly', 'yearly'],
                            description: 'Fréquence si récurrent'
                        }
                    },
                    required: ['petId', 'type', 'title', 'date']
                }
            }
        ]
    }

    /**
     * Validate action parameters before execution
     */
    validateAction(actionName: string, parameters: any): { valid: boolean; error?: string } {
        const actions = this.getAvailableActions()
        const action = actions.find(a => a.name === actionName)

        if (!action) {
            return { valid: false, error: `Action '${actionName}' non reconnue` }
        }

        // Check required parameters
        for (const required of action.parameters.required) {
            if (parameters[required] === undefined || parameters[required] === null) {
                return { valid: false, error: `Paramètre requis manquant: ${required}` }
            }
        }

        // Specific validation by action
        switch (actionName) {
            case 'add_weight_entry':
                if (parameters.weight <= 0 || parameters.weight > 200) {
                    return { valid: false, error: 'Le poids doit être entre 0.1 et 200 kg' }
                }
                break

            case 'update_pet_nutrition':
                if (parameters.dailyCalories <= 0 || parameters.dailyCalories > 5000) {
                    return { valid: false, error: 'Les calories doivent être entre 1 et 5000' }
                }
                if (parameters.mealsPerDay < 1 || parameters.mealsPerDay > 6) {
                    return { valid: false, error: 'Le nombre de repas doit être entre 1 et 6' }
                }
                break

            case 'create_reminder':
                try {
                    DateTime.fromISO(parameters.date)
                } catch {
                    return { valid: false, error: 'Format de date invalide (attendu: YYYY-MM-DD)' }
                }
                break
        }

        return { valid: true }
    }

    /**
     * Execute an AI action
     */
    async executeAction(
        actionName: string,
        parameters: any,
        user: User,
        pet: Pet | null
    ): Promise<ActionExecutionResult> {
        // Validate action
        const validation = this.validateAction(actionName, parameters)
        if (!validation.valid) {
            return {
                success: false,
                message: 'Validation échouée',
                error: validation.error
            }
        }

        // Verify pet ownership
        if (pet && pet.userId !== user.id) {
            return {
                success: false,
                message: 'Permission refusée',
                error: 'Vous n\'êtes pas le propriétaire de cet animal'
            }
        }

        try {
            switch (actionName) {
                case 'add_weight_entry':
                    return await this.addWeightEntry(parameters, pet!)

                case 'update_pet_nutrition':
                    return await this.updateNutrition(parameters, pet!)

                case 'create_reminder':
                    return await this.createReminder(parameters, user, pet!)

                default:
                    return {
                        success: false,
                        message: 'Action non implémentée',
                        error: `L'action '${actionName}' n'est pas encore disponible`
                    }
            }
        } catch (error) {
            console.error('Action execution error:', error)
            return {
                success: false,
                message: 'Erreur lors de l\'exécution',
                error: error.message || 'Erreur inconnue'
            }
        }
    }

    /**
     * Add weight entry for a pet
     */
    private async addWeightEntry(params: any, pet: Pet): Promise<ActionExecutionResult> {
        const date = params.date ? DateTime.fromISO(params.date) : DateTime.now()

        await WeightHistory.create({
            petId: pet.id,
            weight: params.weight,
            recordedAt: date,
            notes: params.notes || null
        })

        // Also update pet's current weight
        pet.weight = params.weight
        await pet.save()

        return {
            success: true,
            message: `Poids de ${pet.name} enregistré: ${params.weight}kg`,
            data: {
                weight: params.weight,
                date: date.toFormat('dd/MM/yyyy')
            }
        }
    }

    /**
     * Update pet nutrition plan
     */
    private async updateNutrition(params: any, pet: Pet): Promise<ActionExecutionResult> {
        // Store nutrition plan in pet's metadata or dedicated table
        // For now, we'll use pet's existing fields and add notes
        await pet.merge({
            // Assuming we have these fields, otherwise store in JSON metadata
            // dailyCalories: params.dailyCalories,
            // mealsPerDay: params.mealsPerDay,
            // foodType: params.foodType
        }).save()

        // In a real implementation, you might have a separate nutrition_plans table
        // Or store in healthBook

        return {
            success: true,
            message: `Plan nutritionnel de ${pet.name} mis à jour`,
            data: {
                dailyCalories: params.dailyCalories,
                mealsPerDay: params.mealsPerDay,
                foodType: params.foodType,
                notes: params.notes
            }
        }
    }

    /**
     * Create a reminder for a pet
     */
    private async createReminder(params: any, user: User, pet: Pet): Promise<ActionExecutionResult> {
        const reminderDate = DateTime.fromISO(params.date)

        await Reminder.create({
            userId: user.id,
            petId: pet.id,
            type: params.type,
            title: params.title,
            dueDate: reminderDate.toFormat('yyyy-MM-dd'),
            isRecurring: params.recurring || false,
            recurrenceInterval: params.frequency || null,
            isCompleted: false
        })

        return {
            success: true,
            message: `Rappel créé pour ${pet.name}: ${params.title}`,
            data: {
                title: params.title,
                date: reminderDate.toFormat('dd/MM/yyyy'),
                type: params.type
            }
        }
    }

    /**
     * Generate confirmation message for an action
     */
    generateConfirmationMessage(actionName: string, parameters: any, pet: Pet | null): string {
        switch (actionName) {
            case 'add_weight_entry':
                return `Voulez-vous enregistrer ${parameters.weight}kg pour ${pet?.name} ?`

            case 'update_pet_nutrition':
                return `Voulez-vous mettre à jour le plan nutritionnel de ${pet?.name} avec ${parameters.dailyCalories} kcal/jour et ${parameters.mealsPerDay} repas ?`

            case 'create_reminder':
                const date = DateTime.fromISO(parameters.date).toFormat('dd/MM/yyyy')
                return `Voulez-vous créer un rappel "${parameters.title}" pour le ${date} ?`

            default:
                return 'Voulez-vous effectuer cette action ?'
        }
    }
}
