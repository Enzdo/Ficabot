import vine from '@vinejs/vine'

// Vaccine entry schema
const vaccineSchema = vine.object({
  name: vine.string().minLength(1).maxLength(200),
  date: vine.string(),
  batchNumber: vine.string().maxLength(100).optional(),
  vetName: vine.string().maxLength(200).optional(),
  nextDueDate: vine.string().optional(),
  manufacturer: vine.string().maxLength(200).optional(),
})

// Antiparasitic entry schema
const antiparasiticSchema = vine.object({
  type: vine.enum(['flea', 'tick', 'both']),
  productName: vine.string().minLength(1).maxLength(200),
  date: vine.string(),
  nextDueDate: vine.string().optional(),
  vetName: vine.string().maxLength(200).optional(),
})

// Deworming entry schema
const dewormingSchema = vine.object({
  productName: vine.string().minLength(1).maxLength(200),
  date: vine.string(),
  nextDueDate: vine.string().optional(),
  vetName: vine.string().maxLength(200).optional(),
  weight: vine.number().optional(),
})

// Surgery entry schema
const surgerySchema = vine.object({
  name: vine.string().minLength(1).maxLength(200),
  date: vine.string(),
  vetName: vine.string().maxLength(200).optional(),
  clinic: vine.string().maxLength(200).optional(),
  notes: vine.string().optional(),
})

// Allergy entry schema
const allergySchema = vine.object({
  allergen: vine.string().minLength(1).maxLength(200),
  severity: vine.enum(['mild', 'moderate', 'severe']).optional(),
  diagnosisDate: vine.string().optional(),
  notes: vine.string().optional(),
})

// Chronic condition entry schema
const chronicConditionSchema = vine.object({
  condition: vine.string().minLength(1).maxLength(200),
  diagnosisDate: vine.string().optional(),
  treatment: vine.string().optional(),
  notes: vine.string().optional(),
})

// Medication entry schema
const medicationSchema = vine.object({
  name: vine.string().minLength(1).maxLength(200),
  dosage: vine.string().maxLength(100).optional(),
  frequency: vine.string().maxLength(100).optional(),
  startDate: vine.string().optional(),
  endDate: vine.string().optional(),
  prescribedBy: vine.string().maxLength(200).optional(),
})

// Vet visit entry schema
const vetVisitSchema = vine.object({
  date: vine.string(),
  reason: vine.string().minLength(1).maxLength(500),
  diagnosis: vine.string().optional(),
  treatment: vine.string().optional(),
  vetName: vine.string().maxLength(200).optional(),
  clinic: vine.string().maxLength(200).optional(),
  notes: vine.string().optional(),
  cost: vine.number().optional(),
})

// Weight history entry schema
const weightHistorySchema = vine.object({
  date: vine.string(),
  weight: vine.number(),
  notes: vine.string().optional(),
})

// Create/Update health book validator
export const createHealthBookValidator = vine.compile(
  vine.object({
    // Identification
    identificationNumber: vine.string().maxLength(50).optional(),
    identificationType: vine.enum(['microchip', 'tattoo']).optional(),
    identificationDate: vine.string().optional(),
    identificationLocation: vine.string().maxLength(200).optional(),

    // Passport
    passportNumber: vine.string().maxLength(50).optional(),
    passportIssueDate: vine.string().optional(),
    passportIssueLocation: vine.string().maxLength(200).optional(),

    // Sterilization
    isSterilized: vine.boolean().optional(),
    sterilizationDate: vine.string().optional(),
    sterilizationVetName: vine.string().maxLength(200).optional(),

    // Blood type
    bloodType: vine.string().maxLength(20).optional(),

    // Medical arrays
    vaccines: vine.array(vaccineSchema).optional(),
    antiparasitics: vine.array(antiparasiticSchema).optional(),
    dewormings: vine.array(dewormingSchema).optional(),
    surgeries: vine.array(surgerySchema).optional(),
    allergies: vine.array(allergySchema).optional(),
    chronicConditions: vine.array(chronicConditionSchema).optional(),
    medications: vine.array(medicationSchema).optional(),
    vetVisits: vine.array(vetVisitSchema).optional(),
    weightHistory: vine.array(weightHistorySchema).optional(),

    // Insurance
    insuranceCompany: vine.string().maxLength(200).optional(),
    insurancePolicyNumber: vine.string().maxLength(100).optional(),
    insuranceExpiryDate: vine.string().optional(),

    // Emergency vet
    emergencyVetName: vine.string().maxLength(200).optional(),
    emergencyVetPhone: vine.string().maxLength(30).optional(),
    emergencyVetAddress: vine.string().maxLength(500).optional(),

    // Notes
    notes: vine.string().optional(),
  })
)

export const updateHealthBookValidator = createHealthBookValidator

// Add single entry validators
export const addVaccineValidator = vine.compile(vaccineSchema)
export const addAntiparasiticValidator = vine.compile(antiparasiticSchema)
export const addDewormingValidator = vine.compile(dewormingSchema)
export const addSurgeryValidator = vine.compile(surgerySchema)
export const addAllergyValidator = vine.compile(allergySchema)
export const addChronicConditionValidator = vine.compile(chronicConditionSchema)
export const addMedicationValidator = vine.compile(medicationSchema)
export const addVetVisitValidator = vine.compile(vetVisitSchema)
export const addWeightHistoryValidator = vine.compile(weightHistorySchema)
