import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, beforeSave, afterFind, afterFetch } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Pet from '#models/pet'
import EncryptionService from '#services/encryption_service'

export default class HealthBook extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare petId: number

  // === IDENTIFICATION (French pet identification) ===
  @column()
  declare identificationNumber: string | null // Numéro d'identification (puce ou tatouage)

  @column()
  declare identificationType: string | null // 'microchip' | 'tattoo'

  @column()
  declare identificationDate: string | null

  @column()
  declare identificationLocation: string | null // Lieu d'identification

  // === PASSPORT INFO ===
  @column()
  declare passportNumber: string | null // Numéro de passeport européen

  @column()
  declare passportIssueDate: string | null

  @column()
  declare passportIssueLocation: string | null

  // === STERILIZATION ===
  @column()
  declare isSterilized: boolean

  @column()
  declare sterilizationDate: string | null

  @column()
  declare sterilizationVetName: string | null

  // === BLOOD TYPE ===
  @column()
  declare bloodType: string | null

  // === VACCINES (JSON array) ===
  @column()
  declare vaccines: string | null
  // Structure: [{ name, date, batchNumber, vetName, nextDueDate, manufacturer }]

  // === ANTIPARASITICS (JSON array) ===
  @column()
  declare antiparasitics: string | null
  // Structure: [{ type: 'flea'|'tick'|'both', productName, date, nextDueDate, vetName }]

  // === DEWORMINGS (JSON array) ===
  @column()
  declare dewormings: string | null
  // Structure: [{ productName, date, nextDueDate, vetName, weight }]

  // === SURGERIES (JSON array) ===
  @column()
  declare surgeries: string | null
  // Structure: [{ name, date, vetName, clinic, notes }]

  // === ALLERGIES (JSON array) ===
  @column()
  declare allergies: string | null
  // Structure: [{ allergen, severity, diagnosisDate, notes }]

  // === CHRONIC CONDITIONS (JSON array) ===
  @column()
  declare chronicConditions: string | null
  // Structure: [{ condition, diagnosisDate, treatment, notes }]

  // === CURRENT MEDICATIONS (JSON array) ===
  @column()
  declare medications: string | null
  // Structure: [{ name, dosage, frequency, startDate, endDate, prescribedBy }]

  // === VET VISITS (JSON array) ===
  @column()
  declare vetVisits: string | null
  // Structure: [{ date, reason, diagnosis, treatment, vetName, clinic, notes, cost }]

  // === WEIGHT HISTORY (JSON array) ===
  @column()
  declare weightHistory: string | null
  // Structure: [{ date, weight, notes }]

  // === INSURANCE INFO ===
  @column()
  declare insuranceCompany: string | null

  @column()
  declare insurancePolicyNumber: string | null

  @column()
  declare insuranceExpiryDate: string | null

  // === EMERGENCY CONTACT ===
  @column()
  declare emergencyVetName: string | null

  @column()
  declare emergencyVetPhone: string | null

  @column()
  declare emergencyVetAddress: string | null

  // === NOTES ===
  @column()
  declare notes: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Pet)
  declare pet: BelongsTo<typeof Pet>

  // Encrypt sensitive data before saving
  @beforeSave()
  static async encryptData(healthBook: HealthBook) {
    const fieldsToEncrypt = [
      'identificationNumber',
      'identificationLocation',
      'passportNumber',
      'passportIssueLocation',
      'sterilizationVetName',
      'bloodType',
      'vaccines',
      'antiparasitics',
      'dewormings',
      'surgeries',
      'allergies',
      'chronicConditions',
      'medications',
      'vetVisits',
      'weightHistory',
      'insuranceCompany',
      'insurancePolicyNumber',
      'emergencyVetName',
      'emergencyVetPhone',
      'emergencyVetAddress',
      'notes',
    ]

    for (const field of fieldsToEncrypt) {
      const value = (healthBook as any)[field]
      if (value !== null && value !== undefined && healthBook.$dirty[field]) {
        if (typeof value === 'object') {
          ;(healthBook as any)[field] = EncryptionService.encrypt(JSON.stringify(value))
        } else if (typeof value === 'string' && value !== '') {
          ;(healthBook as any)[field] = EncryptionService.encrypt(value)
        }
      }
    }
  }

  // Decrypt data after fetching
  @afterFind()
  static async decryptDataAfterFind(healthBook: HealthBook) {
    HealthBook.decryptHealthBook(healthBook)
  }

  @afterFetch()
  static async decryptDataAfterFetch(healthBooks: HealthBook[]) {
    for (const healthBook of healthBooks) {
      HealthBook.decryptHealthBook(healthBook)
    }
  }

  private static decryptHealthBook(healthBook: HealthBook) {
    const fieldsToDecrypt = [
      'identificationNumber',
      'identificationLocation',
      'passportNumber',
      'passportIssueLocation',
      'sterilizationVetName',
      'bloodType',
      'insuranceCompany',
      'insurancePolicyNumber',
      'emergencyVetName',
      'emergencyVetPhone',
      'emergencyVetAddress',
      'notes',
    ]

    const jsonFieldsToDecrypt = [
      'vaccines',
      'antiparasitics',
      'dewormings',
      'surgeries',
      'allergies',
      'chronicConditions',
      'medications',
      'vetVisits',
      'weightHistory',
    ]

    // Decrypt simple string fields
    for (const field of fieldsToDecrypt) {
      const value = (healthBook as any)[field]
      if (value !== null && value !== undefined && value !== '') {
        ;(healthBook as any)[field] = EncryptionService.decrypt(value)
      }
    }

    // Decrypt and parse JSON fields
    for (const field of jsonFieldsToDecrypt) {
      const value = (healthBook as any)[field]
      if (value !== null && value !== undefined && value !== '') {
        try {
          const decrypted = EncryptionService.decrypt(value)
          ;(healthBook as any)[field] = decrypted ? JSON.parse(decrypted) : []
        } catch {
          ;(healthBook as any)[field] = []
        }
      } else {
        ;(healthBook as any)[field] = []
      }
    }
  }

  // Helper method to serialize for API response
  toJSON() {
    return {
      id: this.id,
      petId: this.petId,
      identification: {
        number: this.identificationNumber,
        type: this.identificationType,
        date: this.identificationDate,
        location: this.identificationLocation,
      },
      passport: {
        number: this.passportNumber,
        issueDate: this.passportIssueDate,
        issueLocation: this.passportIssueLocation,
      },
      sterilization: {
        isSterilized: this.isSterilized,
        date: this.sterilizationDate,
        vetName: this.sterilizationVetName,
      },
      bloodType: this.bloodType,
      vaccines: this.parseArrayField(this.vaccines),
      antiparasitics: this.parseArrayField(this.antiparasitics),
      dewormings: this.parseArrayField(this.dewormings),
      surgeries: this.parseArrayField(this.surgeries),
      allergies: this.parseArrayField(this.allergies),
      chronicConditions: this.parseArrayField(this.chronicConditions),
      medications: this.parseArrayField(this.medications),
      vetVisits: this.parseArrayField(this.vetVisits),
      weightHistory: this.parseArrayField(this.weightHistory),
      insurance: {
        company: this.insuranceCompany,
        policyNumber: this.insurancePolicyNumber,
        expiryDate: this.insuranceExpiryDate,
      },
      emergencyVet: {
        name: this.emergencyVetName,
        phone: this.emergencyVetPhone,
        address: this.emergencyVetAddress,
      },
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }

  private parseArrayField(value: any): any[] {
    if (Array.isArray(value)) return value
    if (typeof value === 'string' && value) {
      try {
        return JSON.parse(value)
      } catch {
        return []
      }
    }
    return []
  }
}
