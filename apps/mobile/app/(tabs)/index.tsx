import { useCallback, useEffect, useState } from 'react'
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import { useAuthStore } from '@/stores/auth'
import { usePetsStore } from '@/stores/pets'
import { useExpensesStore } from '@/stores/expenses'
import { api } from '@/services/api'
import { colors, radius, shadow } from '@/constants/theme'
import type { VetAppointment, Reminder } from '@/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SPECIES_EMOJI: Record<string, string> = { dog: '🐕', cat: '🐱', rabbit: '🐰', bird: '🦜' }
const SPECIES_BG:    Record<string, string> = {
  dog:    colors.beigeLight,
  cat:    colors.greenLight,
  rabbit: colors.greenLight,
  bird:   colors.beigeLight,
}

const CAT_COLORS: Record<string, string> = {
  vet: colors.blue, food: colors.green, grooming: colors.orange,
  medication: colors.red, accessories: colors.beige, insurance: colors.gray[600], other: colors.gray[400],
}

function daysUntil(dateStr: string) {
  const now  = new Date(); now.setHours(0, 0, 0, 0)
  const then = new Date(dateStr); then.setHours(0, 0, 0, 0)
  return Math.round((then.getTime() - now.getTime()) / 86400000)
}

function friendlyDate(dateStr: string) {
  const d    = new Date(dateStr)
  const days = daysUntil(dateStr)
  if (days === 0) return "Aujourd'hui"
  if (days === 1) return 'Demain'
  if (days === -1) return 'Hier'
  if (days > 0 && days <= 7) return `Dans ${days} jours`
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const user                          = useAuthStore((s) => s.user)
  const { pets, loading, fetchPets }  = usePetsStore()
  const { expenses, fetchExpenses }   = useExpensesStore()

  const [nextAppt,    setNextAppt]    = useState<VetAppointment | null>(null)
  const [reminders,   setReminders]   = useState<Reminder[]>([])
  const [loadingData, setLoadingData] = useState(true)

  const load = useCallback(async () => {
    setLoadingData(true)
    await Promise.all([
      fetchPets(),
      fetchExpenses(),
      (async () => {
        const r = await api.get<VetAppointment[]>('/appointments')
        if (r.success && r.data) {
          const upcoming = r.data
            .filter((a) => new Date(a.date) >= new Date() && a.status !== 'cancelled')
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          setNextAppt(upcoming[0] ?? null)
        }
      })(),
      (async () => {
        const r = await api.get<Reminder[]>('/reminders')
        if (r.success && r.data) {
          setReminders(r.data.filter((rem) => !rem.isCompleted && daysUntil(rem.dueDate) <= 7).slice(0, 4))
        }
      })(),
    ])
    setLoadingData(false)
  }, [fetchPets, fetchExpenses])

  useEffect(() => { load() }, [load])

  // Budget du mois
  const now          = new Date()
  const monthlyTotal = expenses
    .filter((e) => { const d = new Date(e.expenseDate); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() })
    .reduce((s, e) => s + Number(e.amount), 0)

  const topCategories = Object.entries(
    expenses
      .filter((e) => { const d = new Date(e.expenseDate); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() })
      .reduce<Record<string, number>>((acc, e) => { acc[e.category] = (acc[e.category] ?? 0) + Number(e.amount); return acc }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 3)

  // Greeting
  const firstName = user?.firstName ?? user?.email?.split('@')[0] ?? 'là'
  const hour      = now.getHours()
  const greeting  = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'

  const isRefreshing = loading || loadingData

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={load} tintColor={colors.green} />}
      >

        {/* ── Greeting ── */}
        <View style={s.greeting}>
          <View>
            <Text style={s.greetingLine}>{greeting},</Text>
            <Text style={s.greetingName}>{firstName} 👋</Text>
          </View>
          <View style={s.aiPill}>
            <View style={s.aiDot} />
            <Text style={s.aiPillText}>IA prête</Text>
          </View>
        </View>

        {/* ── Mes animaux ── */}
        <View>
          <View style={s.sectionRow}>
            <Text style={s.sectionTitle}>Mes animaux</Text>
            <Pressable onPress={() => router.push('/(tabs)/pets')} style={s.seeAll}>
              <Text style={s.seeAllText}>Voir tout</Text>
              <Ionicons name="chevron-forward" size={13} color={colors.green} />
            </Pressable>
          </View>

          {pets.length === 0 ? (
            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push('/(tabs)/pets') }}
              style={({ pressed }) => [s.emptyPets, pressed && s.pressed]}
            >
              <Text style={s.emptyPetsEmoji}>🐾</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.emptyPetsTitle}>Aucun animal pour l'instant</Text>
                <Text style={s.emptyPetsSub}>Appuyez pour ajouter votre premier compagnon</Text>
              </View>
              <Ionicons name="add-circle" size={28} color={colors.green} />
            </Pressable>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.petRow}>
              {pets.map((pet) => (
                <Pressable
                  key={pet.id}
                  onPress={() => { Haptics.selectionAsync(); router.push(`/(tabs)/pets/${pet.id}`) }}
                  style={({ pressed }) => [s.petCard, shadow.sm, pressed && s.pressed]}
                >
                  <View style={[s.petAvatar, { backgroundColor: SPECIES_BG[pet.species] ?? colors.beigeLight }]}>
                    <Text style={s.petEmoji}>{SPECIES_EMOJI[pet.species] ?? '🐾'}</Text>
                  </View>
                  <Text style={s.petName} numberOfLines={1}>{pet.name}</Text>
                  <Text style={s.petBreed} numberOfLines={1}>
                    {pet.species === 'dog' ? 'Chien' : pet.species === 'cat' ? 'Chat' : pet.species}
                  </Text>
                </Pressable>
              ))}
              <Pressable
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push('/(tabs)/pets') }}
                style={({ pressed }) => [s.petCardAdd, pressed && s.pressed]}
              >
                <View style={s.petAddIcon}>
                  <Ionicons name="add" size={22} color={colors.green} />
                </View>
                <Text style={s.petAddLabel}>Ajouter</Text>
              </Pressable>
            </ScrollView>
          )}
        </View>

        {/* ── Prochain rendez-vous ── */}
        <View>
          <View style={s.sectionRow}>
            <Text style={s.sectionTitle}>Prochain rendez-vous</Text>
            <Pressable onPress={() => router.push('/(tabs)/appointments')} style={s.seeAll}>
              <Text style={s.seeAllText}>Tous les RDV</Text>
              <Ionicons name="chevron-forward" size={13} color={colors.green} />
            </Pressable>
          </View>

          {nextAppt ? (
            <Pressable
              onPress={() => { Haptics.selectionAsync(); router.push('/(tabs)/appointments') }}
              style={({ pressed }) => [s.apptCard, shadow.sm, pressed && s.pressed]}
            >
              <LinearGradient
                colors={['#EFF6FF', '#DBEAFE']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={s.apptIconWrap}
              >
                <Text style={s.apptIcon}>📅</Text>
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={s.apptReason} numberOfLines={1}>{nextAppt.reason}</Text>
                <Text style={s.apptMeta}>
                  {friendlyDate(nextAppt.date)}
                  {nextAppt.vetName ? ` · ${nextAppt.vetName}` : ''}
                  {nextAppt.pet ? ` · ${nextAppt.pet.name}` : ''}
                </Text>
              </View>
              <View style={[s.apptBadge, daysUntil(nextAppt.date) <= 1 && s.apptBadgeUrgent]}>
                <Text style={[s.apptBadgeText, daysUntil(nextAppt.date) <= 1 && s.apptBadgeTextUrgent]}>
                  {friendlyDate(nextAppt.date)}
                </Text>
              </View>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push('/(tabs)/appointments') }}
              style={({ pressed }) => [s.emptyWidget, pressed && s.pressed]}
            >
              <Text style={s.emptyWidgetEmoji}>📅</Text>
              <Text style={s.emptyWidgetText}>Aucun rendez-vous à venir</Text>
              <View style={s.emptyWidgetCta}>
                <Text style={s.emptyWidgetCtaText}>En planifier un</Text>
                <Ionicons name="arrow-forward" size={13} color={colors.green} />
              </View>
            </Pressable>
          )}
        </View>

        {/* ── Rappels proches ── */}
        {reminders.length > 0 && (
          <View>
            <View style={s.sectionRow}>
              <Text style={s.sectionTitle}>Rappels</Text>
              <Pressable onPress={() => router.push('/(tabs)/appointments')} style={s.seeAll}>
                <Text style={s.seeAllText}>Voir tout</Text>
                <Ionicons name="chevron-forward" size={13} color={colors.green} />
              </Pressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.reminderRow}>
              {reminders.map((rem) => {
                const days    = daysUntil(rem.dueDate)
                const overdue = days < 0
                const today   = days === 0
                return (
                  <Pressable
                    key={rem.id}
                    onPress={() => { Haptics.selectionAsync(); router.push('/(tabs)/appointments') }}
                    style={({ pressed }) => [s.reminderCard, shadow.sm, overdue && s.reminderCardOverdue, pressed && s.pressed]}
                  >
                    <Text style={s.reminderEmoji}>🔔</Text>
                    <Text style={s.reminderTitle} numberOfLines={2}>{rem.title}</Text>
                    <Text style={[s.reminderDue, overdue && s.reminderDueOverdue, today && s.reminderDueToday]}>
                      {overdue ? `En retard de ${Math.abs(days)}j` : today ? "Aujourd'hui" : `Dans ${days}j`}
                    </Text>
                  </Pressable>
                )
              })}
            </ScrollView>
          </View>
        )}

        {/* ── Budget du mois ── */}
        <View>
          <View style={s.sectionRow}>
            <Text style={s.sectionTitle}>Budget ce mois</Text>
            <Pressable onPress={() => router.push('/(tabs)/expenses' as never)} style={s.seeAll}>
              <Text style={s.seeAllText}>Voir le détail</Text>
              <Ionicons name="chevron-forward" size={13} color={colors.green} />
            </Pressable>
          </View>

          <Pressable
            onPress={() => { Haptics.selectionAsync(); router.push('/(tabs)/expenses' as never) }}
            style={({ pressed }) => [s.budgetCard, shadow.sm, pressed && s.pressed]}
          >
            {monthlyTotal === 0 ? (
              <View style={s.budgetEmpty}>
                <Text style={s.budgetEmptyEmoji}>💰</Text>
                <Text style={s.budgetEmptyText}>Aucune dépense ce mois-ci</Text>
                <View style={s.emptyWidgetCta}>
                  <Text style={s.emptyWidgetCtaText}>En ajouter une</Text>
                  <Ionicons name="arrow-forward" size={13} color={colors.green} />
                </View>
              </View>
            ) : (
              <View style={s.budgetContent}>
                <View style={s.budgetLeft}>
                  <Text style={s.budgetAmount}>
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(monthlyTotal)}
                  </Text>
                  <Text style={s.budgetSub}>ce mois</Text>
                </View>
                <View style={s.budgetCats}>
                  {topCategories.map(([cat, amt]) => (
                    <View key={cat} style={s.budgetCatRow}>
                      <View style={[s.budgetCatDot, { backgroundColor: CAT_COLORS[cat] ?? colors.gray[400] }]} />
                      <Text style={s.budgetCatLabel} numberOfLines={1}>
                        {cat === 'vet' ? 'Vétérinaire' : cat === 'food' ? 'Alimentation' : cat === 'grooming' ? 'Toilettage' : cat === 'medication' ? 'Médicaments' : cat}
                      </Text>
                      <Text style={s.budgetCatAmt}>{amt.toFixed(0)}€</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </Pressable>
        </View>

        {/* ── Assistant IA ── */}
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push('/(tabs)/chat') }}
          style={({ pressed }) => [pressed && s.pressed]}
        >
          <LinearGradient
            colors={['#1A1614', '#1E2A14', '#1A1614']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={s.aiCard}
          >
            <View style={s.aiGlow} />
            <View style={s.aiCardContent}>
              <View style={s.aiCardLeft}>
                <View style={s.aiCardBadge}>
                  <View style={s.aiDot} />
                  <Text style={s.aiCardBadgeText}>Disponible 24h/24</Text>
                </View>
                <Text style={s.aiCardTitle}>Posez une question{'\n'}à votre assistant</Text>
                <Text style={s.aiCardDesc}>
                  {pets.length > 0
                    ? `Parlez de ${pets[0].name}, vaccination, symptômes…`
                    : 'Symptômes, vaccination, alimentation…'}
                </Text>
              </View>
              <View style={s.aiCardIcon}>
                <Text style={{ fontSize: 36 }}>🤖</Text>
              </View>
            </View>
            <View style={s.aiCardCta}>
              <Text style={s.aiCardCtaText}>Commencer une conversation</Text>
              <Ionicons name="arrow-forward" size={14} color={colors.green} />
            </View>
            <LinearGradient
              colors={['transparent', colors.green, 'transparent']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={s.aiAccentLine}
            />
          </LinearGradient>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: colors.beigePale },
  scroll:  { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 40, gap: 28, paddingTop: 16 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.97 }] },

  // Greeting
  greeting:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  greetingLine:  { fontSize: 15, color: colors.gray[500], fontWeight: '600' },
  greetingName:  { fontSize: 28, fontWeight: '800', color: colors.dark, marginTop: 2 },
  aiPill:        { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.dark, paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.full },
  aiDot:         { width: 7, height: 7, borderRadius: 3.5, backgroundColor: colors.green },
  aiPillText:    { fontSize: 12, fontWeight: '700', color: colors.white },

  // Section header
  sectionRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle:  { fontSize: 18, fontWeight: '800', color: colors.dark },
  seeAll:        { flexDirection: 'row', alignItems: 'center', gap: 2 },
  seeAllText:    { fontSize: 13, fontWeight: '700', color: colors.green },

  // Empty pets
  emptyPets:      { backgroundColor: colors.white, borderRadius: radius['2xl'], padding: 20, flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1.5, borderColor: colors.gray[200], borderStyle: 'dashed' },
  emptyPetsEmoji: { fontSize: 32 },
  emptyPetsTitle: { fontSize: 14, fontWeight: '700', color: colors.dark },
  emptyPetsSub:   { fontSize: 12, color: colors.gray[400], marginTop: 2 },

  // Pet cards (horizontal)
  petRow:    { gap: 12, paddingBottom: 4 },
  petCard:   { width: 90, backgroundColor: colors.white, borderRadius: radius['2xl'], padding: 12, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: colors.gray[200] },
  petAvatar: { width: 52, height: 52, borderRadius: radius.xl, alignItems: 'center', justifyContent: 'center' },
  petEmoji:  { fontSize: 26 },
  petName:   { fontSize: 12, fontWeight: '700', color: colors.dark, textAlign: 'center' },
  petBreed:  { fontSize: 10, color: colors.gray[400], textAlign: 'center' },
  petCardAdd:  { width: 90, borderRadius: radius['2xl'], padding: 12, alignItems: 'center', gap: 6, borderWidth: 1.5, borderColor: colors.gray[200], borderStyle: 'dashed', justifyContent: 'center' },
  petAddIcon:  { width: 52, height: 52, borderRadius: radius.xl, backgroundColor: colors.greenLight, alignItems: 'center', justifyContent: 'center' },
  petAddLabel: { fontSize: 12, fontWeight: '700', color: colors.green, textAlign: 'center' },

  // Appointment widget
  apptCard:    { backgroundColor: colors.white, borderRadius: radius['2xl'], padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: colors.gray[200] },
  apptIconWrap:{ width: 48, height: 48, borderRadius: radius.xl, alignItems: 'center', justifyContent: 'center' },
  apptIcon:    { fontSize: 22 },
  apptReason:  { fontSize: 15, fontWeight: '700', color: colors.dark },
  apptMeta:    { fontSize: 12, color: colors.gray[500], marginTop: 3 },
  apptBadge:   { backgroundColor: colors.blueLight, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.full },
  apptBadgeUrgent:    { backgroundColor: '#FEE2E2' },
  apptBadgeText:      { fontSize: 11, fontWeight: '700', color: colors.blue },
  apptBadgeTextUrgent:{ color: colors.red },

  // Empty widget (generic)
  emptyWidget:     { backgroundColor: colors.white, borderRadius: radius['2xl'], padding: 20, flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1, borderColor: colors.gray[200] },
  emptyWidgetEmoji:{ fontSize: 28 },
  emptyWidgetText: { flex: 1, fontSize: 14, color: colors.gray[500], fontWeight: '500' },
  emptyWidgetCta:  { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  emptyWidgetCtaText: { fontSize: 13, fontWeight: '700', color: colors.green },

  // Reminders
  reminderRow:  { gap: 10, paddingBottom: 4 },
  reminderCard: { width: 130, backgroundColor: colors.white, borderRadius: radius['2xl'], padding: 14, gap: 6, borderWidth: 1, borderColor: colors.gray[200] },
  reminderCardOverdue: { borderColor: '#FCA5A5', backgroundColor: '#FFF5F5' },
  reminderEmoji:   { fontSize: 22 },
  reminderTitle:   { fontSize: 12, fontWeight: '700', color: colors.dark, lineHeight: 16 },
  reminderDue:     { fontSize: 11, fontWeight: '600', color: colors.gray[400] },
  reminderDueOverdue: { color: colors.red },
  reminderDueToday:   { color: colors.orange },

  // Budget
  budgetCard:    { backgroundColor: colors.white, borderRadius: radius['2xl'], padding: 18, borderWidth: 1, borderColor: colors.gray[200] },
  budgetEmpty:   { alignItems: 'center', gap: 6 },
  budgetEmptyEmoji: { fontSize: 32 },
  budgetEmptyText:  { fontSize: 14, color: colors.gray[500], fontWeight: '500' },
  budgetContent: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  budgetLeft:    { alignItems: 'flex-start' },
  budgetAmount:  { fontSize: 32, fontWeight: '800', color: colors.dark },
  budgetSub:     { fontSize: 12, color: colors.gray[400], fontWeight: '600', marginTop: 2 },
  budgetCats:    { flex: 1, gap: 6 },
  budgetCatRow:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  budgetCatDot:  { width: 8, height: 8, borderRadius: 4 },
  budgetCatLabel:{ flex: 1, fontSize: 12, color: colors.gray[600], fontWeight: '500' },
  budgetCatAmt:  { fontSize: 12, fontWeight: '700', color: colors.dark },

  // AI card
  aiCard: { borderRadius: radius['3xl'], overflow: 'hidden', padding: 24, position: 'relative' },
  aiGlow: { position: 'absolute', top: -30, right: -10, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(126,177,63,0.10)' },
  aiCardContent: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 },
  aiCardLeft:    { flex: 1 },
  aiCardBadge:   { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  aiCardBadgeText: { fontSize: 11, fontWeight: '700', color: colors.green, letterSpacing: 0.4 },
  aiCardTitle:   { fontSize: 22, fontWeight: '800', color: colors.white, lineHeight: 28 },
  aiCardDesc:    { fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 8 },
  aiCardIcon:    { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(126,177,63,0.15)', alignItems: 'center', justifyContent: 'center' },
  aiCardCta:     { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(126,177,63,0.15)', paddingVertical: 12, paddingHorizontal: 16, borderRadius: radius.xl },
  aiCardCtaText: { flex: 1, fontSize: 14, fontWeight: '700', color: colors.white },
  aiAccentLine:  { position: 'absolute', bottom: 0, left: 0, right: 0, height: 2 },
})
