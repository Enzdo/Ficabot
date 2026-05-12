import { memo, useCallback, useEffect, useState } from 'react'
import { Alert, Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { usePetsStore } from '@/stores/pets'
import { useHealthBookStore } from '@/stores/healthBook'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { MedicalRecordSkeleton } from '@/components/ui/Skeleton'
import { SPECIES_EMOJI, SPECIES_BG, SPECIES_LABEL } from '@/constants/pets'
import { today, fmtDate, getAge } from '@/utils/date'
import { colors, radius, shadow } from '@/constants/theme'
import type { MedicalRecordType, ActivityType, FoodType, VaccineEntry, AllergyEntry, ChronicConditionEntry } from '@/types'

// ─── Constants ────────────────────────────────────────────────────────────────

const RECORD_TYPES: { value: MedicalRecordType; label: string; emoji: string; bg: string; text: string }[] = [
  { value: 'vaccine',   label: 'Vaccin',     emoji: '💉', bg: colors.blueLight,   text: colors.blue      },
  { value: 'treatment', label: 'Traitement', emoji: '💊', bg: colors.orangeLight, text: colors.orange    },
  { value: 'visit',     label: 'Visite',     emoji: '🏥', bg: colors.greenLight,  text: colors.greenDark },
]

const SEVERITY_OPTIONS = [
  { value: 'mild',     label: 'Léger',  bg: colors.greenLight,  text: colors.greenDark },
  { value: 'moderate', label: 'Modéré', bg: colors.orangeLight, text: colors.orange   },
  { value: 'severe',   label: 'Sévère', bg: colors.redLight,    text: colors.red      },
]

const ACTIVITY_TYPES: { value: ActivityType; label: string; emoji: string }[] = [
  { value: 'walk',     label: 'Promenade', emoji: '🦮' },
  { value: 'play',     label: 'Jeu',       emoji: '🎾' },
  { value: 'run',      label: 'Course',    emoji: '🏃' },
  { value: 'swim',     label: 'Natation',  emoji: '🏊' },
  { value: 'training', label: 'Dressage',  emoji: '🎓' },
  { value: 'other',    label: 'Autre',     emoji: '⭐' },
]

const FOOD_TYPES: { value: FoodType; label: string; emoji: string }[] = [
  { value: 'dry',      label: 'Croquettes', emoji: '🥣' },
  { value: 'wet',      label: 'Pâtée',      emoji: '🥫' },
  { value: 'raw',      label: 'BARF',       emoji: '🥩' },
  { value: 'homemade', label: 'Maison',     emoji: '🍲' },
  { value: 'treats',   label: 'Friandise',  emoji: '🦴' },
]

type Tab = 'info' | 'carnet' | 'suivi' | 'medical'

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const {
    currentPet, medicalRecords, weightHistory, symptomLogs, activities, feedingLogs,
    loading, fetchPet, fetchMedicalRecords, deletePet, createMedicalRecord,
    fetchWeightHistory, addWeightEntry, deleteWeightEntry,
    fetchSymptomLogs, addSymptomLog, deleteSymptomLog,
    fetchActivities, addActivity, deleteActivity,
    fetchFeedingLogs, addFeedingLog, deleteFeedingLog,
  } = usePetsStore()

  const { healthBook, loading: hbLoading, fetchHealthBook, addVaccine, removeVaccine, addAllergy, removeAllergy, addChronicCondition, removeChronicCondition, updateHealthBook } = useHealthBookStore()

  const [tab, setTab] = useState<Tab>('info')

  // Forms
  const [showRecordModal, setShowRecordModal] = useState(false)
  const [recordForm, setRecordForm] = useState({ type: 'visit' as MedicalRecordType, title: '', description: '', date: today(), vetName: '' })

  const [showWeightModal, setShowWeightModal] = useState(false)
  const [weightForm, setWeightForm] = useState({ weight: '', date: today(), notes: '' })

  const [showSymptomModal, setShowSymptomModal] = useState(false)
  const [symptomForm, setSymptomForm] = useState({ symptom: '', severity: 'mild', description: '', observedAt: today() })

  const [showActivityModal, setShowActivityModal] = useState(false)
  const [activityForm, setActivityForm] = useState({ type: 'walk' as ActivityType, durationMinutes: '', distanceKm: '', notes: '', startedAt: today() })

  const [showFeedingModal, setShowFeedingModal] = useState(false)
  const [feedingForm, setFeedingForm] = useState({ foodType: 'dry' as FoodType, brand: '', productName: '', quantity: '', unit: 'g' as const, fedAt: today(), notes: '' })

  const [showVaccineModal, setShowVaccineModal] = useState(false)
  const [vaccineForm, setVaccineForm] = useState({ name: '', date: today(), batchNumber: '', vetName: '', nextDueDate: '', manufacturer: '' })

  const [showAllergyModal, setShowAllergyModal] = useState(false)
  const [allergyForm, setAllergyForm] = useState({ allergen: '', severity: 'mild', reaction: '', diagnosedAt: today() })

  const [showConditionModal, setShowConditionModal] = useState(false)
  const [conditionForm, setConditionForm] = useState({ condition: '', diagnosedAt: today(), notes: '', treatedWith: '' })

  const [saving, setSaving] = useState(false)

  const refreshAll = useCallback(() => {
    return Promise.all([
      fetchPet(id),
      fetchMedicalRecords(id),
      fetchWeightHistory(id),
      fetchSymptomLogs(id),
      fetchActivities(id),
      fetchFeedingLogs(id),
      fetchHealthBook(id),
    ])
  }, [id, fetchPet, fetchMedicalRecords, fetchWeightHistory, fetchSymptomLogs, fetchActivities, fetchFeedingLogs, fetchHealthBook])

  useEffect(() => { if (id) refreshAll() }, [id, refreshAll])

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleDelete = () => {
    Alert.alert('Supprimer', `Supprimer ${currentPet?.name} définitivement ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive', onPress: async () => {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
          if (id && await deletePet(id)) router.back()
        }
      },
    ])
  }

  const handleAddRecord = async () => {
    if (!recordForm.title) { Alert.alert('Champ requis', 'Le titre est obligatoire'); return }
    setSaving(true)
    const ok = await createMedicalRecord(id, { type: recordForm.type, title: recordForm.title, description: recordForm.description || undefined, date: recordForm.date, vetName: recordForm.vetName || undefined })
    setSaving(false)
    if (ok) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      setShowRecordModal(false)
      setRecordForm({ type: 'visit', title: '', description: '', date: today(), vetName: '' })
    }
  }

  const handleAddWeight = async () => {
    const w = parseFloat(weightForm.weight)
    if (!weightForm.weight || isNaN(w)) { Alert.alert('Champ requis', 'Entrez un poids valide'); return }
    setSaving(true)
    const ok = await addWeightEntry(id, w, weightForm.date, weightForm.notes || undefined)
    setSaving(false)
    if (ok) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      setShowWeightModal(false)
      setWeightForm({ weight: '', date: today(), notes: '' })
    }
  }

  const handleAddSymptom = async () => {
    if (!symptomForm.symptom) { Alert.alert('Champ requis', 'Décrivez le symptôme'); return }
    setSaving(true)
    const ok = await addSymptomLog(id, { symptom: symptomForm.symptom, severity: symptomForm.severity, description: symptomForm.description || undefined, observedAt: symptomForm.observedAt })
    setSaving(false)
    if (ok) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      setShowSymptomModal(false)
      setSymptomForm({ symptom: '', severity: 'mild', description: '', observedAt: today() })
    }
  }

  const handleAddActivity = async () => {
    const d = parseInt(activityForm.durationMinutes)
    if (!activityForm.durationMinutes || isNaN(d)) { Alert.alert('Champ requis', 'Entrez une durée'); return }
    setSaving(true)
    const ok = await addActivity(id, {
      type: activityForm.type,
      durationMinutes: d,
      distanceKm: activityForm.distanceKm ? parseFloat(activityForm.distanceKm) : undefined,
      notes: activityForm.notes || undefined,
      startedAt: activityForm.startedAt,
    })
    setSaving(false)
    if (ok) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      setShowActivityModal(false)
      setActivityForm({ type: 'walk', durationMinutes: '', distanceKm: '', notes: '', startedAt: today() })
    }
  }

  const handleAddFeeding = async () => {
    if (!feedingForm.fedAt) { Alert.alert('Champ requis', 'Entrez une date'); return }
    setSaving(true)
    const ok = await addFeedingLog(id, {
      foodType: feedingForm.foodType,
      brand: feedingForm.brand || undefined,
      productName: feedingForm.productName || undefined,
      quantity: feedingForm.quantity ? parseFloat(feedingForm.quantity) : undefined,
      unit: feedingForm.unit || undefined,
      fedAt: feedingForm.fedAt,
      notes: feedingForm.notes || undefined,
    })
    setSaving(false)
    if (ok) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      setShowFeedingModal(false)
      setFeedingForm({ foodType: 'dry', brand: '', productName: '', quantity: '', unit: 'g', fedAt: today(), notes: '' })
    }
  }

  const handleAddVaccine = async () => {
    if (!vaccineForm.name || !vaccineForm.date) { Alert.alert('Champ requis', 'Nom et date obligatoires'); return }
    setSaving(true)
    const entry: VaccineEntry = { name: vaccineForm.name, date: vaccineForm.date, batchNumber: vaccineForm.batchNumber || undefined, vetName: vaccineForm.vetName || undefined, nextDueDate: vaccineForm.nextDueDate || undefined, manufacturer: vaccineForm.manufacturer || undefined }
    const ok = await addVaccine(id, entry)
    setSaving(false)
    if (ok) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      setShowVaccineModal(false)
      setVaccineForm({ name: '', date: today(), batchNumber: '', vetName: '', nextDueDate: '', manufacturer: '' })
    }
  }

  const handleAddAllergy = async () => {
    if (!allergyForm.allergen) { Alert.alert('Champ requis', 'L\'allergène est obligatoire'); return }
    setSaving(true)
    const entry: AllergyEntry = { allergen: allergyForm.allergen, severity: allergyForm.severity as any, reaction: allergyForm.reaction || undefined, diagnosedAt: allergyForm.diagnosedAt || undefined }
    const ok = await addAllergy(id, entry)
    setSaving(false)
    if (ok) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      setShowAllergyModal(false)
      setAllergyForm({ allergen: '', severity: 'mild', reaction: '', diagnosedAt: today() })
    }
  }

  const handleAddCondition = async () => {
    if (!conditionForm.condition) { Alert.alert('Champ requis', 'Décrivez la condition'); return }
    setSaving(true)
    const entry: ChronicConditionEntry = { condition: conditionForm.condition, diagnosedAt: conditionForm.diagnosedAt || undefined, notes: conditionForm.notes || undefined, treatedWith: conditionForm.treatedWith || undefined }
    const ok = await addChronicCondition(id, entry)
    setSaving(false)
    if (ok) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      setShowConditionModal(false)
      setConditionForm({ condition: '', diagnosedAt: today(), notes: '', treatedWith: '' })
    }
  }

  const confirmDeleteEntry = (label: string, onConfirm: () => void) => {
    Alert.alert('Supprimer', `Supprimer ${label} ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: onConfirm },
    ])
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  if (loading && !currentPet) return <LoadingSpinner fullScreen />
  if (!currentPet) return (
    <SafeAreaView style={s.safe}>
      <View style={s.notFound}>
        <Text style={s.notFoundEmoji}>🔍</Text>
        <Text style={s.notFoundText}>Animal non trouvé</Text>
        <Button title="Retour" onPress={() => router.back()} variant="ghost" />
      </View>
    </SafeAreaView>
  )

  const pet = currentPet
  const ageText = pet.birthDate ? getAge(pet.birthDate) : null
  const vaccines = (Array.isArray(healthBook?.vaccines) ? healthBook!.vaccines : []) as VaccineEntry[]
  const allergies = (Array.isArray(healthBook?.allergies) ? healthBook!.allergies : []) as AllergyEntry[]
  const conditions = (Array.isArray(healthBook?.chronicConditions) ? healthBook!.chronicConditions : []) as ChronicConditionEntry[]

  const TABS: { key: Tab; label: string }[] = [
    { key: 'info',    label: '📋 Info'    },
    { key: 'carnet',  label: `🏥 Carnet${vaccines.length > 0 ? ` (${vaccines.length})` : ''}`  },
    { key: 'suivi',   label: '📊 Suivi'   },
    { key: 'medical', label: `💊 Dossier${medicalRecords.length > 0 ? ` (${medicalRecords.length})` : ''}` },
  ]

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.gray[700]} />
        </Pressable>
        <Text style={s.headerTitle} numberOfLines={1}>{pet.name}</Text>
        <Pressable onPress={handleDelete} style={s.deleteBtn}>
          <Ionicons name="trash-outline" size={20} color={colors.red} />
        </Pressable>
      </View>

      {/* Hero card */}
      <View style={[s.hero, shadow.sm]}>
        <View style={[s.heroAvatar, { backgroundColor: SPECIES_BG[pet.species] ?? colors.beigeLight }]}>
          <Text style={s.heroEmoji}>{SPECIES_EMOJI[pet.species] ?? '🐾'}</Text>
        </View>
        <View style={s.heroInfo}>
          <Text style={s.heroName}>{pet.name}</Text>
          <Text style={s.heroBreed}>{SPECIES_LABEL[pet.species] ?? pet.species}{pet.breed ? ` · ${pet.breed}` : ''}</Text>
          <View style={s.heroBadges}>
            {ageText && <Badge text={`🎂 ${ageText}`} bg={colors.beigeLight} color={colors.gray[700]} />}
            {pet.weight && <Badge text={`⚖️ ${pet.weight} kg`} bg={colors.greenLight} color={colors.greenDark} />}
            {healthBook?.isSterilized && <Badge text="✂️ Stérilisé(e)" bg={colors.blueLight} color={colors.blue} />}
          </View>
        </View>
      </View>

      {/* AI Pre-diagnosis CTA */}
      <Pressable
        onPress={() => router.push({ pathname: '/(tabs)/chat', params: { petId: id, preDiagnosis: '1' } })}
        style={({ pressed }) => [s.aiCta, pressed && { opacity: 0.85 }]}
      >
        <View style={s.aiCtaIcon}><Text style={{ fontSize: 18 }}>🤖</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={s.aiCtaTitle}>Pré-diagnostic IA</Text>
          <Text style={s.aiCtaDesc}>Décrivez les symptômes à l'assistant</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.green} />
      </Pressable>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabsScroll} contentContainerStyle={s.tabs}>
        {TABS.map((t) => (
          <Pressable key={t.key} onPress={() => { setTab(t.key); Haptics.selectionAsync() }} style={[s.tab, tab === t.key && s.tabActive]}>
            <Text style={[s.tabText, tab === t.key && s.tabTextActive]}>{t.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView
        style={s.scroll} contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading || hbLoading} onRefresh={refreshAll} tintColor={colors.green} />}
      >
        {/* ── INFO TAB ─────────────────────────────────────────────────────── */}
        {tab === 'info' && (
          <>
            <Card>
              <Text style={s.sectionTitle}>Informations générales</Text>
              <InfoRow label="Espèce"   value={SPECIES_LABEL[pet.species] ?? pet.species} />
              {pet.breed     && <InfoRow label="Race"              value={pet.breed} />}
              {pet.birthDate && <InfoRow label="Date de naissance" value={new Date(pet.birthDate).toLocaleDateString('fr-FR')} />}
              {ageText       && <InfoRow label="Âge"               value={ageText} />}
              {pet.weight    && <InfoRow label="Poids actuel"      value={`${pet.weight} kg`} />}
              {healthBook?.bloodType && <InfoRow label="Groupe sanguin" value={healthBook.bloodType} />}
              {healthBook?.identificationNumber && <InfoRow label="Identification" value={`${healthBook.identificationNumber} (${healthBook.identificationType ?? ''})`} />}
              {healthBook?.isSterilized !== undefined && <InfoRow label="Stérilisé(e)" value={healthBook.isSterilized ? 'Oui' : 'Non'} last />}
            </Card>

            {(healthBook?.insuranceCompany) && (
              <Card>
                <Text style={s.sectionTitle}>Assurance</Text>
                <InfoRow label="Compagnie" value={healthBook.insuranceCompany} />
                {healthBook.insurancePolicyNumber && <InfoRow label="N° police" value={healthBook.insurancePolicyNumber} />}
                {healthBook.insuranceExpiryDate && <InfoRow label="Expiration" value={new Date(healthBook.insuranceExpiryDate).toLocaleDateString('fr-FR')} last />}
              </Card>
            )}

            {(healthBook?.emergencyVetName) && (
              <Card>
                <Text style={s.sectionTitle}>Vétérinaire urgence</Text>
                <InfoRow label="Nom"       value={healthBook.emergencyVetName} />
                {healthBook.emergencyVetPhone && <InfoRow label="Téléphone" value={healthBook.emergencyVetPhone} last />}
              </Card>
            )}
          </>
        )}

        {/* ── CARNET TAB ───────────────────────────────────────────────────── */}
        {tab === 'carnet' && (
          <>
            {/* Vaccines */}
            <SectionHeader title="💉 Vaccins" count={vaccines.length} onAdd={() => setShowVaccineModal(true)} />
            {hbLoading ? <MedicalRecordSkeleton /> : vaccines.length === 0 ? (
              <EmptyState emoji="💉" title="Aucun vaccin" desc="Enregistrez les vaccinations de votre animal" compact />
            ) : vaccines.map((v, i) => (
              <Card key={i}>
                <View style={s.entryRow}>
                  <View style={[s.entryIcon, { backgroundColor: colors.blueLight }]}><Text>💉</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.entryTitle}>{v.name}</Text>
                    <Text style={s.entrySub}>📅 {fmtDate(v.date)}{v.nextDueDate ? `  ·  Rappel: ${fmtDate(v.nextDueDate)}` : ''}</Text>
                    {v.vetName && <Text style={s.entryMeta}>Dr. {v.vetName}{v.manufacturer ? ` · ${v.manufacturer}` : ''}</Text>}
                  </View>
                  <Pressable onPress={() => confirmDeleteEntry('ce vaccin', () => removeVaccine(id, i))} style={s.deleteEntryBtn}>
                    <Ionicons name="trash-outline" size={15} color={colors.red} />
                  </Pressable>
                </View>
              </Card>
            ))}

            {/* Allergies */}
            <SectionHeader title="⚠️ Allergies" count={allergies.length} onAdd={() => setShowAllergyModal(true)} />
            {allergies.length === 0 ? (
              <EmptyState emoji="⚠️" title="Aucune allergie connue" desc="" compact />
            ) : allergies.map((a, i) => {
              const sev = SEVERITY_OPTIONS.find((s) => s.value === a.severity) ?? SEVERITY_OPTIONS[0]
              return (
                <Card key={i}>
                  <View style={s.entryRow}>
                    <View style={[s.entryIcon, { backgroundColor: sev.bg }]}><Text>⚠️</Text></View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={s.entryTitle}>{a.allergen}</Text>
                        <View style={[s.pill, { backgroundColor: sev.bg }]}><Text style={[s.pillText, { color: sev.text }]}>{sev.label}</Text></View>
                      </View>
                      {a.reaction && <Text style={s.entrySub}>{a.reaction}</Text>}
                      {a.diagnosedAt && <Text style={s.entryMeta}>📅 {fmtDate(a.diagnosedAt)}</Text>}
                    </View>
                    <Pressable onPress={() => confirmDeleteEntry('cette allergie', () => removeAllergy(id, i))} style={s.deleteEntryBtn}>
                      <Ionicons name="trash-outline" size={15} color={colors.red} />
                    </Pressable>
                  </View>
                </Card>
              )
            })}

            {/* Chronic conditions */}
            <SectionHeader title="🩺 Maladies chroniques" count={conditions.length} onAdd={() => setShowConditionModal(true)} />
            {conditions.length === 0 ? (
              <EmptyState emoji="🩺" title="Aucune maladie chronique" desc="" compact />
            ) : conditions.map((c, i) => (
              <Card key={i}>
                <View style={s.entryRow}>
                  <View style={[s.entryIcon, { backgroundColor: colors.orangeLight }]}><Text>🩺</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.entryTitle}>{c.condition}</Text>
                    {c.treatedWith && <Text style={s.entrySub}>Traitement : {c.treatedWith}</Text>}
                    {c.diagnosedAt && <Text style={s.entryMeta}>📅 Diagnostiqué le {fmtDate(c.diagnosedAt)}</Text>}
                    {c.notes && <Text style={s.entryMeta}>{c.notes}</Text>}
                  </View>
                  <Pressable onPress={() => confirmDeleteEntry('cette condition', () => removeChronicCondition(id, i))} style={s.deleteEntryBtn}>
                    <Ionicons name="trash-outline" size={15} color={colors.red} />
                  </Pressable>
                </View>
              </Card>
            ))}
          </>
        )}

        {/* ── SUIVI TAB ────────────────────────────────────────────────────── */}
        {tab === 'suivi' && (
          <>
            {/* Weight */}
            <SectionHeader title="⚖️ Poids" count={weightHistory.length} onAdd={() => setShowWeightModal(true)} />
            {weightHistory.length === 0 ? (
              <EmptyState emoji="⚖️" title="Aucune mesure" desc="Suivez l'évolution du poids" compact />
            ) : (
              <>
                {weightHistory.length >= 2 && (
                  <Card><Text style={[s.sectionTitle, { marginBottom: 12 }]}>Évolution</Text><WeightChart entries={weightHistory.slice(0, 10).reverse()} /></Card>
                )}
                {weightHistory.slice(0, 5).map((entry) => (
                  <Card key={entry.id}>
                    <View style={s.entryRow}>
                      <View style={[s.entryIcon, { backgroundColor: colors.greenLight }]}><Text>⚖️</Text></View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.entryTitle}>{entry.weight} kg</Text>
                        <Text style={s.entryMeta}>{fmtDate(entry.recordedAt)}</Text>
                      </View>
                      <Pressable onPress={() => confirmDeleteEntry('cette mesure', () => deleteWeightEntry(id, entry.id))} style={s.deleteEntryBtn}>
                        <Ionicons name="trash-outline" size={15} color={colors.red} />
                      </Pressable>
                    </View>
                  </Card>
                ))}
              </>
            )}

            {/* Symptoms */}
            <SectionHeader title="🩺 Symptômes" count={symptomLogs.length} onAdd={() => setShowSymptomModal(true)} />
            {symptomLogs.length === 0 ? (
              <EmptyState emoji="🩺" title="Aucun symptôme" desc="Notez les symptômes observés" compact />
            ) : symptomLogs.slice(0, 5).map((log) => {
              const sev = SEVERITY_OPTIONS.find((sv) => sv.value === log.severity) ?? SEVERITY_OPTIONS[0]
              return (
                <Card key={log.id}>
                  <View style={s.entryRow}>
                    <View style={[s.entryIcon, { backgroundColor: sev.bg }]}><Text>🩺</Text></View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={s.entryTitle}>{log.symptom}</Text>
                        <View style={[s.pill, { backgroundColor: sev.bg }]}><Text style={[s.pillText, { color: sev.text }]}>{sev.label}</Text></View>
                      </View>
                      <Text style={s.entryMeta}>{fmtDate(log.observedAt)}</Text>
                    </View>
                    <Pressable onPress={() => confirmDeleteEntry('ce symptôme', () => deleteSymptomLog(id, log.id))} style={s.deleteEntryBtn}>
                      <Ionicons name="trash-outline" size={15} color={colors.red} />
                    </Pressable>
                  </View>
                </Card>
              )
            })}

            {/* Activities */}
            <SectionHeader title="🏃 Activités" count={activities.length} onAdd={() => setShowActivityModal(true)} />
            {activities.length === 0 ? (
              <EmptyState emoji="🏃" title="Aucune activité" desc="Enregistrez promenades et jeux" compact />
            ) : activities.slice(0, 5).map((act) => {
              const aType = ACTIVITY_TYPES.find((a) => a.value === act.type) ?? ACTIVITY_TYPES[0]
              return (
                <Card key={act.id}>
                  <View style={s.entryRow}>
                    <View style={[s.entryIcon, { backgroundColor: colors.greenLight }]}><Text style={{ fontSize: 20 }}>{aType.emoji}</Text></View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.entryTitle}>{aType.label} · {act.durationMinutes} min{act.distanceKm ? ` · ${act.distanceKm} km` : ''}</Text>
                      <Text style={s.entryMeta}>{fmtDate(act.startedAt)}</Text>
                    </View>
                    <Pressable onPress={() => confirmDeleteEntry('cette activité', () => deleteActivity(id, act.id))} style={s.deleteEntryBtn}>
                      <Ionicons name="trash-outline" size={15} color={colors.red} />
                    </Pressable>
                  </View>
                </Card>
              )
            })}

            {/* Feeding */}
            <SectionHeader title="🍽️ Alimentation" count={feedingLogs.length} onAdd={() => setShowFeedingModal(true)} />
            {feedingLogs.length === 0 ? (
              <EmptyState emoji="🍽️" title="Aucun repas enregistré" desc="Suivez l'alimentation de votre animal" compact />
            ) : feedingLogs.slice(0, 5).map((log) => {
              const fType = FOOD_TYPES.find((f) => f.value === log.foodType) ?? FOOD_TYPES[0]
              return (
                <Card key={log.id}>
                  <View style={s.entryRow}>
                    <View style={[s.entryIcon, { backgroundColor: colors.beigeLight }]}><Text style={{ fontSize: 20 }}>{fType.emoji}</Text></View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.entryTitle}>{fType.label}{log.productName ? ` · ${log.productName}` : ''}{log.quantity ? ` · ${log.quantity}${log.unit ?? ''}` : ''}</Text>
                      <Text style={s.entryMeta}>{fmtDate(log.fedAt)}{log.brand ? ` · ${log.brand}` : ''}</Text>
                    </View>
                    <Pressable onPress={() => confirmDeleteEntry('ce repas', () => deleteFeedingLog(id, log.id))} style={s.deleteEntryBtn}>
                      <Ionicons name="trash-outline" size={15} color={colors.red} />
                    </Pressable>
                  </View>
                </Card>
              )
            })}
          </>
        )}

        {/* ── MEDICAL TAB ──────────────────────────────────────────────────── */}
        {tab === 'medical' && (
          <>
            <Pressable onPress={() => setShowRecordModal(true)} style={({ pressed }) => [s.addBtn, shadow.green, pressed && { opacity: 0.85 }]}>
              <Ionicons name="add" size={20} color={colors.white} />
              <Text style={s.addBtnText}>Ajouter un enregistrement</Text>
            </Pressable>

            {medicalRecords.length === 0 ? (
              <EmptyState emoji="📋" title="Aucun enregistrement" desc="Ajoutez vaccins, traitements ou visites" />
            ) : medicalRecords.map((record) => {
              const meta = RECORD_TYPES.find((r) => r.value === record.type) ?? RECORD_TYPES[2]
              return (
                <Card key={record.id}>
                  <View style={s.entryRow}>
                    <View style={[s.entryIcon, { backgroundColor: meta.bg }]}><Text style={{ fontSize: 20 }}>{meta.emoji}</Text></View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={[s.entryTitle, { flex: 1 }]}>{record.title}</Text>
                        <View style={[s.pill, { backgroundColor: meta.bg }]}><Text style={[s.pillText, { color: meta.text }]}>{meta.label}</Text></View>
                      </View>
                      {record.description && <Text style={s.entrySub}>{record.description}</Text>}
                      <Text style={s.entryMeta}>📅 {fmtDate(record.date)}{record.vetName ? `  ·  Dr. ${record.vetName}` : ''}</Text>
                    </View>
                  </View>
                </Card>
              )
            })}
          </>
        )}
      </ScrollView>

      {/* ── MODALS (lazy mount — unmounted when closed) ───────────────────── */}

      {showRecordModal && (
        <BottomModal visible={showRecordModal} title="Nouvel enregistrement" onClose={() => setShowRecordModal(false)} onConfirm={handleAddRecord} saving={saving}>
          <View><Text style={s.fieldLabel}>Type</Text><View style={s.typeRow}>{RECORD_TYPES.map((t) => (<Pressable key={t.value} onPress={() => setRecordForm((f) => ({ ...f, type: t.value }))} style={[s.typeOpt, recordForm.type === t.value && { borderColor: t.text, backgroundColor: t.bg }]}><Text style={s.typeEmoji}>{t.emoji}</Text><Text style={[s.typeLabel, recordForm.type === t.value && { color: t.text }]}>{t.label}</Text></Pressable>))}</View></View>
          <Input label="Titre *" value={recordForm.title} onChangeText={(v) => setRecordForm((f) => ({ ...f, title: v }))} placeholder="Ex: Vaccin antirabique" />
          <Input label="Description" value={recordForm.description} onChangeText={(v) => setRecordForm((f) => ({ ...f, description: v }))} placeholder="Notes..." multiline />
          <Input label="Date" value={recordForm.date} onChangeText={(v) => setRecordForm((f) => ({ ...f, date: v }))} placeholder="AAAA-MM-JJ" keyboardType="numeric" />
          <Input label="Vétérinaire" value={recordForm.vetName} onChangeText={(v) => setRecordForm((f) => ({ ...f, vetName: v }))} placeholder="Dr. Martin" autoCapitalize="words" />
        </BottomModal>
      )}

      {showWeightModal && (
        <BottomModal visible={showWeightModal} title="Nouvelle mesure de poids" onClose={() => setShowWeightModal(false)} onConfirm={handleAddWeight} saving={saving}>
          <Input label="Poids (kg) *" value={weightForm.weight} onChangeText={(v) => setWeightForm((f) => ({ ...f, weight: v }))} placeholder="Ex: 4.5" keyboardType="decimal-pad" />
          <Input label="Date" value={weightForm.date} onChangeText={(v) => setWeightForm((f) => ({ ...f, date: v }))} placeholder="AAAA-MM-JJ" keyboardType="numeric" />
          <Input label="Notes" value={weightForm.notes} onChangeText={(v) => setWeightForm((f) => ({ ...f, notes: v }))} placeholder="Optionnel..." multiline />
        </BottomModal>
      )}

      {showSymptomModal && (
        <BottomModal visible={showSymptomModal} title="Nouveau symptôme" onClose={() => setShowSymptomModal(false)} onConfirm={handleAddSymptom} saving={saving}>
          <Input label="Symptôme *" value={symptomForm.symptom} onChangeText={(v) => setSymptomForm((f) => ({ ...f, symptom: v }))} placeholder="Ex: Toux, vomissements..." />
          <View><Text style={s.fieldLabel}>Sévérité</Text><View style={s.typeRow}>{SEVERITY_OPTIONS.map((sv) => (<Pressable key={sv.value} onPress={() => setSymptomForm((f) => ({ ...f, severity: sv.value }))} style={[s.typeOpt, symptomForm.severity === sv.value && { borderColor: sv.text, backgroundColor: sv.bg }]}><Text style={[s.typeLabel, symptomForm.severity === sv.value && { color: sv.text }]}>{sv.label}</Text></Pressable>))}</View></View>
          <Input label="Description" value={symptomForm.description} onChangeText={(v) => setSymptomForm((f) => ({ ...f, description: v }))} placeholder="Détails..." multiline />
          <Input label="Date" value={symptomForm.observedAt} onChangeText={(v) => setSymptomForm((f) => ({ ...f, observedAt: v }))} placeholder="AAAA-MM-JJ" keyboardType="numeric" />
        </BottomModal>
      )}

      {showActivityModal && (
        <BottomModal visible={showActivityModal} title="Nouvelle activité" onClose={() => setShowActivityModal(false)} onConfirm={handleAddActivity} saving={saving}>
          <View><Text style={s.fieldLabel}>Type</Text><View style={[s.typeRow, { flexWrap: 'wrap' }]}>{ACTIVITY_TYPES.map((a) => (<Pressable key={a.value} onPress={() => setActivityForm((f) => ({ ...f, type: a.value }))} style={[s.typeOpt, { width: '30%' }, activityForm.type === a.value && { borderColor: colors.green, backgroundColor: colors.greenLight }]}><Text style={s.typeEmoji}>{a.emoji}</Text><Text style={[s.typeLabel, activityForm.type === a.value && { color: colors.greenDark }]}>{a.label}</Text></Pressable>))}</View></View>
          <Input label="Durée (min) *" value={activityForm.durationMinutes} onChangeText={(v) => setActivityForm((f) => ({ ...f, durationMinutes: v }))} placeholder="Ex: 30" keyboardType="numeric" />
          <Input label="Distance (km)" value={activityForm.distanceKm} onChangeText={(v) => setActivityForm((f) => ({ ...f, distanceKm: v }))} placeholder="Ex: 2.5" keyboardType="decimal-pad" />
          <Input label="Date" value={activityForm.startedAt} onChangeText={(v) => setActivityForm((f) => ({ ...f, startedAt: v }))} placeholder="AAAA-MM-JJ" keyboardType="numeric" />
          <Input label="Notes" value={activityForm.notes} onChangeText={(v) => setActivityForm((f) => ({ ...f, notes: v }))} placeholder="Optionnel..." multiline />
        </BottomModal>
      )}

      {showFeedingModal && (
        <BottomModal visible={showFeedingModal} title="Nouveau repas" onClose={() => setShowFeedingModal(false)} onConfirm={handleAddFeeding} saving={saving}>
          <View><Text style={s.fieldLabel}>Type d'aliment</Text><View style={[s.typeRow, { flexWrap: 'wrap' }]}>{FOOD_TYPES.map((f) => (<Pressable key={f.value} onPress={() => setFeedingForm((ff) => ({ ...ff, foodType: f.value }))} style={[s.typeOpt, { width: '30%' }, feedingForm.foodType === f.value && { borderColor: colors.green, backgroundColor: colors.greenLight }]}><Text style={s.typeEmoji}>{f.emoji}</Text><Text style={[s.typeLabel, feedingForm.foodType === f.value && { color: colors.greenDark }]}>{f.label}</Text></Pressable>))}</View></View>
          <Input label="Marque" value={feedingForm.brand} onChangeText={(v) => setFeedingForm((f) => ({ ...f, brand: v }))} placeholder="Ex: Royal Canin" />
          <Input label="Produit" value={feedingForm.productName} onChangeText={(v) => setFeedingForm((f) => ({ ...f, productName: v }))} placeholder="Ex: Mini Adult" />
          <Input label="Quantité" value={feedingForm.quantity} onChangeText={(v) => setFeedingForm((f) => ({ ...f, quantity: v }))} placeholder="Ex: 200" keyboardType="numeric" />
          <Input label="Date *" value={feedingForm.fedAt} onChangeText={(v) => setFeedingForm((f) => ({ ...f, fedAt: v }))} placeholder="AAAA-MM-JJ" keyboardType="numeric" />
        </BottomModal>
      )}

      {showVaccineModal && (
        <BottomModal visible={showVaccineModal} title="Ajouter un vaccin" onClose={() => setShowVaccineModal(false)} onConfirm={handleAddVaccine} saving={saving}>
          <Input label="Nom du vaccin *" value={vaccineForm.name} onChangeText={(v) => setVaccineForm((f) => ({ ...f, name: v }))} placeholder="Ex: Vaccin antirabique" />
          <Input label="Date *" value={vaccineForm.date} onChangeText={(v) => setVaccineForm((f) => ({ ...f, date: v }))} placeholder="AAAA-MM-JJ" keyboardType="numeric" />
          <Input label="Prochain rappel" value={vaccineForm.nextDueDate} onChangeText={(v) => setVaccineForm((f) => ({ ...f, nextDueDate: v }))} placeholder="AAAA-MM-JJ" keyboardType="numeric" />
          <Input label="N° de lot" value={vaccineForm.batchNumber} onChangeText={(v) => setVaccineForm((f) => ({ ...f, batchNumber: v }))} placeholder="Ex: ABC123" />
          <Input label="Vétérinaire" value={vaccineForm.vetName} onChangeText={(v) => setVaccineForm((f) => ({ ...f, vetName: v }))} placeholder="Dr. Martin" autoCapitalize="words" />
          <Input label="Fabricant" value={vaccineForm.manufacturer} onChangeText={(v) => setVaccineForm((f) => ({ ...f, manufacturer: v }))} placeholder="Ex: Merial" />
        </BottomModal>
      )}

      {showAllergyModal && (
        <BottomModal visible={showAllergyModal} title="Ajouter une allergie" onClose={() => setShowAllergyModal(false)} onConfirm={handleAddAllergy} saving={saving}>
          <Input label="Allergène *" value={allergyForm.allergen} onChangeText={(v) => setAllergyForm((f) => ({ ...f, allergen: v }))} placeholder="Ex: Poulet, acariens..." />
          <View><Text style={s.fieldLabel}>Sévérité</Text><View style={s.typeRow}>{SEVERITY_OPTIONS.map((sv) => (<Pressable key={sv.value} onPress={() => setAllergyForm((f) => ({ ...f, severity: sv.value }))} style={[s.typeOpt, allergyForm.severity === sv.value && { borderColor: sv.text, backgroundColor: sv.bg }]}><Text style={[s.typeLabel, allergyForm.severity === sv.value && { color: sv.text }]}>{sv.label}</Text></Pressable>))}</View></View>
          <Input label="Réaction" value={allergyForm.reaction} onChangeText={(v) => setAllergyForm((f) => ({ ...f, reaction: v }))} placeholder="Ex: Démangeaisons, éruption..." multiline />
          <Input label="Date de diagnostic" value={allergyForm.diagnosedAt} onChangeText={(v) => setAllergyForm((f) => ({ ...f, diagnosedAt: v }))} placeholder="AAAA-MM-JJ" keyboardType="numeric" />
        </BottomModal>
      )}

      {showConditionModal && (
        <BottomModal visible={showConditionModal} title="Maladie chronique" onClose={() => setShowConditionModal(false)} onConfirm={handleAddCondition} saving={saving}>
          <Input label="Condition *" value={conditionForm.condition} onChangeText={(v) => setConditionForm((f) => ({ ...f, condition: v }))} placeholder="Ex: Diabète, insuffisance rénale..." />
          <Input label="Traitement" value={conditionForm.treatedWith} onChangeText={(v) => setConditionForm((f) => ({ ...f, treatedWith: v }))} placeholder="Ex: Insuline quotidienne" multiline />
          <Input label="Date de diagnostic" value={conditionForm.diagnosedAt} onChangeText={(v) => setConditionForm((f) => ({ ...f, diagnosedAt: v }))} placeholder="AAAA-MM-JJ" keyboardType="numeric" />
          <Input label="Notes" value={conditionForm.notes} onChangeText={(v) => setConditionForm((f) => ({ ...f, notes: v }))} placeholder="Informations complémentaires..." multiline />
        </BottomModal>
      )}
    </SafeAreaView>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const BottomModal = memo(function BottomModal({ visible, title, onClose, onConfirm, saving, children }: { visible: boolean; title: string; onClose: () => void; onConfirm: () => void; saving: boolean; children: React.ReactNode }) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={s.modal}>
        <View style={s.modalHandle} />
        <View style={s.modalHeader}>
          <Pressable onPress={onClose}><Text style={s.modalCancel}>Annuler</Text></Pressable>
          <Text style={s.modalTitle}>{title}</Text>
          <Pressable onPress={onConfirm} disabled={saving}><Text style={[s.modalConfirm, saving && s.modalConfirmDisabled]}>{saving ? 'En cours…' : 'Ajouter'}</Text></Pressable>
        </View>
        <ScrollView style={s.modalScroll} keyboardShouldPersistTaps="handled">
          <View style={s.modalFields}>{children}</View>
        </ScrollView>
      </View>
    </Modal>
  )
})

