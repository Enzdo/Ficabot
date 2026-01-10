import { defineStore } from 'pinia'
import type {
  Pet,
  MedicalRecord,
  HealthBook,
  CreatePetDTO,
  UpdatePetDTO,
  CreateMedicalRecordDTO,
  UpdateMedicalRecordDTO,
  UpdateHealthBookDTO,
  AddVaccineDTO,
  AddAntiparasiticDTO,
  AddDewormingDTO,
  AddSurgeryDTO,
  AddAllergyDTO,
  AddChronicConditionDTO,
  AddMedicationDTO,
  AddVetVisitDTO,
  AddWeightHistoryDTO,
} from '@ficabot/shared'

interface PetsState {
  pets: Pet[]
  currentPet: Pet | null
  medicalRecords: MedicalRecord[]
  healthBook: HealthBook | null
  loading: boolean
  error: string | null
}

export const usePetsStore = defineStore('pets', {
  state: (): PetsState => ({
    pets: [],
    currentPet: null,
    medicalRecords: [],
    healthBook: null,
    loading: false,
    error: null,
  }),

  actions: {
    async fetchPets() {
      this.loading = true
      this.error = null

      const api = useApi()
      const response = await api.get<Pet[]>('/pets')

      if (response.success && response.data) {
        this.pets = response.data
      } else {
        this.error = response.message || 'Erreur lors du chargement des animaux'
      }

      this.loading = false
    },

    async fetchPet(id: string) {
      this.loading = true
      this.error = null

      const api = useApi()
      const response = await api.get<Pet>(`/pets/${id}`)

      if (response.success && response.data) {
        this.currentPet = response.data
      } else {
        this.error = response.message || 'Animal non trouvé'
      }

      this.loading = false
    },

    async createPet(data: CreatePetDTO) {
      this.loading = true
      this.error = null

      const api = useApi()
      const response = await api.post<Pet>('/pets', data)

      if (response.success && response.data) {
        this.pets.unshift(response.data)
        this.loading = false
        return response.data
      } else {
        this.error = response.message || 'Erreur lors de la création'
        this.loading = false
        return null
      }
    },

    async updatePet(id: string, data: UpdatePetDTO) {
      this.loading = true
      this.error = null

      const api = useApi()
      const response = await api.put<Pet>(`/pets/${id}`, data)

      if (response.success && response.data) {
        const index = this.pets.findIndex(p => p.id === id)
        if (index !== -1) {
          this.pets[index] = response.data
        }
        if (this.currentPet?.id === id) {
          this.currentPet = response.data
        }
        this.loading = false
        return response.data
      } else {
        this.error = response.message || 'Erreur lors de la mise à jour'
        this.loading = false
        return null
      }
    },

    async deletePet(id: string) {
      this.loading = true
      this.error = null

      const api = useApi()
      const response = await api.del(`/pets/${id}`)

      if (response.success) {
        this.pets = this.pets.filter(p => p.id !== id)
        if (this.currentPet?.id === id) {
          this.currentPet = null
        }
        this.loading = false
        return true
      } else {
        this.error = response.message || 'Erreur lors de la suppression'
        this.loading = false
        return false
      }
    },

    async fetchMedicalRecords(petId: string) {
      this.loading = true
      this.error = null

      const api = useApi()
      const response = await api.get<MedicalRecord[]>(`/pets/${petId}/medical-records`)

      if (response.success && response.data) {
        this.medicalRecords = response.data
      } else {
        this.error = response.message || 'Erreur lors du chargement'
      }

      this.loading = false
    },

    async createMedicalRecord(petId: string, data: CreateMedicalRecordDTO) {
      this.loading = true
      this.error = null

      const api = useApi()
      const response = await api.post<MedicalRecord>(`/pets/${petId}/medical-records`, data)

      if (response.success && response.data) {
        this.medicalRecords.unshift(response.data)
        this.loading = false
        return response.data
      } else {
        this.error = response.message || 'Erreur lors de la création'
        this.loading = false
        return null
      }
    },

    async updateMedicalRecord(recordId: string, data: UpdateMedicalRecordDTO) {
      this.loading = true
      this.error = null

      const api = useApi()
      const response = await api.put<MedicalRecord>(`/medical-records/${recordId}`, data)

      if (response.success && response.data) {
        const index = this.medicalRecords.findIndex(r => r.id === recordId)
        if (index !== -1) {
          this.medicalRecords[index] = response.data
        }
        this.loading = false
        return response.data
      } else {
        this.error = response.message || 'Erreur lors de la mise à jour'
        this.loading = false
        return null
      }
    },

    async deleteMedicalRecord(recordId: string) {
      this.loading = true
      this.error = null

      const api = useApi()
      const response = await api.del(`/medical-records/${recordId}`)

      if (response.success) {
        this.medicalRecords = this.medicalRecords.filter(r => r.id !== recordId)
        this.loading = false
        return true
      } else {
        this.error = response.message || 'Erreur lors de la suppression'
        this.loading = false
        return false
      }
    },

    // Health Book actions
    async fetchHealthBook(petId: string) {
      this.loading = true
      this.error = null

      const api = useApi()
      const response = await api.get<HealthBook>(`/pets/${petId}/health-book`)

      if (response.success && response.data) {
        this.healthBook = response.data
      } else {
        this.error = response.message || 'Erreur lors du chargement du carnet de santé'
      }

      this.loading = false
    },

    async updateHealthBook(petId: string, data: UpdateHealthBookDTO) {
      this.loading = true
      this.error = null

      const api = useApi()
      const response = await api.put<HealthBook>(`/pets/${petId}/health-book`, data)

      if (response.success && response.data) {
        this.healthBook = response.data
        this.loading = false
        return response.data
      } else {
        this.error = response.message || 'Erreur lors de la mise à jour'
        this.loading = false
        return null
      }
    },

    // Vaccine actions
    async addVaccine(petId: string, data: AddVaccineDTO) {
      const api = useApi()
      const response = await api.post<HealthBook>(`/pets/${petId}/health-book/vaccines`, data)

      if (response.success && response.data) {
        this.healthBook = response.data
        return true
      }
      return false
    },

    async removeVaccine(petId: string, entryId: string) {
      const api = useApi()
      const response = await api.del<HealthBook>(`/pets/${petId}/health-book/vaccines`, { entryId })

      if (response.success && response.data) {
        this.healthBook = response.data
        return true
      }
      return false
    },

    // Antiparasitic actions
    async addAntiparasitic(petId: string, data: AddAntiparasiticDTO) {
      const api = useApi()
      const response = await api.post<HealthBook>(`/pets/${petId}/health-book/antiparasitics`, data)

      if (response.success && response.data) {
        this.healthBook = response.data
        return true
      }
      return false
    },

    async removeAntiparasitic(petId: string, entryId: string) {
      const api = useApi()
      const response = await api.del<HealthBook>(`/pets/${petId}/health-book/antiparasitics`, { entryId })

      if (response.success && response.data) {
        this.healthBook = response.data
        return true
      }
      return false
    },

    // Deworming actions
    async addDeworming(petId: string, data: AddDewormingDTO) {
      const api = useApi()
      const response = await api.post<HealthBook>(`/pets/${petId}/health-book/dewormings`, data)

      if (response.success && response.data) {
        this.healthBook = response.data
        return true
      }
      return false
    },

    async removeDeworming(petId: string, entryId: string) {
      const api = useApi()
      const response = await api.del<HealthBook>(`/pets/${petId}/health-book/dewormings`, { entryId })

      if (response.success && response.data) {
        this.healthBook = response.data
        return true
      }
      return false
    },

    // Surgery actions
    async addSurgery(petId: string, data: AddSurgeryDTO) {
      const api = useApi()
      const response = await api.post<HealthBook>(`/pets/${petId}/health-book/surgeries`, data)

      if (response.success && response.data) {
        this.healthBook = response.data
        return true
      }
      return false
    },

    async removeSurgery(petId: string, entryId: string) {
      const api = useApi()
      const response = await api.del<HealthBook>(`/pets/${petId}/health-book/surgeries`, { entryId })

      if (response.success && response.data) {
        this.healthBook = response.data
        return true
      }
      return false
    },

    // Allergy actions
    async addAllergy(petId: string, data: AddAllergyDTO) {
      const api = useApi()
      const response = await api.post<HealthBook>(`/pets/${petId}/health-book/allergies`, data)

      if (response.success && response.data) {
        this.healthBook = response.data
        return true
      }
      return false
    },

    async removeAllergy(petId: string, entryId: string) {
      const api = useApi()
      const response = await api.del<HealthBook>(`/pets/${petId}/health-book/allergies`, { entryId })

      if (response.success && response.data) {
        this.healthBook = response.data
        return true
      }
      return false
    },

    // Chronic condition actions
    async addChronicCondition(petId: string, data: AddChronicConditionDTO) {
      const api = useApi()
      const response = await api.post<HealthBook>(`/pets/${petId}/health-book/chronic-conditions`, data)

      if (response.success && response.data) {
        this.healthBook = response.data
        return true
      }
      return false
    },

    async removeChronicCondition(petId: string, entryId: string) {
      const api = useApi()
      const response = await api.del<HealthBook>(`/pets/${petId}/health-book/chronic-conditions`, { entryId })

      if (response.success && response.data) {
        this.healthBook = response.data
        return true
      }
      return false
    },

    // Medication actions
    async addMedication(petId: string, data: AddMedicationDTO) {
      const api = useApi()
      const response = await api.post<HealthBook>(`/pets/${petId}/health-book/medications`, data)

      if (response.success && response.data) {
        this.healthBook = response.data
        return true
      }
      return false
    },

    async removeMedication(petId: string, entryId: string) {
      const api = useApi()
      const response = await api.del<HealthBook>(`/pets/${petId}/health-book/medications`, { entryId })

      if (response.success && response.data) {
        this.healthBook = response.data
        return true
      }
      return false
    },

    // Vet visit actions
    async addVetVisit(petId: string, data: AddVetVisitDTO) {
      const api = useApi()
      const response = await api.post<HealthBook>(`/pets/${petId}/health-book/vet-visits`, data)

      if (response.success && response.data) {
        this.healthBook = response.data
        return true
      }
      return false
    },

    async removeVetVisit(petId: string, entryId: string) {
      const api = useApi()
      const response = await api.del<HealthBook>(`/pets/${petId}/health-book/vet-visits`, { entryId })

      if (response.success && response.data) {
        this.healthBook = response.data
        return true
      }
      return false
    },

    // Weight history actions
    async addWeightHistory(petId: string, data: AddWeightHistoryDTO) {
      const api = useApi()
      const response = await api.post<HealthBook>(`/pets/${petId}/health-book/weight-history`, data)

      if (response.success && response.data) {
        this.healthBook = response.data
        return true
      }
      return false
    },

    async removeWeightHistory(petId: string, entryId: string) {
      const api = useApi()
      const response = await api.del<HealthBook>(`/pets/${petId}/health-book/weight-history`, { entryId })

      if (response.success && response.data) {
        this.healthBook = response.data
        return true
      }
      return false
    },

    // Scan photo actions
    async scanHealthBookPhoto(petId: string, imageBase64: string) {
      this.loading = true
      this.error = null

      const api = useApi()
      const response = await api.post<object>(`/pets/${petId}/health-book/scan`, { image: imageBase64 })

      this.loading = false

      if (response.success && response.data) {
        return response.data
      } else {
        this.error = response.message || 'Erreur lors de l\'analyse de l\'image'
        return null
      }
    },

    async applyScannedData(petId: string, data: object) {
      this.loading = true
      this.error = null

      const api = useApi()
      const response = await api.post<HealthBook>(`/pets/${petId}/health-book/apply-scan`, data)

      if (response.success && response.data) {
        this.healthBook = response.data
        this.loading = false
        return true
      } else {
        this.error = response.message || 'Erreur lors de l\'application des données'
        this.loading = false
        return false
      }
    },
  },
})
