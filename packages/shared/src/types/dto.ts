import type { Species, MedicalRecordType } from './index'

export interface RegisterDTO {
  email: string
  password: string
}

export interface LoginDTO {
  email: string
  password: string
}

export interface CreatePetDTO {
  name: string
  species: Species
  breed?: string
  birthDate?: string
  weight?: number
  avatarUrl?: string
}

export interface UpdatePetDTO {
  name?: string
  species?: Species
  breed?: string
  birthDate?: string
  weight?: number
  avatarUrl?: string
}

export interface CreateMedicalRecordDTO {
  type: MedicalRecordType
  title: string
  description?: string
  date: string
  nextDueDate?: string
  vetName?: string
}

export interface UpdateMedicalRecordDTO {
  type?: MedicalRecordType
  title?: string
  description?: string
  date?: string
  nextDueDate?: string
  vetName?: string
}

export interface ChatRequestDTO {
  petId?: string
  message: string
}

export interface ChatResponseDTO {
  message: string
  petContext?: {
    name: string
    species: Species
    breed?: string
    age?: number
  }
}

// Health Book DTOs
export interface UpdateHealthBookDTO {
  identificationNumber?: string
  identificationType?: 'microchip' | 'tattoo'
  identificationDate?: string
  identificationLocation?: string
  passportNumber?: string
  passportIssueDate?: string
  passportIssueLocation?: string
  isSterilized?: boolean
  sterilizationDate?: string
  sterilizationVetName?: string
  bloodType?: string
  insuranceCompany?: string
  insurancePolicyNumber?: string
  insuranceExpiryDate?: string
  emergencyVetName?: string
  emergencyVetPhone?: string
  emergencyVetAddress?: string
  notes?: string
}

export interface AddVaccineDTO {
  name: string
  date: string
  batchNumber?: string
  vetName?: string
  nextDueDate?: string
  manufacturer?: string
}

export interface AddAntiparasiticDTO {
  type: 'flea' | 'tick' | 'both'
  productName: string
  date: string
  nextDueDate?: string
  vetName?: string
}

export interface AddDewormingDTO {
  productName: string
  date: string
  nextDueDate?: string
  vetName?: string
  weight?: number
}

export interface AddSurgeryDTO {
  name: string
  date: string
  vetName?: string
  clinic?: string
  notes?: string
}

export interface AddAllergyDTO {
  allergen: string
  severity?: 'mild' | 'moderate' | 'severe'
  diagnosisDate?: string
  notes?: string
}

export interface AddChronicConditionDTO {
  condition: string
  diagnosisDate?: string
  treatment?: string
  notes?: string
}

export interface AddMedicationDTO {
  name: string
  dosage?: string
  frequency?: string
  startDate?: string
  endDate?: string
  prescribedBy?: string
}

export interface AddVetVisitDTO {
  date: string
  reason: string
  diagnosis?: string
  treatment?: string
  vetName?: string
  clinic?: string
  notes?: string
  cost?: number
}

export interface AddWeightHistoryDTO {
  date: string
  weight: number
  notes?: string
}