const SectionHeader = memo(function SectionHeader({ title, count, onAdd }: { title: string; count: number; onAdd: () => void }) {
  return (
    <View style={s.sectionHeader}>
      <Text style={s.sectionTitle}>{title}{count > 0 ? ` (${count})` : ''}</Text>
      <Pressable onPress={onAdd} style={s.sectionAddBtn}>
        <Ionicons name="add-circle" size={22} color={colors.green} />
      </Pressable>
    </View>
  )
})

const InfoRow = memo(function InfoRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[s.infoRow, last && s.infoRowLast]}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue}>{value}</Text>
    </View>
  )
})

const Badge = memo(function Badge({ text, bg, color }: { text: string; bg: string; color: string }) {
  return <View style={[s.heroBadge, { backgroundColor: bg }]}><Text style={[s.heroBadgeText, { color }]}>{text}</Text></View>
})

const EmptyState = memo(function EmptyState({ emoji, title, desc, compact }: { emoji: string; title: string; desc: string; compact?: boolean }) {
  return (
    <View style={[s.empty, compact && s.emptyCompact]}>
      {!compact && <View style={s.emptyIcon}><Text style={{ fontSize: 36 }}>{emoji}</Text></View>}
      <Text style={s.emptyTitle}>{title}</Text>
      {desc ? <Text style={s.emptyDesc}>{desc}</Text> : null}
    </View>
  )
})

