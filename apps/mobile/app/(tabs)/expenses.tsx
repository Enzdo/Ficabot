import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useExpensesStore } from '@/stores/expenses'
import { usePetsStore } from '@/stores/pets'
import { DateInput } from '@/components/ui/DateInput'
import { formatAmount } from '@/utils/date'
import { colors, radius, shadow } from '@/constants/theme'
import type { ExpenseCategory } from '@/types'

// ─── Config ─────────────────────────────────────────────────────────────────

const CATEGORIES: { key: ExpenseCategory; label: string; emoji: string; color: string; bg: string }[] = [
  { key: 'vet',         label: 'Vétérinaire', emoji: '🏥', color: colors.blue,   bg: colors.blueLight   },
  { key: 'food',        label: 'Alimentation',emoji: '🍖', color: colors.green,  bg: colors.greenLight  },
  { key: 'grooming',    label: 'Toilettage',  emoji: '✂️', color: colors.orange, bg: colors.orangeLight },
  { key: 'medication',  label: 'Médicaments', emoji: '💊', color: colors.red,    bg: colors.redLight    },
  { key: 'accessories', label: 'Accessoires', emoji: '🎾', color: colors.beige,  bg: colors.beigeLight  },
  { key: 'insurance',   label: 'Assurance',   emoji: '🛡️', color: colors.gray[700], bg: colors.gray[100] },
  { key: 'other',       label: 'Autre',       emoji: '📦', color: colors.gray[500], bg: colors.gray[100] },
]

