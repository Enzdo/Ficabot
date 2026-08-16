import { create } from 'zustand'
import { api } from '@/services/api'

// ─── Types miroirs du backend (app/services/training/questionnaire.ts) ───────

export type TrainingAxis = 'obedience' | 'recall' | 'leash' | 'social' | 'calm' | 'daily'

export interface TrainingAxisInfo {
  key: TrainingAxis
  label: string
  emoji: string
  description: string
}

export interface TrainingQuestion {
  id: string
  axis: TrainingAxis
  text: string
  help?: string
  weight: number
  options: { value: string; label: string; score: number }[]
}

export interface ContextQuestion {
  id: string
  text: string
  help?: string
  options: { value: string; label: string }[]
}

export interface Questionnaire {
  axes: TrainingAxisInfo[]
  questions: TrainingQuestion[]
  contextQuestions: ContextQuestion[]
}

export interface TrainingPlanExercise {
  title: string
  axis: TrainingAxis
  duration: string
  steps: string[]
  tip: string
}

export interface TrainingPlanWeek {
  week: number
  theme: string
  goal: string
  sessions: string
  exercises: TrainingPlanExercise[]
  successCriteria: string
}

export interface TrainingPlan {
  summary: string
  breedInsight: string
  priorities: { axis: TrainingAxis; title: string; why: string }[]
  weeks: TrainingPlanWeek[]
  dailyRoutine: string[]
  mistakesToAvoid: string[]
  whenToSeePro: string
}

export interface TrainingAssessment {
  id: number
  petId: number
  petName: string | null
  petBreed: string | null
  scores: Record<TrainingAxis, number>
  overallScore: number
  level: 'debutant' | 'apprenti' | 'confirme' | 'expert'
  levelLabel: string
  levelMessage: string
  strongest: TrainingAxis
  weakest: TrainingAxis[]
  plan: TrainingPlan | null
  planStatus: 'none' | 'processing' | 'completed' | 'failed'
  planFromAi: boolean
  planError: string | null
  createdAt: string
}

export interface TrainingAssessmentSummary {
  id: number
  overallScore: number
  level: TrainingAssessment['level']
  scores: Record<TrainingAxis, number>
  hasPlan: boolean
  planStatus: TrainingAssessment['planStatus']
  createdAt: string
}

interface State {
  questionnaire: Questionnaire | null
  current: TrainingAssessment | null
  history: TrainingAssessmentSummary[]
  loading: boolean
  submitting: boolean
  generatingPlan: boolean
  /** Message d'erreur à afficher tel quel : jamais un « une erreur est survenue ». */
  error: string | null
  /** Vrai quand l'échec vient du paywall, pour rediriger au lieu d'alerter. */
  premiumRequired: boolean

  fetchQuestionnaire: () => Promise<Questionnaire | null>
  submit: (
    petId: string,
    answers: Record<string, string>,
    context: Record<string, string>
  ) => Promise<TrainingAssessment | null>
  fetchAssessment: (id: string | number) => Promise<void>
  fetchHistory: (petId: string) => Promise<void>
  generatePlan: (id: string | number) => Promise<boolean>
  deleteAssessment: (id: string | number) => Promise<boolean>
  clearError: () => void
  reset: () => void
}

export const useTrainingStore = create<State>((set, get) => ({
  questionnaire: null,
  current: null,
  history: [],
  loading: false,
  submitting: false,
  generatingPlan: false,
  error: null,
  premiumRequired: false,

  fetchQuestionnaire: async () => {
    // Le catalogue ne change pas d'une session à l'autre : inutile de le
    // rappeler à chaque ouverture de l'écran.
    const cached = get().questionnaire
    if (cached) return cached

    set({ loading: true, error: null })
    const res = await api.get<Questionnaire>('/training/questionnaire')
    if (res.success && res.data) {
      set({ questionnaire: res.data, loading: false })
      return res.data
    }
    set({ loading: false, error: res.message ?? 'Questionnaire indisponible' })
    return null
  },

  submit: async (petId, answers, context) => {
    set({ submitting: true, error: null })
    const res = await api.post<TrainingAssessment>(`/pets/${petId}/training/assessments`, {
      answers,
      context,
    })
    if (res.success && res.data) {
      set({ current: res.data, submitting: false })
      return res.data
    }
    set({ submitting: false, error: res.message ?? "Le bilan n'a pas pu être enregistré" })
    return null
  },

  fetchAssessment: async (id) => {
    set({ loading: true, error: null })
    const res = await api.get<TrainingAssessment>(`/training/assessments/${id}`)
    if (res.success && res.data) {
      set({ current: res.data, loading: false })
    } else {
      set({ loading: false, error: res.message ?? 'Bilan introuvable' })
    }
  },

  fetchHistory: async (petId) => {
    const res = await api.get<TrainingAssessmentSummary[]>(`/pets/${petId}/training/assessments`)
    set({ history: res.success && res.data ? res.data : [] })
  },

  generatePlan: async (id) => {
    set({ generatingPlan: true, error: null, premiumRequired: false })
    const res = await api.post<TrainingAssessment>(`/training/assessments/${id}/plan`)
    if (res.success && res.data) {
      set({ current: res.data, generatingPlan: false })
      return true
    }
    const isPremium = res.errors?.code?.includes('PREMIUM_REQUIRED')
    set({
      generatingPlan: false,
      premiumRequired: !!isPremium,
      error: isPremium ? null : (res.message ?? "Le plan n'a pas pu être généré"),
    })
    return false
  },

  deleteAssessment: async (id) => {
    const res = await api.del(`/training/assessments/${id}`)
    if (res.success) {
      set((s) => ({
        history: s.history.filter((h) => String(h.id) !== String(id)),
        current: String(s.current?.id) === String(id) ? null : s.current,
      }))
      return true
    }
    set({ error: res.message ?? 'Suppression impossible' })
    return false
  },

  clearError: () => set({ error: null, premiumRequired: false }),

  reset: () =>
    set({ current: null, history: [], error: null, premiumRequired: false, generatingPlan: false }),
}))