const WeightChart = memo(function WeightChart({ entries }: { entries: { weight: number; recordedAt: string }[] }) {
  const weights = entries.map((e) => e.weight)
  const min = Math.min(...weights), max = Math.max(...weights), range = max - min || 1
  return (
    <View style={s.chart}>
      {entries.map((e, i) => {
        const h = Math.max(6, ((e.weight - min) / range) * 60)
        return (
          <View key={i} style={s.chartBar}>
            <Text style={s.chartVal}>{e.weight}</Text>
            <View style={[s.chartFill, { height: h }]} />
            <Text style={s.chartLbl}>{new Date(e.recordedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}</Text>
          </View>
        )
      })}
    </View>
  )
})

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: colors.beigePale },
  notFound:    { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFoundEmoji: { fontSize: 48 },
  notFoundText:  { fontSize: 16, color: colors.gray[500] },

  header:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 10 },
  backBtn:     { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.gray[200], marginRight: 10 },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: '800', color: colors.dark },
  deleteBtn:   { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.redLight },

  hero:       { marginHorizontal: 16, marginBottom: 10, backgroundColor: colors.white, borderRadius: radius['2xl'], padding: 18, flexDirection: 'row', gap: 14, borderWidth: 1, borderColor: colors.gray[200] },
  heroAvatar: { width: 72, height: 72, borderRadius: radius.xl, alignItems: 'center', justifyContent: 'center' },
  heroEmoji:  { fontSize: 40 },
  heroInfo:   { flex: 1, justifyContent: 'center' },
  heroName:   { fontSize: 22, fontWeight: '800', color: colors.dark },
  heroBreed:  { fontSize: 13, color: colors.gray[500], marginTop: 2 },
  heroBadges: { flexDirection: 'row', gap: 6, marginTop: 8, flexWrap: 'wrap' },
  heroBadge:  { paddingHorizontal: 9, paddingVertical: 3, borderRadius: radius.full },
  heroBadgeText: { fontSize: 11, fontWeight: '600' },

  aiCta:     { marginHorizontal: 16, marginBottom: 10, backgroundColor: colors.dark, borderRadius: radius['2xl'], padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  aiCtaIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(126,177,63,0.15)', alignItems: 'center', justifyContent: 'center' },
  aiCtaTitle: { fontSize: 14, fontWeight: '700', color: colors.white },
  aiCtaDesc:  { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 1 },

  tabsScroll: { maxHeight: 46, marginBottom: 6 },
  tabs:       { flexDirection: 'row', paddingHorizontal: 16, gap: 8, paddingVertical: 2 },
  tab:        { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.xl, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.gray[200] },
  tabActive:  { backgroundColor: colors.dark, borderColor: colors.dark },
  tabText:    { fontSize: 12, fontWeight: '600', color: colors.gray[500] },
  tabTextActive: { color: colors.white },

  scroll:        { flex: 1, paddingHorizontal: 16 },
  scrollContent: { gap: 10, paddingBottom: 40 },

  sectionHeader:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  sectionTitle:   { fontSize: 15, fontWeight: '700', color: colors.dark },
  sectionAddBtn:  { padding: 4 },

  infoRow:     { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: colors.gray[100] },
  infoRowLast: { borderBottomWidth: 0 },
  infoLabel:   { fontSize: 13, color: colors.gray[500] },
  infoValue:   { fontSize: 13, fontWeight: '600', color: colors.dark, maxWidth: '60%', textAlign: 'right' },

  addBtn:     { backgroundColor: colors.green, borderRadius: radius['2xl'], paddingVertical: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  addBtnText: { color: colors.white, fontWeight: '700', fontSize: 14 },

  entryRow:      { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  entryIcon:     { width: 40, height: 40, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  entryTitle:    { fontSize: 14, fontWeight: '700', color: colors.dark },
  entrySub:      { fontSize: 12, color: colors.gray[500], marginTop: 2, lineHeight: 17 },
  entryMeta:     { fontSize: 11, color: colors.gray[400], marginTop: 3 },
  deleteEntryBtn:{ width: 30, height: 30, borderRadius: 15, backgroundColor: colors.redLight, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },

  pill:      { paddingHorizontal: 7, paddingVertical: 2, borderRadius: radius.full },
  pillText:  { fontSize: 10, fontWeight: '700' },

  empty:        { alignItems: 'center', paddingVertical: 20 },
  emptyCompact: { paddingVertical: 12 },
  emptyIcon:    { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.gray[100], alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  emptyTitle:   { fontSize: 14, fontWeight: '700', color: colors.gray[500] },
  emptyDesc:    { fontSize: 12, color: colors.gray[400], textAlign: 'center', marginTop: 4 },

  chart:    { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 90, paddingTop: 24 },
  chartBar: { flex: 1, alignItems: 'center', gap: 3 },
  chartFill:{ width: '100%', backgroundColor: colors.green, borderRadius: 3, minWidth: 8 },
  chartVal: { fontSize: 8, fontWeight: '700', color: colors.greenDark },
  chartLbl: { fontSize: 7, color: colors.gray[400], textAlign: 'center' },

  modal:                { flex: 1, backgroundColor: colors.beigePale },
  modalHandle:          { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.gray[300], alignSelf: 'center', marginTop: 12, marginBottom: 4 },
  modalHeader:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.gray[200], backgroundColor: colors.white },
  modalCancel:          { fontSize: 15, color: colors.gray[500] },
  modalTitle:           { fontSize: 16, fontWeight: '700', color: colors.dark },
  modalConfirm:         { fontSize: 15, fontWeight: '700', color: colors.green },
  modalConfirmDisabled: { color: colors.gray[400] },
  modalScroll:          { flex: 1, paddingHorizontal: 20 },
  modalFields:          { gap: 18, paddingTop: 20, paddingBottom: 40 },
  fieldLabel:           { fontSize: 13, fontWeight: '600', color: colors.gray[600], marginLeft: 2, marginBottom: 8 },

  typeRow:   { flexDirection: 'row', gap: 8 },
  typeOpt:   { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: radius.xl, borderWidth: 1.5, borderColor: colors.gray[200], backgroundColor: colors.white },
  typeEmoji: { fontSize: 20, marginBottom: 3 },
  typeLabel: { fontSize: 10, fontWeight: '700', color: colors.gray[500] },
})
