import { create } from 'zustand'
import { api } from '@/services/api'
import type {
  Pet, MedicalRecord, WeightEntry, SymptomLog,
  Activity, ActivityType, FeedingLog, FoodType, FoodUnit,
  CreatePetDTO, UpdatePetDTO, CreateMedicalRecordDTO,
} from '@/types'

interface PetsState {
  pets: Pet[]
  currentPet: Pet | null
  medicalRecords: MedicalRecord[]
  weightHistory: WeightEntry[]
  symptomLogs: SymptomLog[]
  activities: Activity[]
  feedingLogs: FeedingLog[]
  loading: boolean
  error: string | null

  fetchPets: () => Promise<void>
  fetchPet: (id: string) => Promise<void>
  createPet: (data: CreatePetDTO) => Promise<Pet | null>
  updatePet: (id: string, data: UpdatePetDTO) => Promise<Pet | null>
  deletePet: (id: string) => Promise<boolean>
  fetchMedicalRecords: (petId: string) => Promise<void>
  createMedicalRecord: (petId: string, data: CreateMedicalRecordDTO) => Promise<MedicalRecord | null>
  deleteMedicalRecord: (recordId: string) => Promise<boolean>
  fetchWeightHistory: (petId: string) => Promise<void>
  addWeightEntry: (petId: string, weight: number, recordedAt: string, notes?: string) => Promise<WeightEntry | null>
  deleteWeightEntry: (petId: string, id: string) => Promise<boolean>
  fetchSymptomLogs: (petId: string) => Promise<void>
  addSymptomLog: (petId: string, data: { symptom: string; severity: string; description?: string; observedAt: string }) => Promise<SymptomLog | null>
  deleteSymptomLog: (petId: string, id: string) => Promise<boolean>
  fetchActivities: (petId: string) => Promise<void>
  addActivity: (petId: string, data: { type: ActivityType; durationMinutes: number; distanceKm?: number; notes?: string; startedAt: string }) => Promise<Activity | null>
  deleteActivity: (petId: string, id: string) => Promise<boolean>
  fetchFeedingLogs: (petId: string) => Promise<void>
  addFeedingLog: (petId: string, data: { foodType: FoodType; brand?: string; productName?: string; quantity?: number; unit?: FoodUnit; fedAt: string; notes?: string }) => Promise<FeedingLog | null>
  deleteFeedingLog: (petId: string, id: string) => Promise<boolean>
  setCurrentPet: (pet: Pet | null) => void
  reset: () => void
}

