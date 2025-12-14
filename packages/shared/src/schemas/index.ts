import { z } from 'zod'

export const speciesEnum = z.enum(['dog', 'cat'])
export const medicalRecordTypeEnum = z.enum(['vaccine', 'treatment', 'visit'])
export const chatRoleEnum = z.enum(['user', 'assistant'])

export const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
})

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
})

export const createPetSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100),
  species: speciesEnum,
  breed: z.string().max(100).optional(),
  birthDate: z.string().datetime().optional(),
  weight: z.number().positive().optional(),
  avatarUrl: z.string().url().optional(),
})

export const updatePetSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  species: speciesEnum.optional(),
  breed: z.string().max(100).optional().nullable(),
  birthDate: z.string().datetime().optional().nullable(),
  weight: z.number().positive().optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
})

export const createMedicalRecordSchema = z.object({
  type: medicalRecordTypeEnum,
  title: z.string().min(1, 'Le titre est requis').max(200),
  description: z.string().max(2000).optional(),
  date: z.string().datetime(),
  nextDueDate: z.string().datetime().optional(),
  vetName: z.string().max(200).optional(),
})

export const updateMedicalRecordSchema = z.object({
  type: medicalRecordTypeEnum.optional(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  date: z.string().datetime().optional(),
  nextDueDate: z.string().datetime().optional().nullable(),
  vetName: z.string().max(200).optional().nullable(),
})

export const chatRequestSchema = z.object({
  petId: z.string().uuid().optional(),
  message: z.string().min(1, 'Le message est requis').max(4000),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type CreatePetInput = z.infer<typeof createPetSchema>
export type UpdatePetInput = z.infer<typeof updatePetSchema>
export type CreateMedicalRecordInput = z.infer<typeof createMedicalRecordSchema>
export type UpdateMedicalRecordInput = z.infer<typeof updateMedicalRecordSchema>
export type ChatRequestInput = z.infer<typeof chatRequestSchema>
