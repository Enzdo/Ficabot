import { create } from 'zustand'
import { api } from '@/services/api'
import type {
  HealthBook,
  VaccineEntry,
  AntiparasiticEntry,
  AllergyEntry,
  ChronicConditionEntry,
  SurgeryEntry,
} from '@/types'

interface HealthBookState {
  healthBook: HealthBook | null
  loading: boolean
  error: string | null

  fetchHealthBook: (petId: string) => Promise<void>
  updateHealthBook: (petId: string, data: Partial<HealthBook>) => Promise<boolean>
  addVaccine: (petId: string, vaccine: VaccineEntry) => Promise<boolean>
  removeVaccine: (petId: string, index: number) => Promise<boolean>
  addAntiparasitic: (petId: string, entry: AntiparasiticEntry) => Promise<boolean>
  removeAntiparasitic: (petId: string, index: number) => Promise<boolean>
  addAllergy: (petId: string, entry: AllergyEntry) => Promise<boolean>
  removeAllergy: (petId: string, index: number) => Promise<boolean>
  addChronicCondition: (petId: string, entry: ChronicConditionEntry) => Promise<boolean>
  removeChronicCondition: (petId: string, index: number) => Promise<boolean>
  addSurgery: (petId: string, entry: SurgeryEntry) => Promise<boolean>
  removeSurgery: (petId: string, index: number) => Promise<boolean>
  reset: () => void
}

function parseJsonField<T>(val: T[] | string | null | undefined): T[] {
  if (!val) return []
  if (Array.isArray(val)) return val
  try { return JSON.parse(val as string) } catch { return [] }
}

export const useHealthBookStore = create<HealthBookState>((set, get) => ({
  healthBook: null,
  loading: false,
  error: null,

  fetchHealthBook: async (petId) => {
    set({ loading: true, error: null })
    const r = await api.get<HealthBook>(`/pets/${petId}/health-book`)
    if (r.success && r.data) {
      const hb = r.data
      // Parse JSON string fields into arrays
      set({
        healthBook: {
          ...hb,
          vaccines: parseJsonField(hb.vaccines as any),
          antiparasitics: parseJsonField(hb.antiparasitics as any),
          allergies: parseJsonField(hb.allergies as any),
          chronicConditions: parseJsonField(hb.chronicConditions as any),
          surgeries: parseJsonField(hb.surgeries as any),
        },
      })
    } else {
      set({ error: r.message ?? 'Erreur chargement carnet' })
    }
    set({ loading: false })
  },

  updateHealthBook: async (petId, data) => {
    const r = await api.put<HealthBook>(`/pets/${petId}/health-book`, data)
    if (r.success && r.data) {
      const hb = r.data
      set({
        healthBook: {
          ...hb,
          vaccines: parseJsonField(hb.vaccines as any),
          antiparasitics: parseJsonField(hb.antiparasitics as any),
          allergies: parseJsonField(hb.allergies as any),
          chronicConditions: parseJsonField(hb.chronicConditions as any),
          surgeries: parseJsonField(hb.surgeries as any),
        },
      })
      return true
    }
    return false
  },

  addVaccine: async (petId, vaccine) => {
    const r = await api.post(`/pets/${petId}/health-book/vaccines`, vaccine)
    if (r.success) { await get().fetchHealthBook(petId); return true }
    return false
  },

  removeVaccine: async (petId, index) => {
    const r = await api.del(`/pets/${petId}/health-book/vaccines`, { index })
    if (r.success) { await get().fetchHealthBook(petId); return true }
    return false
  },

  addAntiparasitic: async (petId, entry) => {
    const r = await api.post(`/pets/${petId}/health-book/antiparasitics`, entry)
    if (r.success) { await get().fetchHealthBook(petId); return true }
    return false
  },

  removeAntiparasitic: async (petId, index) => {
    const r = await api.del(`/pets/${petId}/health-book/antiparasitics`, { index })
    if (r.success) { await get().fetchHealthBook(petId); return true }
    return false
  },

  addAllergy: async (petId, entry) => {
    const r = await api.post(`/pets/${petId}/health-book/allergies`, entry)
    if (r.success) { await get().fetchHealthBook(petId); return true }
    return false
  },

  removeAllergy: async (petId, index) => {
    const r = await api.del(`/pets/${petId}/health-book/allergies`, { index })
    if (r.success) { await get().fetchHealthBook(petId); return true }
    return false
  },

  addChronicCondition: async (petId, entry) => {
    const r = await api.post(`/pets/${petId}/health-book/chronic-conditions`, entry)
    if (r.success) { await get().fetchHealthBook(petId); return true }
    return false
  },

  removeChronicCondition: async (petId, index) => {
    const r = await api.del(`/pets/${petId}/health-book/chronic-conditions`, { index })
    if (r.success) { await get().fetchHealthBook(petId); return true }
    return false
  },

  addSurgery: async (petId, entry) => {
    const r = await api.post(`/pets/${petId}/health-book/surgeries`, entry)
    if (r.success) { await get().fetchHealthBook(petId); return true }
    return false
  },

  removeSurgery: async (petId, index) => {
    const r = await api.del(`/pets/${petId}/health-book/surgeries`, { index })
    if (r.success) { await get().fetchHealthBook(petId); return true }
    return false
  },

  reset: () => set({ healthBook: null, error: null }),
}))
