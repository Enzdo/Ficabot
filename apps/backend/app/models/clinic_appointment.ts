import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Veterinarian from '#models/veterinarian'
import VetEmployee from '#models/vet_employee'
import Pet from '#models/pet'
import User from '#models/user'

export default class ClinicAppointment extends BaseModel {
  static table = 'vet_appointments'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare veterinarianId: number

  @column()
  declare employeeId: number | null

  @column()
  declare petId: number | null

  @column()
  declare userId: number | null

  // For non-registered clients
  @column()
  declare clientName: string | null

  @column()
  declare clientPhone: string | null

  @column()
  declare clientEmail: string | null

  @column()
  declare petName: string | null

  @column()
  declare petSpecies: string | null

  // Appointment details
  @column()
  declare date: string

  @column()
  declare startTime: string

  @column()
  declare endTime: string

  @column()
  declare duration: number

  @column()
  declare type: 'consultation' | 'vaccination' | 'surgery' | 'checkup' | 'emergency' | 'grooming' | 'followup' | 'other'

  @column()
  declare status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'

  @column()
  declare reason: string | null

  @column()
  declare notes: string | null

  @column()
  declare internalNotes: string | null

  @column()
  declare isRecurring: boolean

  @column()
  declare recurrencePattern: string | null

  @column()
  declare parentAppointmentId: number | null

  @column()
  declare reminderSent: boolean

  @column.dateTime()
  declare reminderSentAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Veterinarian)
  declare veterinarian: BelongsTo<typeof Veterinarian>

  @belongsTo(() => VetEmployee)
  declare employee: BelongsTo<typeof VetEmployee>

  @belongsTo(() => Pet)
  declare pet: BelongsTo<typeof Pet>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  // Computed: get client display name
  get clientDisplayName() {
    if (this.user) {
      return `${this.user.firstName || ''} ${this.user.lastName || ''}`.trim() || this.user.email
    }
    return this.clientName || 'Client inconnu'
  }

  // Computed: get pet display name
  get petDisplayName() {
    if (this.pet) {
      return this.pet.name
    }
    return this.petName || 'Animal inconnu'
  }
}