export const usePetsStore = create<PetsState>((set, get) => ({
  pets: [],
  currentPet: null,
  medicalRecords: [],
  weightHistory: [],
  symptomLogs: [],
  activities: [],
  feedingLogs: [],
  loading: false,
  error: null,

  fetchPets: async () => {
    set({ loading: true, error: null })
    const response = await api.get<Pet[]>('/pets')
    if (response.success && response.data) {
      set({ pets: response.data })
    } else {
      set({ error: response.message ?? 'Erreur lors du chargement' })
    }
    set({ loading: false })
  },

  fetchPet: async (id) => {
    set({ loading: true, error: null, medicalRecords: [], weightHistory: [], symptomLogs: [], activities: [], feedingLogs: [] })
    const response = await api.get<Pet>(`/pets/${id}`)
    if (response.success && response.data) {
      set({ currentPet: response.data })
    } else {
      set({ error: response.message ?? 'Animal non trouvé' })
    }
    set({ loading: false })
  },

  createPet: async (data) => {
    set({ loading: true, error: null })
    const response = await api.post<Pet>('/pets', data)
    if (response.success && response.data) {
      set((state) => ({ pets: [response.data!, ...state.pets] }))
      set({ loading: false })
      return response.data
    }
    set({ error: response.message ?? 'Erreur lors de la création', loading: false })
    return null
  },

  updatePet: async (id, data) => {
    set({ loading: true, error: null })
    const response = await api.put<Pet>(`/pets/${id}`, data)
    if (response.success && response.data) {
      const updated = response.data
      set((state) => ({
        pets: state.pets.map((p) => (p.id === id ? updated : p)),
        currentPet: state.currentPet?.id === id ? updated : state.currentPet,
        loading: false,
      }))
      return updated
    }
    set({ error: response.message ?? 'Erreur lors de la mise à jour', loading: false })
    return null
  },

  deletePet: async (id) => {
    set({ loading: true, error: null })
    const response = await api.del(`/pets/${id}`)
    if (response.success) {
      set((state) => ({
        pets: state.pets.filter((p) => p.id !== id),
        currentPet: state.currentPet?.id === id ? null : state.currentPet,
        loading: false,
      }))
      return true
    }
    set({ error: response.message ?? 'Erreur lors de la suppression', loading: false })
    return false
  },

  fetchMedicalRecords: async (petId) => {
    const response = await api.get<MedicalRecord[]>(`/pets/${petId}/medical-records`)
    if (response.success && response.data) {
      set({ medicalRecords: response.data })
    }
  },

  createMedicalRecord: async (petId, data) => {
    const response = await api.post<MedicalRecord>(`/pets/${petId}/medical-records`, data)
    if (response.success && response.data) {
      set((state) => ({ medicalRecords: [response.data!, ...state.medicalRecords] }))
      return response.data
    }
    return null
  },

  deleteMedicalRecord: async (recordId) => {
    const response = await api.del(`/medical-records/${recordId}`)
    if (response.success) {
      set((state) => ({
        medicalRecords: state.medicalRecords.filter((r) => r.id !== recordId),
      }))
      return true
    }
    return false
  },

  fetchWeightHistory: async (petId) => {
    const response = await api.get<WeightEntry[]>(`/pets/${petId}/weight`)
    if (response.success && response.data) {
      set({ weightHistory: response.data })
    }
  },

  addWeightEntry: async (petId, weight, recordedAt, notes) => {
    const response = await api.post<WeightEntry>(`/pets/${petId}/weight`, { weight, recordedAt, notes })
    if (response.success && response.data) {
      set((state) => ({ weightHistory: [response.data!, ...state.weightHistory] }))
      return response.data
    }
    return null
  },

  deleteWeightEntry: async (petId, id) => {
    const response = await api.del(`/pets/${petId}/weight/${id}`)
    if (response.success) {
      set((state) => ({ weightHistory: state.weightHistory.filter((w) => w.id !== id) }))
      return true
    }
    return false
  },

  fetchSymptomLogs: async (petId) => {
    const response = await api.get<SymptomLog[]>(`/pets/${petId}/symptoms`)
    if (response.success && response.data) {
      set({ symptomLogs: response.data })
    }
  },

  addSymptomLog: async (petId, data) => {
    const response = await api.post<SymptomLog>(`/pets/${petId}/symptoms`, data)
    if (response.success && response.data) {
      set((state) => ({ symptomLogs: [response.data!, ...state.symptomLogs] }))
      return response.data
    }
    return null
  },

  deleteSymptomLog: async (petId, id) => {
    const response = await api.del(`/pets/${petId}/symptoms/${id}`)
    if (response.success) {
      set((state) => ({ symptomLogs: state.symptomLogs.filter((s) => s.id !== id) }))
      return true
    }
    return false
  },

  fetchActivities: async (petId) => {
    const response = await api.get<Activity[]>(`/pets/${petId}/activities`)
    if (response.success && response.data) {
      set({ activities: response.data })
    }
  },

  addActivity: async (petId, data) => {
    const response = await api.post<Activity>(`/pets/${petId}/activities`, data)
    if (response.success && response.data) {
      set((state) => ({ activities: [response.data!, ...state.activities] }))
      return response.data
    }
    return null
  },

  deleteActivity: async (petId, id) => {
    const response = await api.del(`/pets/${petId}/activities/${id}`)
    if (response.success) {
      set((state) => ({ activities: state.activities.filter((a) => a.id !== id) }))
      return true
    }
    return false
  },

  fetchFeedingLogs: async (petId) => {
    const response = await api.get<FeedingLog[]>(`/pets/${petId}/feeding`)
    if (response.success && response.data) {
      set({ feedingLogs: response.data })
    }
  },

  addFeedingLog: async (petId, data) => {
    const response = await api.post<FeedingLog>(`/pets/${petId}/feeding`, data)
    if (response.success && response.data) {
      set((state) => ({ feedingLogs: [response.data!, ...state.feedingLogs] }))
      return response.data
    }
    return null
  },

  deleteFeedingLog: async (petId, id) => {
    const response = await api.del(`/pets/${petId}/feeding/${id}`)
    if (response.success) {
      set((state) => ({ feedingLogs: state.feedingLogs.filter((f) => f.id !== id) }))
      return true
    }
    return false
  },

  setCurrentPet: (pet) => set({ currentPet: pet }),

  reset: () => set({
    pets: [], currentPet: null, medicalRecords: [],
    weightHistory: [], symptomLogs: [], activities: [], feedingLogs: [], error: null,
  }),
}))
