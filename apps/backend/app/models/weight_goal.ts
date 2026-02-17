import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Pet from './pet.js'

export default class WeightGoal extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare petId: number

  @column()
  declare startWeight: number

  @column()
  declare targetWeight: number

  @column()
  declare currentWeight: number

  @column.date()
  declare startDate: DateTime

  @column.date()
  declare targetDate: DateTime | null

  @column()
  declare goalType: 'lose' | 'gain' | 'maintain'

  @column()
  declare vetNotes: string | null

  @column()
  declare ownerNotes: string | null

  @column()
  declare dietPlan: string | null

  @column()
  declare exercisePlan: string | null

  @column()
  declare dailyCalories: number | null

  @column()
  declare foodType: string | null

  @column()
  declare foodQuantity: number | null

  @column()
  declare isActive: boolean

  @column()
  declare isCompleted: boolean

  @column.date()
  declare completedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Pet)
  declare pet: BelongsTo<typeof Pet>

  // Calculate progress percentage
  get progressPercent(): number {
    const totalToLose = this.startWeight - this.targetWeight
    const lost = this.startWeight - this.currentWeight
    if (totalToLose === 0) return 100
    return Math.min(100, Math.max(0, (lost / totalToLose) * 100))
  }

  // Calculate remaining weight
  get remainingWeight(): number {
    return Math.max(0, this.currentWeight - this.targetWeight)
  }
}
