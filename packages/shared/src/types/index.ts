export type Species = 'dog' | 'cat'

export type MedicalRecordType = 'vaccine' | 'treatment' | 'visit'

export type ChatRole = 'user' | 'assistant'

export interface User {
  id: string
  email: string
  createdAt: Date
  updatedAt: Date
  user_metadata?: {
    full_name?: string
    avatar_url?: string
    [key: string]: any
  }
}

export interface Pet {
  id: string
  userId: string
  name: string
  species: Species
  breed: string | null
  birthDate: Date | null
  weight: number | null
  avatarUrl: string | null
  createdAt: Date
}

export interface MedicalRecord {
  id: string
  petId: string
  type: MedicalRecordType
  title: string
  description: string | null
  date: Date
  nextDueDate: Date | null
  vetName: string | null
  createdAt: Date
}

export interface ChatMessage {
  id: string
  userId: string
  petId: string | null
  role: ChatRole
  message: string
  createdAt: Date
}

export interface AuthTokens {
  token: string
  type: string
  expiresAt: string
}

export interface LoginResponse {
  user: User
  token: AuthTokens
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    perPage: number
    lastPage: number
  }
}

// Health Book Types
export type IdentificationType = 'microchip' | 'tattoo'
export type AntiparasiticType = 'flea' | 'tick' | 'both'
export type AllergySeverity = 'mild' | 'moderate' | 'severe'

export interface VaccineEntry {
  id: string
  name: string
  date: string
  batchNumber?: string
  vetName?: string
  nextDueDate?: string
  manufacturer?: string
}

export interface AntiparasiticEntry {
  id: string
  type: AntiparasiticType
  productName: string
  date: string
  nextDueDate?: string
  vetName?: string
}

export interface DewormingEntry {
  id: string
  productName: string
  date: string
  nextDueDate?: string
  vetName?: string
  weight?: number
}

export interface SurgeryEntry {
  id: string
  name: string
  date: string
  vetName?: string
  clinic?: string
  notes?: string
}

export interface AllergyEntry {
  id: string
  allergen: string
  severity?: AllergySeverity
  diagnosisDate?: string
  notes?: string
}

export interface ChronicConditionEntry {
  id: string
  condition: string
  diagnosisDate?: string
  treatment?: string
  notes?: string
}

export interface MedicationEntry {
  id: string
  name: string
  dosage?: string
  frequency?: string
  startDate?: string
  endDate?: string
  prescribedBy?: string
}

export interface VetVisitEntry {
  id: string
  date: string
  reason: string
  diagnosis?: string
  treatment?: string
  vetName?: string
  clinic?: string
  notes?: string
  cost?: number
}

export interface WeightHistoryEntry {
  id: string
  date: string
  weight: number
  notes?: string
}

export interface HealthBook {
  id: string
  petId: string
  identification: {
    number: string | null
    type: IdentificationType | null
    date: string | null
    location: string | null
  }
  passport: {
    number: string | null
    issueDate: string | null
    issueLocation: string | null
  }
  sterilization: {
    isSterilized: boolean
    date: string | null
    vetName: string | null
  }
  bloodType: string | null
  vaccines: VaccineEntry[]
  antiparasitics: AntiparasiticEntry[]
  dewormings: DewormingEntry[]
  surgeries: SurgeryEntry[]
  allergies: AllergyEntry[]
  chronicConditions: ChronicConditionEntry[]
  medications: MedicationEntry[]
  vetVisits: VetVisitEntry[]
  weightHistory: WeightHistoryEntry[]
  insurance: {
    company: string | null
    policyNumber: string | null
    expiryDate: string | null
  }
  emergencyVet: {
    name: string | null
    phone: string | null
    address: string | null
  }
  notes: string | null
  createdAt: Date
  updatedAt: Date
}