function getCat(key: ExpenseCategory) {
  return CATEGORIES.find((c) => c.key === key) ?? CATEGORIES[CATEGORIES.length - 1]
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ExpensesScreen() {
  const { expenses, loading, error: expensesError, fetchExpenses, createExpense, deleteExpense } = useExpensesStore()
  const { pets, fetchPets } = usePetsStore()

  const [filterCat, setFilterCat] = useState<ExpenseCategory | 'all'>('all')
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form state
  const [formCategory, setFormCategory] = useState<ExpenseCategory>('vet')
  const [formTitle, setFormTitle]       = useState('')
  const [formAmount, setFormAmount]     = useState('')
  const [formDate, setFormDate]         = useState(new Date().toISOString().slice(0, 10))
  const [formPetId, setFormPetId]       = useState<string>('')
  const [formDesc, setFormDesc]         = useState('')

  useEffect(() => {
    fetchExpenses()
    fetchPets()
  }, [fetchExpenses, fetchPets])

  const filtered      = useMemo(() => filterCat === 'all' ? expenses : expenses.filter((e) => e.category === filterCat), [expenses, filterCat])
  const total         = useMemo(() => filtered.reduce((sum, e) => sum + Number(e.amount), 0), [filtered])
  const totalAllTime  = useMemo(() => expenses.reduce((sum, e) => sum + Number(e.amount), 0), [expenses])
  const byCategory    = useMemo(() => CATEGORIES.map((cat) => ({
    ...cat,
    total: expenses.filter((e) => e.category === cat.key).reduce((s, e) => s + Number(e.amount), 0),
  })).filter((c) => c.total > 0).sort((a, b) => b.total - a.total), [expenses])

  function resetForm() {
    setFormCategory('vet')
    setFormTitle('')
    setFormAmount('')
    setFormDate(new Date().toISOString().slice(0, 10))
    setFormPetId('')
    setFormDesc('')
  }

  async function handleCreate() {
    if (saving) return
    const amount = parseFloat(formAmount.replace(',', '.'))
    if (!formTitle.trim()) return Alert.alert('Erreur', 'Titre requis')
    if (isNaN(amount) || amount <= 0) return Alert.alert('Erreur', 'Montant invalide')
    if (!formDate) return Alert.alert('Erreur', 'Date requise')

    setSaving(true)
    const result = await createExpense({
      category: formCategory,
      title: formTitle.trim(),
      amount,
      expenseDate: formDate,
      petId: formPetId || undefined,
      description: formDesc.trim() || undefined,
    })
    setSaving(false)
    if (result) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      setShowModal(false)
      resetForm()
    } else {
      Alert.alert('Erreur', 'Impossible d\'enregistrer la dépense')
    }
  }

  function handleDelete(id: string, title: string) {
    Alert.alert('Supprimer', `Supprimer "${title}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive',
        onPress: async () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
          await deleteExpense(id)
        },
      },
    ])
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => fetchExpenses()} tintColor={colors.green} />}
      >
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.headerSub}>Dépenses</Text>
            <Text style={s.headerTitle}>Suivi budgétaire</Text>
          </View>
          <View style={s.totalBadge}>
            <Text style={s.totalBadgeLabel}>Total</Text>
            <Text style={s.totalBadgeValue}>{formatAmount(totalAllTime)}</Text>
          </View>
        </View>

        {/* Top breakdown */}
        {byCategory.length > 0 && (
          <View style={s.breakdownCard}>
            <Text style={s.breakdownTitle}>Répartition</Text>
            <View style={s.breakdownBar}>
              {byCategory.map((cat) => (
                <View
                  key={cat.key}
                  style={[s.breakdownSegment, { flex: cat.total, backgroundColor: cat.color }]}
                />
              ))}
            </View>
            <View style={s.breakdownLegend}>
              {byCategory.slice(0, 4).map((cat) => (
                <View key={cat.key} style={s.legendItem}>
                  <View style={[s.legendDot, { backgroundColor: cat.color }]} />
                  <Text style={s.legendLabel}>{cat.label}</Text>
                  <Text style={s.legendValue}>{formatAmount(cat.total)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Category filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filtersRow}>
          <Pressable
            style={[s.filterChip, filterCat === 'all' && s.filterChipActive]}
            onPress={() => { Haptics.selectionAsync(); setFilterCat('all') }}
          >
            <Text style={[s.filterChipText, filterCat === 'all' && s.filterChipTextActive]}>
              Tout · {formatAmount(totalAllTime)}
            </Text>
          </Pressable>
          {CATEGORIES.filter((c) => expenses.some((e) => e.category === c.key)).map((cat) => {
            const active = filterCat === cat.key
            const catTotal = expenses.filter((e) => e.category === cat.key).reduce((s, e) => s + Number(e.amount), 0)
            return (
              <Pressable
                key={cat.key}
                style={[s.filterChip, active && s.filterChipActive]}
                onPress={() => { Haptics.selectionAsync(); setFilterCat(cat.key) }}
              >
                <Text style={[s.filterChipText, active && s.filterChipTextActive]}>
                  {cat.emoji} {cat.label} · {formatAmount(catTotal)}
                </Text>
              </Pressable>
            )
          })}
        </ScrollView>

        {/* Filtered total */}
        {filterCat !== 'all' && (
          <View style={s.filteredTotal}>
            <Text style={s.filteredTotalText}>
              {filtered.length} dépense{filtered.length > 1 ? 's' : ''} · {formatAmount(total)}
            </Text>
          </View>
        )}

        {/* Expense list */}
        {expensesError && expenses.length === 0 ? (
          <View style={s.emptyBox}>
            <Text style={s.emptyEmoji}>⚠️</Text>
            <Text style={s.emptyTitle}>Impossible de charger</Text>
            <Text style={s.emptyDesc}>{expensesError}</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={s.emptyBox}>
            <Text style={s.emptyEmoji}>💰</Text>
            <Text style={s.emptyTitle}>Aucune dépense</Text>
            <Text style={s.emptyDesc}>Appuyez sur + pour enregistrer une dépense</Text>
          </View>
        ) : (
          <View style={s.list}>
            {filtered.map((expense) => {
              const cat = getCat(expense.category)
              return (
                <View key={expense.id} style={[s.expenseCard, shadow.sm]}>
                  <View style={[s.expenseIcon, { backgroundColor: cat.bg }]}>
                    <Text style={s.expenseEmoji}>{cat.emoji}</Text>
                  </View>
                  <View style={s.expenseInfo}>
                    <Text style={s.expenseTitle} numberOfLines={1}>{expense.title}</Text>
                    <Text style={s.expenseMeta}>
                      {cat.label}
                      {expense.pet ? ` · ${expense.pet.name}` : ''}
                      {' · '}{formatDate(expense.expenseDate)}
                    </Text>
                    {expense.description ? (
                      <Text style={s.expenseDesc} numberOfLines={1}>{expense.description}</Text>
                    ) : null}
                  </View>
                  <View style={s.expenseRight}>
                    <Text style={[s.expenseAmount, { color: cat.color }]}>{formatAmount(Number(expense.amount))}</Text>
                    <Pressable onPress={() => handleDelete(expense.id, expense.title)} hitSlop={8}>
                      <Ionicons name="trash-outline" size={16} color={colors.gray[400]} />
                    </Pressable>
                  </View>
                </View>
              )
            })}
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <Pressable
        style={({ pressed }) => [s.fab, shadow.green, pressed && { opacity: 0.85, transform: [{ scale: 0.96 }] }]}
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setShowModal(true) }}
      >
        <Ionicons name="add" size={28} color={colors.white} />
      </Pressable>

      {showModal && <Modal visible={showModal} animationType="slide" transparent onRequestClose={() => setShowModal(false)}>
        <Pressable style={s.backdrop} onPress={() => setShowModal(false)} />
        <View style={s.sheet}>
          <View style={s.sheetHandle} />
          <Text style={s.sheetTitle}>Nouvelle dépense</Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Category picker */}
            <Text style={s.label}>Catégorie</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.catRow}>
              {CATEGORIES.map((cat) => (
                <Pressable
                  key={cat.key}
                  style={[s.catChip, formCategory === cat.key && { backgroundColor: cat.bg, borderColor: cat.color }]}
                  onPress={() => { Haptics.selectionAsync(); setFormCategory(cat.key) }}
                >
                  <Text style={s.catChipEmoji}>{cat.emoji}</Text>
                  <Text style={[s.catChipLabel, formCategory === cat.key && { color: cat.color, fontWeight: '700' }]}>
                    {cat.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Title */}
            <Text style={s.label}>Titre *</Text>
            <TextInput
              style={s.input}
              value={formTitle}
              onChangeText={setFormTitle}
              placeholder="Ex : Consultation Dr Martin"
              placeholderTextColor={colors.gray[400]}
            />

            {/* Amount */}
            <Text style={s.label}>Montant (€) *</Text>
            <TextInput
              style={s.input}
              value={formAmount}
              onChangeText={setFormAmount}
              placeholder="0.00"
              placeholderTextColor={colors.gray[400]}
              keyboardType="decimal-pad"
            />

            {/* Date */}
            <DateInput label="Date *" value={formDate} onChange={setFormDate} maximumDate={new Date()} />

            {/* Pet selector */}
            {pets.length > 0 && (
              <>
                <Text style={s.label}>Animal (optionnel)</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.petRow}>
                  <Pressable
                    style={[s.petChip, !formPetId && s.petChipActive]}
                    onPress={() => { Haptics.selectionAsync(); setFormPetId('') }}
                  >
                    <Text style={[s.petChipText, !formPetId && s.petChipTextActive]}>Aucun</Text>
                  </Pressable>
                  {pets.map((pet) => (
                    <Pressable
                      key={pet.id}
                      style={[s.petChip, formPetId === pet.id && s.petChipActive]}
                      onPress={() => { Haptics.selectionAsync(); setFormPetId(pet.id) }}
                    >
                      <Text style={[s.petChipText, formPetId === pet.id && s.petChipTextActive]}>{pet.name}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </>
            )}

            {/* Description */}
            <Text style={s.label}>Description (optionnel)</Text>
            <TextInput
              style={[s.input, s.inputMultiline]}
              value={formDesc}
              onChangeText={setFormDesc}
              placeholder="Détails…"
              placeholderTextColor={colors.gray[400]}
              multiline
              numberOfLines={3}
            />

            {/* Submit */}
            <Pressable
              style={({ pressed }) => [s.submitBtn, saving && { opacity: 0.6 }, pressed && !saving && { opacity: 0.85 }]}
              onPress={handleCreate}
              disabled={saving}
            >
              <Text style={s.submitBtnText}>{saving ? 'En cours…' : 'Enregistrer'}</Text>
            </Pressable>
          </ScrollView>
        </View>
      </Modal>}
    </SafeAreaView>
  )
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: colors.beigePale },
  scroll:  { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 100, gap: 16, paddingTop: 12 },

  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerSub:    { fontSize: 12, fontWeight: '700', color: colors.gray[400], letterSpacing: 1, textTransform: 'uppercase' },
  headerTitle:  { fontSize: 26, fontWeight: '800', color: colors.dark, marginTop: 2 },
  totalBadge:   { backgroundColor: colors.dark, borderRadius: radius.xl, paddingHorizontal: 16, paddingVertical: 10, alignItems: 'center' },
  totalBadgeLabel: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.5)', letterSpacing: 0.5 },
  totalBadgeValue: { fontSize: 18, fontWeight: '800', color: colors.white, marginTop: 2 },

  breakdownCard:  { backgroundColor: colors.white, borderRadius: radius['2xl'], padding: 16, borderWidth: 1, borderColor: colors.gray[200] },
  breakdownTitle: { fontSize: 13, fontWeight: '700', color: colors.gray[600], marginBottom: 10 },
  breakdownBar:   { flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden', gap: 2 },
  breakdownSegment: { borderRadius: 4 },
  breakdownLegend:  { marginTop: 12, gap: 6 },
  legendItem:     { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot:      { width: 8, height: 8, borderRadius: 4 },
  legendLabel:    { flex: 1, fontSize: 12, fontWeight: '600', color: colors.dark },
  legendValue:    { fontSize: 12, fontWeight: '700', color: colors.dark },

  filtersRow:   { gap: 8, paddingVertical: 4 },
  filterChip:   { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.full, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.gray[200] },
  filterChipActive: { backgroundColor: colors.dark, borderColor: colors.dark },
  filterChipText:   { fontSize: 12, fontWeight: '600', color: colors.gray[600] },
  filterChipTextActive: { color: colors.white },

  filteredTotal: { alignItems: 'flex-end' },
  filteredTotalText: { fontSize: 12, color: colors.gray[500], fontWeight: '600' },

  emptyBox:   { alignItems: 'center', paddingVertical: 48, gap: 8 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.dark },
  emptyDesc:  { fontSize: 13, color: colors.gray[400], textAlign: 'center' },

  list: { gap: 10 },
  expenseCard:  { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, borderRadius: radius['2xl'], padding: 14, borderWidth: 1, borderColor: colors.gray[200] },
  expenseIcon:  { width: 44, height: 44, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  expenseEmoji: { fontSize: 22 },
  expenseInfo:  { flex: 1, minWidth: 0 },
  expenseTitle: { fontSize: 14, fontWeight: '700', color: colors.dark },
  expenseMeta:  { fontSize: 11, color: colors.gray[400], marginTop: 2 },
  expenseDesc:  { fontSize: 11, color: colors.gray[400], marginTop: 2, fontStyle: 'italic' },
  expenseRight: { alignItems: 'flex-end', gap: 6 },
  expenseAmount: { fontSize: 15, fontWeight: '800' },

  fab: {
    position: 'absolute', bottom: 28, right: 20,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.green,
    alignItems: 'center', justifyContent: 'center',
  },

  backdrop: { flex: 1, backgroundColor: 'rgba(26,22,20,0.45)' },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius['3xl'],
    borderTopRightRadius: radius['3xl'],
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.gray[200], alignSelf: 'center', marginBottom: 16 },
  sheetTitle:  { fontSize: 20, fontWeight: '800', color: colors.dark, marginBottom: 20 },

  label:         { fontSize: 12, fontWeight: '700', color: colors.gray[600], marginBottom: 6, marginTop: 14, letterSpacing: 0.3, textTransform: 'uppercase' },
  input:         { backgroundColor: colors.gray[50], borderRadius: radius.md, borderWidth: 1, borderColor: colors.gray[200], paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: colors.dark },
  inputMultiline:{ minHeight: 80, textAlignVertical: 'top' },

  catRow: { gap: 8, paddingBottom: 4 },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: radius.full, borderWidth: 1, borderColor: colors.gray[200],
    backgroundColor: colors.gray[50],
  },
  catChipEmoji: { fontSize: 16 },
  catChipLabel: { fontSize: 12, fontWeight: '600', color: colors.gray[600] },

  petRow:         { gap: 8, paddingBottom: 4 },
  petChip:        { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.full, backgroundColor: colors.gray[50], borderWidth: 1, borderColor: colors.gray[200] },
  petChipActive:  { backgroundColor: colors.greenLight, borderColor: colors.green },
  petChipText:    { fontSize: 13, fontWeight: '600', color: colors.gray[600] },
  petChipTextActive: { color: colors.green },

  submitBtn:     { marginTop: 24, backgroundColor: colors.dark, borderRadius: radius.xl, paddingVertical: 16, alignItems: 'center' },
  submitBtnText: { fontSize: 16, fontWeight: '800', color: colors.white },
})
