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

// ─── Suivi ───────────────────────────────────────────────────────────────────

export interface DailyTask {
  key: string
  title: string
  axis: TrainingAxis
  axisLabel: string
  duration: string
  steps: string[]
  tip: string
  done: boolean
  /** Observation du propriétaire, relue par l'IA en fin de cycle. */
  note: string | null
}

/** Fond documentaire d'un axe, chargé à la demande et mis en cache. */
export interface AxisReference {
  axis: TrainingAxis
  label: string
  why: string
  mechanism: string
  mistakes: string[]
  milestones: string[]
  articles: { slug: string; title: string; excerpt: string; readTime?: string | null; image?: string | null }[]
  videos: { title: string; url: string; source: string }[]
  videoSearches: { label: string; url: string }[]
}

export interface ProgramSummary {
  id: number
  petId: number
  assessmentId: number
  petName?: string | null
  petBreed?: string | null
  petAvatarUrl?: string | null
  cycle: number
  week: number
  totalWeeks: number
  theme: string
  goal: string
  sessions: string
  successCriteria: string
  status: 'active' | 'completed'
  /** Vrai à J+7 : la semaine suivante reste verrouillée tant que c'est vrai. */
  checkinDue: boolean
  daysUntilCheckin: number
  /** Deux semaines sans bilan : le suivi est décroché, on propose de repartir. */
  isStale: boolean
  daysSinceWeekStart: number
  scores: Record<TrainingAxis, number>
  overallScore: number
  level: string
  tasks: DailyTask[]
  doneCount: number
  totalCount: number
  startedAt: string
  weekStartedAt: string
}

interface State {
  questionnaire: Questionnaire | null
  current: TrainingAssessment | null
  history: TrainingAssessmentSummary[]
  /** Programmes actifs, un par chien. Alimente l'accueil et la fiche animal. */
  programs: ProgramSummary[]
  programsLoaded: boolean
  /**
   * Dernier bilan connu par animal. Sert de repli à la fiche : un bilan existe
   * dès qu'il a été passé, même si le service de suivi ne répond pas. Sans ce
   * repli, la fiche reproposait le questionnaire à quelqu'un qui l'avait déjà
   * fait — c'est-à-dire lui faisait perdre son plan.
   */
  lastAssessments: Record<string, TrainingAssessmentSummary | null>
  /** Fond documentaire par axe. Il ne change jamais : chargé une seule fois. */
  references: Partial<Record<TrainingAxis, AxisReference>>
  loading: boolean
  submitting: boolean
  generatingPlan: boolean
  /** Message d'erreur à afficher tel quel : jamais un « une erreur est survenue ». */
  error: string | null
  /** Vrai quand l'échec vient du paywall, pour rediriger au lieu d'alerter. */
  premiumRequired: boolean

  fetchToday: () => Promise<void>
  fetchLastAssessment: (petId: string | number) => Promise<void>
  toggleTask: (programId: number, taskKey: string, done: boolean) => Promise<void>
  setTaskNote: (programId: number, taskKey: string, note: string | null) => Promise<void>
  fetchReference: (axis: TrainingAxis) => Promise<AxisReference | null>
  restartWeek: (programId: number) => Promise<boolean>
  programForPet: (petId: string | number) => ProgramSummary | undefined

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
  programs: [],
  programsLoaded: false,
  lastAssessments: {},
  references: {},
  loading: false,
  submitting: false,
  generatingPlan: false,
  error: null,
  premiumRequired: false,

  fetchToday: async () => {
    // Le jour vient du téléphone : le serveur ne connaît pas le fuseau de
    // l'utilisateur, et cocher un exercice à 23 h ne doit pas basculer sur
    // le lendemain.
    const day = new Date().toISOString().slice(0, 10)
    const res = await api.get<ProgramSummary[]>(`/training/today?day=${day}`)
    set({
      programs: res.success && res.data ? res.data : [],
      programsLoaded: true,
    })
  },

  fetchLastAssessment: async (petId) => {
    const res = await api.get<TrainingAssessmentSummary[]>(`/pets/${petId}/training/assessments`)
    // On ne retient qu'un bilan effectivement abouti : un bilan sans plan ne
    // donne rien à revoir, autant reproposer le questionnaire.
    const latest = res.success && res.data ? (res.data.find((a) => a.hasPlan) ?? null) : null
    set((s) => ({ lastAssessments: { ...s.lastAssessments, [String(petId)]: latest } }))
  },

  toggleTask: async (programId, taskKey, done) => {
    const day = new Date().toISOString().slice(0, 10)

    // Bascule optimiste : attendre l'aller-retour rendrait la case molle.
    set((s) => ({
      programs: s.programs.map((p) =>
        p.id === programId
          ? {
              ...p,
              tasks: p.tasks.map((t) => (t.key === taskKey ? { ...t, done } : t)),
              doneCount: p.tasks.filter((t) => (t.key === taskKey ? done : t.done)).length,
            }
          : p
      ),
    }))

    const res = await api.post<ProgramSummary>(`/training/programs/${programId}/tasks`, {
      taskKey,
      done,
      day,
    })

    // Le serveur fait autorité : en cas de refus (semaine verrouillée), on
    // reprend son état plutôt que de laisser une case cochée à tort.
    if (res.success && res.data) {
      set((s) => ({
        programs: s.programs.map((p) => (p.id === programId ? { ...p, ...res.data! } : p)),
      }))
    } else {
      set({ error: res.message ?? "L'exercice n'a pas pu être enregistré" })
      await get().fetchToday()
    }
  },

  setTaskNote: async (programId, taskKey, note) => {
    const day = new Date().toISOString().slice(0, 10)
    const clean = note?.trim() ? note.trim() : null

    // Affichage immédiat : la note est déjà à l'écran quand la requête part.
    set((s) => ({
      programs: s.programs.map((p) =>
        p.id === programId
          ? { ...p, tasks: p.tasks.map((t) => (t.key === taskKey ? { ...t, note: clean } : t)) }
          : p
      ),
    }))

    const res = await api.post<ProgramSummary>(`/training/programs/${programId}/tasks`, {
      taskKey,
      note: clean,
      day,
    })

    if (res.success && res.data) {
      set((s) => ({
        programs: s.programs.map((p) => (p.id === programId ? { ...p, ...res.data! } : p)),
      }))
    } else {
      set({ error: res.message ?? "La note n'a pas pu être enregistrée" })
      await get().fetchToday()
    }
  },

  fetchReference: async (axis) => {
    const cached = get().references[axis]
    if (cached) return cached

    const res = await api.get<AxisReference>(`/training/references/${axis}`)
    if (res.success && res.data) {
      set((s) => ({ references: { ...s.references, [axis]: res.data! } }))
      return res.data
    }
    return null
  },

  restartWeek: async (programId) => {
    const res = await api.post(`/training/programs/${programId}/restart-week`)
    if (res.success) {
      await get().fetchToday()
      return true
    }
    set({ error: res.message ?? "La semaine n'a pas pu être relancée" })
    return false
  },

  programForPet: (petId) => get().programs.find((p) => String(p.petId) === String(petId)),

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
      // Le programme naît avec le plan : on recharge pour que la section
      // « Éducation » de l'accueil apparaisse sans attendre un redémarrage.
      await get().fetchToday()
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
    set({
      current: null,
      history: [],
      programs: [],
      programsLoaded: false,
      lastAssessments: {},
      error: null,
      premiumRequired: false,
      generatingPlan: false,
    }),
}))
