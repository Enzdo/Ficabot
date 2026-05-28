// Types mirrored from @ficabot/shared

export type Species = 'dog' | 'cat' | 'nac'
export type MedicalRecordType = 'vaccine' | 'treatment' | 'visit'
export type ChatRole = 'user' | 'assistant'

export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  avatarUrl?: string
  phone?: string
  language?: string
  createdAt: string
  updatedAt: string
}

export interface Pet {
  id: string
  userId: string
  name: string
  species: Species
  breed: string | null
  birthDate: string | null
  weight: number | null
  avatarUrl: string | null
  createdAt: string
}

export interface MedicalRecord {
  id: string
  petId: string
  type: MedicalRecordType
  title: string
  description: string | null
  date: string
  nextDueDate: string | null
  vetName: string | null
  createdAt: string
}

export interface ChatMessage {
  id: string
  userId: string
  petId: string | null
  role: ChatRole
  message: string
  createdAt: string
}

export interface Conversation {
  id: string
  title: string
  petId: string | null
  lastMessage: string
  updatedAt: string
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

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  errors?: Record<string, string[]>
}

export interface VetAppointment {
  id: string
  petId: string
  pet?: Pet
  vetId?: string
  vetName?: string
  date: string
  reason: string
  notes?: string
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  createdAt: string
}

export interface Reminder {
  id: string
  petId: string | null
  pet?: Pet
  title: string
  description?: string
  dueDate: string
  isCompleted: boolean
  createdAt: string
}

export interface CreatePetDTO {
  name: string
  species: Species
  breed?: string
  birthDate?: string
  weight?: number
}

export interface UpdatePetDTO extends Partial<CreatePetDTO> {}

export interface WeightEntry {
  id: string
  petId: string
  weight: number
  recordedAt: string
  notes?: string | null
  createdAt: string
}

export interface SymptomLog {
  id: string
  petId: string
  symptom: string
  severity: 'mild' | 'moderate' | 'severe'
  description?: string | null
  observedAt: string
  isResolved: boolean
  notes?: string | null
  createdAt: string
}

export interface CreateMedicalRecordDTO {
  type: MedicalRecordType
  title: string
  description?: string
  date: string
  nextDueDate?: string
  vetName?: string
}

// ─── Health Book ──────────────────────────────────────────────────────────────

export interface VaccineEntry {
  name: string
  date: string
  batchNumber?: string
  vetName?: string
  nextDueDate?: string
  manufacturer?: string
}

export interface AntiparasiticEntry {
  type: 'flea' | 'tick' | 'both' | 'internal'
  productName: string
  date: string
  nextDueDate?: string
  vetName?: string
}

export interface AllergyEntry {
  allergen: string
  severity: 'mild' | 'moderate' | 'severe'
  reaction?: string
  diagnosedAt?: string
}

export interface ChronicConditionEntry {
  condition: string
  diagnosedAt?: string
  notes?: string
  treatedWith?: string
}

export interface SurgeryEntry {
  type: string
  date: string
  vetName?: string
  clinic?: string
  notes?: string
}

export interface HealthBook {
  id: string
  petId: string
  // Identification
  identificationNumber?: string | null
  identificationType?: 'microchip' | 'tattoo' | null
  identificationDate?: string | null
  // Sterilization
  isSterilized: boolean
  sterilizationDate?: string | null
  sterilizationVetName?: string | null
  // Passport
  passportNumber?: string | null
  passportIssueDate?: string | null
  // Blood
  bloodType?: string | null
  // Insurance
  insuranceCompany?: string | null
  insurancePolicyNumber?: string | null
  insuranceExpiryDate?: string | null
  // Emergency vet
  emergencyVetName?: string | null
  emergencyVetPhone?: string | null
  // JSON arrays (stored as strings, parsed on read)
  vaccines?: VaccineEntry[] | string | null
  antiparasitics?: AntiparasiticEntry[] | string | null
  allergies?: AllergyEntry[] | string | null
  chronicConditions?: ChronicConditionEntry[] | string | null
  surgeries?: SurgeryEntry[] | string | null
  medications?: unknown[] | string | null
  vetVisits?: unknown[] | string | null
  // EU Passport (Règlement UE 576/2013)
  chipVetName?: string | null
  chipVetOrderNumber?: string | null
  passportVetName?: string | null
  passportVetOrderNumber?: string | null
  passportVetStamp?: string | null
  echinococcusTreatments?: EchinococcusTreatmentEntry[] | string | null
  coatColor?: string | null
  coatPattern?: string | null
  distinctiveMarks?: string | null
  sex?: 'male' | 'female' | null
  // Categorized dogs FR (cat. 1/2)
  dogCategory?: 1 | 2 | null
  detentionPermitNumber?: string | null
  detentionPermitIssuedAt?: string | null
  detentionPermitCity?: string | null
  aptitudeCertificateNumber?: string | null
  aptitudeCertificateIssuedAt?: string | null
  aptitudeCertificateTrainer?: string | null
  liabilityInsuranceCompany?: string | null
  liabilityInsurancePolicy?: string | null
  liabilityInsuranceExpiresAt?: string | null
  behavioralAssessmentVet?: string | null
  behavioralAssessmentDate?: string | null
  behavioralDangerLevel?: 1 | 2 | 3 | 4 | null
  createdAt: string
  updatedAt: string
}

export interface EchinococcusTreatmentEntry {
  date: string
  product: string
  vetName?: string
}

// ─── Activities ───────────────────────────────────────────────────────────────

export type ActivityType = 'walk' | 'play' | 'run' | 'swim' | 'training' | 'other'

export interface Activity {
  id: string
  petId: string
  type: ActivityType
  durationMinutes: number
  distanceKm?: number | null
  notes?: string | null
  startedAt: string
  endedAt?: string | null
  createdAt: string
}

export interface ActivityStats {
  type: ActivityType
  totalMinutes: number
  totalDistance: number
  count: number
}

// ─── Feeding Logs ─────────────────────────────────────────────────────────────

export type FoodType = 'dry' | 'wet' | 'raw' | 'homemade' | 'treats'
export type FoodUnit = 'g' | 'kg' | 'ml' | 'cups'

export interface FeedingLog {
  id: string
  petId: string
  foodType: FoodType
  brand?: string | null
  productName?: string | null
  quantity?: number | null
  unit?: FoodUnit | null
  fedAt: string
  notes?: string | null
  createdAt: string
}

// ─── Expenses ─────────────────────────────────────────────────────────────────

export type ExpenseCategory = 'vet' | 'food' | 'grooming' | 'medication' | 'accessories' | 'insurance' | 'other'

export interface Expense {
  id: string
  userId: string
  petId?: string | null
  pet?: Pet
  category: ExpenseCategory
  title: string
  description?: string | null
  amount: number
  expenseDate: string
  createdAt: string
}

// ─── Pre-Diagnosis ────────────────────────────────────────────────────────────

export interface PreDiagnosis {
  id: string
  petId: string
  userId: string
  species: Species
  userDescription: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  aiAnalysis?: string | null
  urgencyLevel?: 'low' | 'medium' | 'high' | 'emergency' | null
  recommendedActions?: string[] | null
  disclaimer?: string | null
  createdAt: string
  updatedAt: string
}

// ─── Notifications ────────────────────────────────────────────────────────────

export interface UserNotification {
  id: string
  userId: string
  title: string
  message: string
  type: string
  isRead: boolean
  data?: Record<string, unknown> | null
  createdAt: string
}
