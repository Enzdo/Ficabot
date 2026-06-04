import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { api } from '@/services/api'
import { usePetsStore } from '@/stores/pets'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { DateInput } from '@/components/ui/DateInput'
import { BottomModal } from '@/components/ui/BottomModal'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { SPECIES_EMOJI } from '@/constants/pets'
import { colors, radius, shadow } from '@/constants/theme'
import type { Pet, VetAppointment, Reminder } from '@/types'

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  scheduled: { label: 'Programmé',  bg: colors.greenLight,  text: colors.greenDark },
  completed: { label: 'Terminé',    bg: colors.gray[100],   text: colors.gray[600]  },
  cancelled: { label: 'Annulé',     bg: colors.redLight,    text: colors.red        },
}

export default function AppointmentsScreen() {
  const { pets, fetchPets } = usePetsStore()
  const [tab, setTab] = useState<'rdv' | 'rappels'>('rdv')
  const [appointments, setAppointments] = useState<VetAppointment[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showReminderModal, setShowReminderModal] = useState(false)
  const [form, setForm] = useState({ petId: '', title: '', appointmentDate: '', vetName: '', notes: '' })
  const [reminderForm, setReminderForm] = useState({ title: '', description: '', dueDate: '', petId: '' })
  const [saving, setSaving] = useState(false)
  const [apptError, setApptError] = useState<string | null>(null)

  const fetchAppointments = useCallback(async () => {
    setLoading(true)
    setApptError(null)
    const r = await api.get<VetAppointment[]>('/appointments')
    if (r.success && r.data) setAppointments(r.data)
    else setApptError(r.message ?? 'Erreur de chargement')
    setLoading(false)
  }, [])

  const fetchReminders = useCallback(async () => {
    const r = await api.get<Reminder[]>('/reminders')
    if (r.success && r.data) setReminders(r.data)
  }, [])

  useEffect(() => { fetchAppointments(); fetchReminders(); fetchPets() }, [fetchAppointments, fetchReminders, fetchPets])

  const handleCreate = async () => {
    if (!form.petId || !form.title || !form.appointmentDate) { Alert.alert('Champs requis', 'Animal, motif et date sont obligatoires'); return }
    setSaving(true)
    const r = await api.post<VetAppointment>('/appointments', form)
    setSaving(false)
    if (r.success && r.data) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      setAppointments((prev) => [r.data!, ...prev])
      setShowModal(false)
      setForm({ petId: '', title: '', appointmentDate: '', vetName: '', notes: '' })
    } else Alert.alert('Erreur', r.message ?? 'Erreur lors de la création')
  }

  const handleCreateReminder = async () => {
    if (!reminderForm.title || !reminderForm.dueDate) { Alert.alert('Champs requis', 'Titre et date sont obligatoires'); return }
    setSaving(true)
    const r = await api.post<Reminder>('/reminders', {
      title: reminderForm.title,
      description: reminderForm.description || undefined,
      dueDate: reminderForm.dueDate,
      petId: reminderForm.petId || undefined,
    })
    setSaving(false)
    if (r.success && r.data) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      setReminders((prev) => [r.data!, ...prev])
      setShowReminderModal(false)
      setReminderForm({ title: '', description: '', dueDate: '', petId: '' })
    } else Alert.alert('Erreur', r.message ?? 'Erreur lors de la création')
  }

  const handleCompleteReminder = async (id: string) => {
    const r = await api.put(`/reminders/${id}/complete`)
    if (r.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      setReminders((prev) => prev.map((rem) => rem.id === id ? { ...rem, isCompleted: true } : rem))
    }
  }

  const handleDeleteReminder = (id: string) => {
    Alert.alert('Supprimer', 'Supprimer ce rappel ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
        const r = await api.del(`/reminders/${id}`)
        if (r.success) setReminders((prev) => prev.filter((rem) => rem.id !== id))
      }},
    ])
  }

  const now = new Date()
  const upcoming          = useMemo(() => appointments.filter((a) => new Date(a.appointmentDate) >= now && a.status !== 'cancelled'), [appointments])
  const past              = useMemo(() => appointments.filter((a) => new Date(a.appointmentDate) < now  || a.status === 'cancelled'), [appointments])
  const pendingReminders  = useMemo(() => reminders.filter((r) => !r.isCompleted), [reminders])
  const completedReminders = useMemo(() => reminders.filter((r) => r.isCompleted), [reminders])

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Planning</Text>
          <Text style={styles.subtitle}>{upcoming.length === 0 ? 'Aucun RDV à venir' : `${upcoming.length} RDV à venir`}</Text>
        </View>
      </View>

      <View style={styles.tabRow}>
        <Pressable onPress={() => { Haptics.selectionAsync(); setTab('rdv') }} style={[styles.tabPill, tab === 'rdv' && styles.tabPillActive]}>
          <Text style={[styles.tabPillText, tab === 'rdv' && styles.tabPillTextActive]}>📅 Rendez-vous</Text>
        </Pressable>
        <Pressable onPress={() => { Haptics.selectionAsync(); setTab('rappels') }} style={[styles.tabPill, tab === 'rappels' && styles.tabPillActive]}>
          <Text style={[styles.tabPillText, tab === 'rappels' && styles.tabPillTextActive]}>
            🔔 Rappels{pendingReminders.length > 0 ? ` (${pendingReminders.length})` : ''}
          </Text>
        </Pressable>
      </View>

      {loading && appointments.length === 0 && reminders.length === 0 ? <LoadingSpinner /> : apptError ? (
        <View style={styles.empty}>
          <View style={styles.emptyIconWrap}><Text style={styles.emptyEmoji}>⚠️</Text></View>
          <Text style={styles.emptyTitle}>Impossible de charger</Text>
          <Text style={styles.emptyDesc}>{apptError}</Text>
          <Pressable onPress={() => { fetchAppointments(); fetchReminders() }} style={styles.retryBtn}>
            <Text style={styles.retryBtnText}>Réessayer</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={() => { fetchAppointments(); fetchReminders() }} tintColor={colors.green} />}>

          {tab === 'rdv' && (
            <>
              {upcoming.length > 0 && (
                <View>
                  <View style={styles.sectionLabelRow}>
                    <View style={styles.sectionDot} />
                    <Text style={styles.sectionLabel}>À VENIR</Text>
                  </View>
                  <View style={styles.apptList}>
                    {upcoming.map((a) => <ApptCard key={a.id} appt={a} pets={pets} />)}
                  </View>
                </View>
              )}

              {past.length > 0 && (
                <View>
                  <View style={styles.sectionLabelRow}>
                    <View style={[styles.sectionDot, { backgroundColor: colors.gray[300] }]} />
                    <Text style={styles.sectionLabel}>PASSÉS</Text>
                  </View>
                  <View style={[styles.apptList, styles.pastList]}>
                    {past.slice(0, 5).map((a) => <ApptCard key={a.id} appt={a} pets={pets} />)}
                  </View>
                </View>
              )}

              {appointments.length === 0 && (
                <View style={styles.empty}>
                  <LinearGradient colors={['#2A3520', colors.dark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.emptyIconWrap}>
                    <Text style={styles.emptyEmoji}>📅</Text>
                  </LinearGradient>
                  <Text style={styles.emptyTitle}>Aucun rendez-vous</Text>
                  <Text style={styles.emptyDesc}>Planifiez vos consultations vétérinaires et ne manquez plus aucun suivi</Text>
                </View>
              )}
            </>
          )}

          {tab === 'rappels' && (
            <>
              {pendingReminders.length > 0 && (
                <View>
                  <View style={styles.sectionLabelRow}>
                    <View style={styles.sectionDot} />
                    <Text style={styles.sectionLabel}>EN ATTENTE</Text>
                  </View>
                  <View style={styles.apptList}>
                    {pendingReminders.map((rem) => (
                      <ReminderCard key={rem.id} reminder={rem} pets={pets} onComplete={handleCompleteReminder} onDelete={handleDeleteReminder} />
                    ))}
                  </View>
                </View>
              )}

              {completedReminders.length > 0 && (
                <View>
                  <View style={styles.sectionLabelRow}>
                    <View style={[styles.sectionDot, { backgroundColor: colors.gray[300] }]} />
                    <Text style={styles.sectionLabel}>COMPLÉTÉS</Text>
                  </View>
                  <View style={[styles.apptList, styles.pastList]}>
                    {completedReminders.slice(0, 5).map((rem) => (
                      <ReminderCard key={rem.id} reminder={rem} pets={pets} onComplete={handleCompleteReminder} onDelete={handleDeleteReminder} />
                    ))}
                  </View>
                </View>
              )}

              {reminders.length === 0 && (
                <View style={styles.empty}>
                  <LinearGradient colors={['#2A3520', colors.dark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.emptyIconWrap}>
                    <Text style={styles.emptyEmoji}>🔔</Text>
                  </LinearGradient>
                  <Text style={styles.emptyTitle}>Aucun rappel</Text>
                  <Text style={styles.emptyDesc}>Créez des rappels pour les vaccins, traitements et soins de vos animaux</Text>
                </View>
              )}
            </>
          )}
        </ScrollView>
      )}

      <Pressable
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); tab === 'rdv' ? setShowModal(true) : setShowReminderModal(true) }}
        style={({ pressed }) => [styles.fab, shadow.green, pressed && { transform: [{ scale: 0.93 }] }]}
      >
        <Ionicons name="add" size={28} color={colors.white} />
      </Pressable>

      {showReminderModal && (
        <BottomModal
          visible={showReminderModal}
          title="Nouveau rappel"
          onClose={() => setShowReminderModal(false)}
          onConfirm={handleCreateReminder}
          saving={saving}
          confirmLabel="Créer"
        >
          <Input label="Titre *" value={reminderForm.title} onChangeText={(v) => setReminderForm((f) => ({ ...f, title: v }))} placeholder="Ex: Rappel vaccin antirabique" />
          <Input label="Description" value={reminderForm.description} onChangeText={(v) => setReminderForm((f) => ({ ...f, description: v }))} placeholder="Détails..." multiline numberOfLines={3} />
          <DateInput label="Date *" value={reminderForm.dueDate} onChange={(v) => setReminderForm((f) => ({ ...f, dueDate: v }))} minimumDate={new Date()} />
          {pets.length > 0 && (
            <View>
              <Text style={styles.fieldLabel}>Animal (optionnel)</Text>
              <View style={styles.petPicker}>
                <Pressable
                  onPress={() => setReminderForm((f) => ({ ...f, petId: '' }))}
                  style={[styles.petOpt, !reminderForm.petId && styles.petOptActive]}
                >
                  <Text style={[styles.petOptLabel, !reminderForm.petId && styles.petOptLabelActive]}>Aucun</Text>
                </Pressable>
                {pets.map((pet) => (
                  <Pressable key={pet.id} onPress={() => setReminderForm((f) => ({ ...f, petId: pet.id }))}
                    style={[styles.petOpt, reminderForm.petId === pet.id && styles.petOptActive]}>
                    <Text>{SPECIES_EMOJI[pet.species] ?? '🐾'}</Text>
                    <Text style={[styles.petOptLabel, reminderForm.petId === pet.id && styles.petOptLabelActive]}>{pet.name}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </BottomModal>
      )}

      {showModal && (
        <BottomModal
          visible={showModal}
          title="Nouveau rendez-vous"
          onClose={() => setShowModal(false)}
          onConfirm={handleCreate}
          saving={saving}
        >
          <View>
            <Text style={styles.fieldLabel}>Animal *</Text>
            {pets.length === 0 ? (
              <View style={styles.noPetsNotice}>
                <Text style={styles.noPetsText}>Ajoutez d'abord un animal dans l'onglet Animaux</Text>
              </View>
            ) : (
              <View style={styles.petPicker}>
                {pets.map((pet) => (
                  <Pressable key={pet.id} onPress={() => setForm((f) => ({ ...f, petId: pet.id }))}
                    style={[styles.petOpt, form.petId === pet.id && styles.petOptActive]}>
                    <Text>{SPECIES_EMOJI[pet.species] ?? '🐾'}</Text>
                    <Text style={[styles.petOptLabel, form.petId === pet.id && styles.petOptLabelActive]}>{pet.name}</Text>
                    {form.petId === pet.id && <Ionicons name="checkmark-circle" size={16} color={colors.green} />}
                  </Pressable>
                ))}
              </View>
            )}
          </View>
          <Input label="Motif *" value={form.title} onChangeText={(v) => setForm((f) => ({ ...f, title: v }))} placeholder="Ex: Vaccination annuelle" />
          <DateInput label="Date et heure *" value={form.appointmentDate} onChange={(v) => setForm((f) => ({ ...f, appointmentDate: v }))} mode="datetime" minimumDate={new Date()} />
          <Input label="Vétérinaire" value={form.vetName} onChangeText={(v) => setForm((f) => ({ ...f, vetName: v }))} placeholder="Dr. Leblanc" autoCapitalize="words" />
          <Input label="Notes" value={form.notes} onChangeText={(v) => setForm((f) => ({ ...f, notes: v }))} placeholder="Informations supplémentaires..." multiline numberOfLines={3} />
        </BottomModal>
      )}
    </SafeAreaView>
  )
}

const ReminderCard = memo(function ReminderCard({ reminder, pets, onComplete, onDelete }: { reminder: Reminder; pets: Pet[]; onComplete: (id: string) => void; onDelete: (id: string) => void }) {
  const pet = pets.find((p) => p.id === reminder.petId)
  const isOverdue = !reminder.isCompleted && new Date(reminder.dueDate) < new Date()
  return (
    <Card>
      <View style={remStyles.row}>
        <View style={[remStyles.iconWrap, { backgroundColor: reminder.isCompleted ? colors.gray[100] : isOverdue ? colors.redLight : colors.orangeLight }]}>
          <Ionicons name={reminder.isCompleted ? 'checkmark-circle' : 'notifications'} size={22} color={reminder.isCompleted ? colors.gray[400] : isOverdue ? colors.red : colors.orange} />
        </View>
        <View style={remStyles.info}>
          <Text style={[remStyles.title, reminder.isCompleted && remStyles.titleDone]}>{reminder.title}</Text>
          {reminder.description && <Text style={remStyles.desc}>{reminder.description}</Text>}
          <Text style={[remStyles.date, isOverdue && !reminder.isCompleted && { color: colors.red }]}>
            📅 {new Date(reminder.dueDate).toLocaleDateString('fr-FR')}
            {pet ? `  ·  ${SPECIES_EMOJI[pet.species] ?? '🐾'} ${pet.name}` : ''}
            {isOverdue && !reminder.isCompleted ? '  ·  En retard' : ''}
          </Text>
        </View>
        <View style={remStyles.actions}>
          {!reminder.isCompleted && (
            <Pressable onPress={() => onComplete(reminder.id)} style={remStyles.completeBtn}>
              <Ionicons name="checkmark" size={16} color={colors.green} />
            </Pressable>
          )}
          <Pressable onPress={() => onDelete(reminder.id)} style={remStyles.deleteBtn}>
            <Ionicons name="trash-outline" size={15} color={colors.red} />
          </Pressable>
        </View>
      </View>
    </Card>
  )
})

const remStyles = StyleSheet.create({
  row:         { flexDirection: 'row', gap: 12, alignItems: 'center' },
  iconWrap:    { width: 44, height: 44, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  info:        { flex: 1 },
  title:       { fontSize: 14, fontWeight: '700', color: colors.dark },
  titleDone:   { color: colors.gray[400], textDecorationLine: 'line-through' },
  desc:        { fontSize: 12, color: colors.gray[500], marginTop: 2 },
  date:        { fontSize: 12, color: colors.gray[400], marginTop: 4 },
  actions:     { flexDirection: 'row', gap: 6 },
  completeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.greenLight, alignItems: 'center', justifyContent: 'center' },
  deleteBtn:   { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.redLight, alignItems: 'center', justifyContent: 'center' },
})

const ApptCard = memo(function ApptCard({ appt, pets }: { appt: VetAppointment; pets: Pet[] }) {
  const pet    = pets.find((p) => p.id === appt.petId)
  const status = appt.status ?? 'scheduled'
  const cfg    = STATUS_CONFIG[status] ?? STATUS_CONFIG.scheduled
  const d      = new Date(appt.appointmentDate)
  const isToday    = new Date().toDateString() === d.toDateString()
  const isTomorrow = new Date(Date.now() + 86400000).toDateString() === d.toDateString()
  const timeLabel  = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

  return (
    <Card>
      <View style={apptStyles.row}>
        <View style={apptStyles.dateBlock}>
          <Text style={apptStyles.dateDay}>{d.getDate()}</Text>
          <Text style={apptStyles.dateMonth}>{d.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '')}</Text>
        </View>
        <View style={apptStyles.info}>
          <View style={apptStyles.titleRow}>
            <Text style={apptStyles.reason} numberOfLines={1}>{appt.title}</Text>
            <View style={[apptStyles.badge, { backgroundColor: cfg.bg }]}>
              <Text style={[apptStyles.badgeText, { color: cfg.text }]}>{cfg.label}</Text>
            </View>
          </View>
          {pet && <Text style={apptStyles.pet}>{SPECIES_EMOJI[pet.species] ?? '🐾'} {pet.name}</Text>}
          <Text style={apptStyles.time}>
            🕐 {isToday ? `Aujourd'hui à ${timeLabel}` : isTomorrow ? `Demain à ${timeLabel}` : timeLabel}
            {appt.vetName ? `  ·  ${appt.vetName}` : ''}
          </Text>
        </View>
      </View>
    </Card>
  )
})

const apptStyles = StyleSheet.create({
  row:      { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  dateBlock:{ width: 48, alignItems: 'center', backgroundColor: colors.greenLight, borderRadius: radius.lg, paddingVertical: 8, flexShrink: 0 },
  dateDay:  { fontSize: 22, fontWeight: '800', color: colors.greenDark, lineHeight: 26 },
  dateMonth:{ fontSize: 11, fontWeight: '700', color: colors.green, textTransform: 'uppercase' },
  info:     { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', marginBottom: 4 },
  reason:   { fontSize: 15, fontWeight: '700', color: colors.dark, flex: 1 },
  badge:    { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full },
  badgeText:{ fontSize: 11, fontWeight: '700' },
  pet:      { fontSize: 13, color: colors.gray[600], marginBottom: 2 },
  time:     { fontSize: 12, color: colors.gray[400] },
})

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.beigePale },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title:    { fontSize: 28, fontWeight: '800', color: colors.dark },
  subtitle: { fontSize: 13, color: colors.gray[400], marginTop: 2 },

  tabRow:          { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 8 },
  tabPill:         { flex: 1, paddingVertical: 10, borderRadius: radius.xl, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.gray[200], alignItems: 'center' },
  tabPillActive:   { backgroundColor: colors.dark, borderColor: colors.dark },
  tabPillText:     { fontSize: 13, fontWeight: '700', color: colors.gray[500] },
  tabPillTextActive: { color: colors.white },

  scroll:  { flex: 1, paddingHorizontal: 20 },
  content: { paddingTop: 8, paddingBottom: 100, gap: 20 },

  sectionLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionDot:      { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.green },
  sectionLabel:    { fontSize: 11, fontWeight: '800', color: colors.gray[400], letterSpacing: 1.5 },
  apptList:        { gap: 10 },
  pastList:        { opacity: 0.6 },

  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 20 },
  emptyIconWrap: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyEmoji:    { fontSize: 52 },
  emptyTitle:    { fontSize: 20, fontWeight: '800', color: colors.dark, textAlign: 'center' },
  emptyDesc:     { fontSize: 14, color: colors.gray[500], textAlign: 'center', marginTop: 8, lineHeight: 20 },
  retryBtn:      { marginTop: 16, backgroundColor: colors.green, paddingHorizontal: 24, paddingVertical: 12, borderRadius: radius.full },
  retryBtnText:  { fontSize: 14, fontWeight: '700', color: colors.white },

  fab: { position: 'absolute', right: 20, bottom: 24, width: 58, height: 58, borderRadius: 29, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' },

  fieldLabel:   { fontSize: 13, fontWeight: '600', color: colors.gray[600], marginLeft: 2, marginBottom: 8 },
  noPetsNotice: { backgroundColor: colors.orangeLight, borderRadius: radius.xl, padding: 14, borderWidth: 1, borderColor: colors.orange },
  noPetsText:   { fontSize: 13, color: colors.orange },
  petPicker:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  petOpt:          { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: radius.xl, borderWidth: 1.5, borderColor: colors.gray[200], backgroundColor: colors.white },
  petOptActive:    { borderColor: colors.green, backgroundColor: colors.greenLight },
  petOptLabel:     { fontSize: 13, fontWeight: '600', color: colors.gray[600] },
  petOptLabelActive:{ color: colors.greenDark },
})
