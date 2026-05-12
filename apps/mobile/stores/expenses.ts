import { create } from 'zustand'
import { api } from '@/services/api'
import type { Expense, ExpenseCategory } from '@/types'

interface ExpensesState {
  expenses: Expense[]
  totals: Record<string, number>
  loading: boolean
  error: string | null

  fetchExpenses: (petId?: string) => Promise<void>
  createExpense: (data: {
    petId?: string
    category: ExpenseCategory
    title: string
    description?: string
    amount: number
    expenseDate: string
  }) => Promise<Expense | null>
  deleteExpense: (id: string) => Promise<boolean>
  reset: () => void
}

export const useExpensesStore = create<ExpensesState>((set) => ({
  expenses: [],
  totals: {},
  loading: false,
  error: null,

  fetchExpenses: async (petId) => {
    set({ loading: true, error: null })
    const endpoint = petId ? `/expenses?petId=${petId}` : '/expenses'
    const r = await api.get<{ expenses: Expense[]; totals?: Record<string, number> } | Expense[]>(endpoint)
    if (r.success && r.data) {
      const isWrapped = !Array.isArray(r.data) && 'expenses' in r.data
      const expenses = isWrapped ? (r.data as any).expenses : r.data
      const totals   = isWrapped ? (r.data as any).totals ?? {} : {}
      set({ expenses, totals })
    } else {
      set({ error: r.message ?? 'Erreur chargement dépenses' })
    }
    set({ loading: false })
  },

  createExpense: async (data) => {
    const r = await api.post<Expense>('/expenses', data)
    if (r.success && r.data) {
      set((state) => ({ expenses: [r.data!, ...state.expenses] }))
      return r.data
    }
    return null
  },

  deleteExpense: async (id) => {
    const r = await api.del(`/expenses/${id}`)
    if (r.success) {
      set((state) => ({ expenses: state.expenses.filter((e) => e.id !== id) }))
      return true
    }
    return false
  },

  reset: () => set({ expenses: [], totals: {}, error: null }),
}))
