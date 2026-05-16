import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { Alert, Image, Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import * as ImagePicker from 'expo-image-picker'
import { router, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { api } from '@/services/api'
import { usePetsStore } from '@/stores/pets'
import { useHealthBookStore } from '@/stores/healthBook'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { DateInput } from '@/components/ui/DateInput'
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

type Tab = 'info' | 'carnet' | 'suivi' | 'medical' | 'ia'

type AiStatus = 'idle' | 'loading' | 'pending' | 'completed' | 'failed' | 'rate_limited'

interface AiSynthesis {
  prioritizedHypotheses: { title: string; description: string; probability?: string }[]
  urgentSigns: string[]
  generalRecommendations: string[]
  userFriendlySummary: string
  overallUrgency: 'low' | 'medium' | 'high' | 'critical'
}

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
    uploadAvatar,
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
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  const [showIdModal, setShowIdModal] = useState(false)
  const [idForm, setIdForm] = useState({ identificationNumber: '', identificationType: 'microchip' as 'microchip' | 'tattoo', identificationDate: '', passportNumber: '', passportIssueDate: '' })

  const [aiStatus, setAiStatus] = useState<AiStatus>('idle')
  const [aiDiagnosisId, setAiDiagnosisId] = useState<string | null>(null)
  const [aiSynthesis, setAiSynthesis] = useState<AiSynthesis | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

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

  // ── AI Analysis ─────────────────────────────────────────────────────────────

  const startAiAnalysis = useCallback(async (pet: typeof currentPet, hb: typeof healthBook, conds: ChronicConditionEntry[], allergs: AllergyEntry[]) => {
    if (!pet) return
    setAiStatus('loading')
    setAiError(null)

    const parts: string[] = [
      `Analyse du profil de ${pet.name}.`,
      `Espèce: ${SPECIES_LABEL[pet.species] ?? pet.species}`,
    ]
    if (pet.breed) parts.push(`Race: ${pet.breed}`)
    if (pet.birthDate) parts.push(`Âge: ${getAge(pet.birthDate)}`)
    if (pet.weight) parts.push(`Poids: ${pet.weight} kg`)
    if (hb?.isSterilized !== undefined) parts.push(`Stérilisé(e): ${hb.isSterilized ? 'oui' : 'non'}`)
    if (conds.length > 0) parts.push(`Maladies chroniques: ${conds.map((c) => c.condition).join(', ')}`)
    if (allergs.length > 0) parts.push(`Allergies: ${allergs.map((a) => a.allergen).join(', ')}`)
    const description = parts.join('. ')

    const formData = new FormData()
    formData.append('description', description)

    const res = await api.upload<{ id: string; status: string }>(`/pets/${pet.id}/pre-diagnosis`, formData)

    if (!res.success) {
      const msg = res.message ?? ''
      if (msg.includes('Limite') || msg.includes('quotidienne')) {
        setAiStatus('rate_limited')
        setAiError('Limite quotidienne atteinte (3 analyses par jour)')
      } else if (msg.includes('30 minutes') || msg.includes('cooldown')) {
        setAiStatus('rate_limited')
        setAiError('Veuillez attendre 30 minutes entre deux analyses')
      } else {
        setAiStatus('failed')
        setAiError(msg || 'Erreur lors du lancement de l\'analyse')
      }
      return
    }

    setAiDiagnosisId(res.data!.id)
    setAiStatus('pending')
  }, [])

  useEffect(() => {
    if (aiStatus !== 'pending' || !aiDiagnosisId) return

    pollRef.current = setInterval(async () => {
      const res = await api.get<any>(`/pre-diagnosis/${aiDiagnosisId}`)
      if (!res.success) return
      const data = res.data
      if (data?.status === 'completed') {
        clearInterval(pollRef.current!)
        setAiSynthesis(data.synthesis)
        setAiStatus('completed')
      } else if (data?.status === 'failed') {
        clearInterval(pollRef.current!)
        setAiStatus('failed')
        setAiError('L\'analyse a échoué, veuillez réessayer')
      }
    }, 5000)

    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [aiStatus, aiDiagnosisId])

  useEffect(() => {
    if (tab !== 'ia' || aiStatus !== 'idle' || !currentPet) return
    const conds = (Array.isArray(healthBook?.chronicConditions) ? healthBook!.chronicConditions : []) as ChronicConditionEntry[]
    const allergs = (Array.isArray(healthBook?.allergies) ? healthBook!.allergies : []) as AllergyEntry[]
    startAiAnalysis(currentPet, healthBook, conds, allergs)
  }, [tab]) // eslint-disable-line react-hooks/exhaustive-deps

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

  const handlePickAvatar = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!perm.granted) {
      Alert.alert('Permission refusée', 'Autorisez l\'accès à vos photos dans les réglages.')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    })
    if (result.canceled || !result.assets[0]) return

    const asset = result.assets[0]
    const formData = new FormData()
    formData.append('avatar', {
      uri: asset.uri,
      type: asset.mimeType ?? 'image/jpeg',
      name: `avatar.${asset.uri.split('.').pop() ?? 'jpg'}`,
    } as any)

    setUploadingAvatar(true)
    await uploadAvatar(id, formData)
    setUploadingAvatar(false)
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
  }

  const handleSaveId = async () => {
    setSaving(true)
    const ok = await updateHealthBook(id, {
      identificationNumber: idForm.identificationNumber || undefined,
      identificationType: idForm.identificationType || undefined,
      identificationDate: idForm.identificationDate || undefined,
      passportNumber: idForm.passportNumber || undefined,
      passportIssueDate: idForm.passportIssueDate || undefined,
    } as any)
    setSaving(false)
    if (ok) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      setShowIdModal(false)
    }
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
    { key: 'ia',      label: '🤖 Analyse IA' },
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
        <Pressable onPress={handlePickAvatar} style={s.heroAvatarWrap} disabled={uploadingAvatar}>
          <View style={[s.heroAvatar, { backgroundColor: SPECIES_BG[pet.species] ?? colors.beigeLight }]}>
            {pet.avatarUrl
              ? <Image source={{ uri: pet.avatarUrl }} style={s.heroAvatarImg} />
              : <Text style={s.heroEmoji}>{SPECIES_EMOJI[pet.species] ?? '🐾'}</Text>
            }
          </View>
          <View style={s.avatarEditBadge}>
            <Text style={{ fontSize: 10 }}>{uploadingAvatar ? '⏳' : '📷'}</Text>
          </View>
        </Pressable>
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
            {/* Identification / Microchip */}
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>🔖 Identification</Text>
              <Pressable
                onPress={() => {
                  setIdForm({
                    identificationNumber: healthBook?.identificationNumber ?? '',
                    identificationType: (healthBook?.identificationType as any) ?? 'microchip',
                    identificationDate: healthBook?.identificationDate ?? '',
                    passportNumber: healthBook?.passportNumber ?? '',
                    passportIssueDate: healthBook?.passportIssueDate ?? '',
                  })
                  setShowIdModal(true)
                }}
                style={s.sectionAddBtn}
              >
                <Ionicons name="pencil" size={18} color={colors.green} />
              </Pressable>
            </View>
            <Card>
              {healthBook?.identificationNumber
                ? <>
                    <InfoRow label="N° puce / tatouage" value={healthBook.identificationNumber} />
                    {healthBook.identificationType && <InfoRow label="Type" value={healthBook.identificationType === 'microchip' ? '🔵 Puce électronique' : '🖊️ Tatouage'} />}
                    {healthBook.identificationDate && <InfoRow label="Date" value={fmtDate(healthBook.identificationDate)} />}
                    {healthBook.passportNumber && <InfoRow label="N° passeport" value={healthBook.passportNumber} />}
                    {healthBook.passportIssueDate && <InfoRow label="Date passeport" value={fmtDate(healthBook.passportIssueDate)} last />}
                  </>
                : <View style={s.empty}>
                    <Text style={s.emptyTitle}>Aucune identification</Text>
                    <Text style={s.emptyDesc}>Ajoutez le numéro de puce ou de passeport</Text>
                  </View>
              }
            </Card>

            <Card>
              <Text style={s.sectionTitle}>Informations générales</Text>
              <InfoRow label="Espèce"   value={SPECIES_LABEL[pet.species] ?? pet.species} />
              {pet.breed     && <InfoRow label="Race"              value={pet.breed} />}
              {pet.birthDate && <InfoRow label="Date de naissance" value={new Date(pet.birthDate).toLocaleDateString('fr-FR')} />}
              {ageText       && <InfoRow label="Âge"               value={ageText} />}
              {pet.weight    && <InfoRow label="Poids actuel"      value={`${pet.weight} kg`} />}
              {healthBook?.bloodType && <InfoRow label="Groupe sanguin" value={healthBook.bloodType} />}
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

        {/* ── IA TAB ───────────────────────────────────────────────────────── */}
        {tab === 'ia' && (
          <AiAnalysisTab
            status={aiStatus}
            synthesis={aiSynthesis}
            error={aiError}
            onRetry={() => {
              setAiStatus('idle')
              setAiSynthesis(null)
              setAiError(null)
              setAiDiagnosisId(null)
            }}
          />
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
          <DateInput label="Date" value={recordForm.date} onChange={(v) => setRecordForm((f) => ({ ...f, date: v }))} maximumDate={new Date()} />
          <Input label="Vétérinaire" value={recordForm.vetName} onChangeText={(v) => setRecordForm((f) => ({ ...f, vetName: v }))} placeholder="Dr. Martin" autoCapitalize="words" />
        </BottomModal>
      )}

      {showWeightModal && (
        <BottomModal visible={showWeightModal} title="Nouvelle mesure de poids" onClose={() => setShowWeightModal(false)} onConfirm={handleAddWeight} saving={saving}>
          <Input label="Poids (kg) *" value={weightForm.weight} onChangeText={(v) => setWeightForm((f) => ({ ...f, weight: v }))} placeholder="Ex: 4.5" keyboardType="decimal-pad" />
          <DateInput label="Date" value={weightForm.date} onChange={(v) => setWeightForm((f) => ({ ...f, date: v }))} maximumDate={new Date()} />
          <Input label="Notes" value={weightForm.notes} onChangeText={(v) => setWeightForm((f) => ({ ...f, notes: v }))} placeholder="Optionnel..." multiline />
        </BottomModal>
      )}

      {showSymptomModal && (
        <BottomModal visible={showSymptomModal} title="Nouveau symptôme" onClose={() => setShowSymptomModal(false)} onConfirm={handleAddSymptom} saving={saving}>
          <Input label="Symptôme *" value={symptomForm.symptom} onChangeText={(v) => setSymptomForm((f) => ({ ...f, symptom: v }))} placeholder="Ex: Toux, vomissements..." />
          <View><Text style={s.fieldLabel}>Sévérité</Text><View style={s.typeRow}>{SEVERITY_OPTIONS.map((sv) => (<Pressable key={sv.value} onPress={() => setSymptomForm((f) => ({ ...f, severity: sv.value }))} style={[s.typeOpt, symptomForm.severity === sv.value && { borderColor: sv.text, backgroundColor: sv.bg }]}><Text style={[s.typeLabel, symptomForm.severity === sv.value && { color: sv.text }]}>{sv.label}</Text></Pressable>))}</View></View>
          <Input label="Description" value={symptomForm.description} onChangeText={(v) => setSymptomForm((f) => ({ ...f, description: v }))} placeholder="Détails..." multiline />
          <DateInput label="Date" value={symptomForm.observedAt} onChange={(v) => setSymptomForm((f) => ({ ...f, observedAt: v }))} maximumDate={new Date()} />
        </BottomModal>
      )}

      {showActivityModal && (
        <BottomModal visible={showActivityModal} title="Nouvelle activité" onClose={() => setShowActivityModal(false)} onConfirm={handleAddActivity} saving={saving}>
          <View><Text style={s.fieldLabel}>Type</Text><View style={[s.typeRow, { flexWrap: 'wrap' }]}>{ACTIVITY_TYPES.map((a) => (<Pressable key={a.value} onPress={() => setActivityForm((f) => ({ ...f, type: a.value }))} style={[s.typeOpt, { width: '30%' }, activityForm.type === a.value && { borderColor: colors.green, backgroundColor: colors.greenLight }]}><Text style={s.typeEmoji}>{a.emoji}</Text><Text style={[s.typeLabel, activityForm.type === a.value && { color: colors.greenDark }]}>{a.label}</Text></Pressable>))}</View></View>
          <Input label="Durée (min) *" value={activityForm.durationMinutes} onChangeText={(v) => setActivityForm((f) => ({ ...f, durationMinutes: v }))} placeholder="Ex: 30" keyboardType="numeric" />
          <Input label="Distance (km)" value={activityForm.distanceKm} onChangeText={(v) => setActivityForm((f) => ({ ...f, distanceKm: v }))} placeholder="Ex: 2.5" keyboardType="decimal-pad" />
          <DateInput label="Date" value={activityForm.startedAt} onChange={(v) => setActivityForm((f) => ({ ...f, startedAt: v }))} maximumDate={new Date()} />
          <Input label="Notes" value={activityForm.notes} onChangeText={(v) => setActivityForm((f) => ({ ...f, notes: v }))} placeholder="Optionnel..." multiline />
        </BottomModal>
      )}

      {showFeedingModal && (
        <BottomModal visible={showFeedingModal} title="Nouveau repas" onClose={() => setShowFeedingModal(false)} onConfirm={handleAddFeeding} saving={saving}>
          <View><Text style={s.fieldLabel}>Type d'aliment</Text><View style={[s.typeRow, { flexWrap: 'wrap' }]}>{FOOD_TYPES.map((f) => (<Pressable key={f.value} onPress={() => setFeedingForm((ff) => ({ ...ff, foodType: f.value }))} style={[s.typeOpt, { width: '30%' }, feedingForm.foodType === f.value && { borderColor: colors.green, backgroundColor: colors.greenLight }]}><Text style={s.typeEmoji}>{f.emoji}</Text><Text style={[s.typeLabel, feedingForm.foodType === f.value && { color: colors.greenDark }]}>{f.label}</Text></Pressable>))}</View></View>
          <Input label="Marque" value={feedingForm.brand} onChangeText={(v) => setFeedingForm((f) => ({ ...f, brand: v }))} placeholder="Ex: Royal Canin" />
          <Input label="Produit" value={feedingForm.productName} onChangeText={(v) => setFeedingForm((f) => ({ ...f, productName: v }))} placeholder="Ex: Mini Adult" />
          <Input label="Quantité" value={feedingForm.quantity} onChangeText={(v) => setFeedingForm((f) => ({ ...f, quantity: v }))} placeholder="Ex: 200" keyboardType="numeric" />
          <DateInput label="Date *" value={feedingForm.fedAt} onChange={(v) => setFeedingForm((f) => ({ ...f, fedAt: v }))} maximumDate={new Date()} />
        </BottomModal>
      )}

      {showVaccineModal && (
        <BottomModal visible={showVaccineModal} title="Ajouter un vaccin" onClose={() => setShowVaccineModal(false)} onConfirm={handleAddVaccine} saving={saving}>
          <Input label="Nom du vaccin *" value={vaccineForm.name} onChangeText={(v) => setVaccineForm((f) => ({ ...f, name: v }))} placeholder="Ex: Vaccin antirabique" />
          <DateInput label="Date *" value={vaccineForm.date} onChange={(v) => setVaccineForm((f) => ({ ...f, date: v }))} maximumDate={new Date()} />
          <DateInput label="Prochain rappel" value={vaccineForm.nextDueDate} onChange={(v) => setVaccineForm((f) => ({ ...f, nextDueDate: v }))} />
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
          <DateInput label="Date de diagnostic" value={allergyForm.diagnosedAt} onChange={(v) => setAllergyForm((f) => ({ ...f, diagnosedAt: v }))} maximumDate={new Date()} />
        </BottomModal>
      )}

      {showConditionModal && (
        <BottomModal visible={showConditionModal} title="Maladie chronique" onClose={() => setShowConditionModal(false)} onConfirm={handleAddCondition} saving={saving}>
          <Input label="Condition *" value={conditionForm.condition} onChangeText={(v) => setConditionForm((f) => ({ ...f, condition: v }))} placeholder="Ex: Diabète, insuffisance rénale..." />
          <Input label="Traitement" value={conditionForm.treatedWith} onChangeText={(v) => setConditionForm((f) => ({ ...f, treatedWith: v }))} placeholder="Ex: Insuline quotidienne" multiline />
          <DateInput label="Date de diagnostic" value={conditionForm.diagnosedAt} onChange={(v) => setConditionForm((f) => ({ ...f, diagnosedAt: v }))} maximumDate={new Date()} />
          <Input label="Notes" value={conditionForm.notes} onChangeText={(v) => setConditionForm((f) => ({ ...f, notes: v }))} placeholder="Informations complémentaires..." multiline />
        </BottomModal>
      )}

      {showIdModal && (
        <BottomModal visible={showIdModal} title="Identification" onClose={() => setShowIdModal(false)} onConfirm={handleSaveId} saving={saving}>
          <Input label="N° puce / tatouage" value={idForm.identificationNumber} onChangeText={(v) => setIdForm((f) => ({ ...f, identificationNumber: v }))} placeholder="Ex: 250268500123456" keyboardType="numeric" />
          <View>
            <Text style={s.fieldLabel}>Type d'identification</Text>
            <View style={s.typeRow}>
              <Pressable onPress={() => setIdForm((f) => ({ ...f, identificationType: 'microchip' }))} style={[s.typeOpt, idForm.identificationType === 'microchip' && { borderColor: colors.green, backgroundColor: colors.greenLight }]}>
                <Text style={s.typeEmoji}>🔵</Text>
                <Text style={[s.typeLabel, idForm.identificationType === 'microchip' && { color: colors.greenDark }]}>Puce</Text>
              </Pressable>
              <Pressable onPress={() => setIdForm((f) => ({ ...f, identificationType: 'tattoo' }))} style={[s.typeOpt, idForm.identificationType === 'tattoo' && { borderColor: colors.green, backgroundColor: colors.greenLight }]}>
                <Text style={s.typeEmoji}>🖊️</Text>
                <Text style={[s.typeLabel, idForm.identificationType === 'tattoo' && { color: colors.greenDark }]}>Tatouage</Text>
              </Pressable>
            </View>
          </View>
          <DateInput label="Date d'identification" value={idForm.identificationDate} onChange={(v) => setIdForm((f) => ({ ...f, identificationDate: v }))} maximumDate={new Date()} />
          <Input label="N° passeport européen" value={idForm.passportNumber} onChangeText={(v) => setIdForm((f) => ({ ...f, passportNumber: v }))} placeholder="Ex: FR12345678" autoCapitalize="characters" />
          <DateInput label="Date d'émission passeport" value={idForm.passportIssueDate} onChange={(v) => setIdForm((f) => ({ ...f, passportIssueDate: v }))} maximumDate={new Date()} />
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

const URGENCY_CONFIG = {
  low:      { label: 'Faible',   bg: colors.greenLight,  text: colors.greenDark, bar: colors.green },
  medium:   { label: 'Modéré',  bg: colors.orangeLight, text: colors.orange,   bar: colors.orange },
  high:     { label: 'Élevé',   bg: colors.redLight,    text: colors.red,      bar: colors.red    },
  critical: { label: 'Critique', bg: '#2D0000',          text: '#FF6B6B',       bar: '#FF6B6B'     },
}

const AiAnalysisTab = memo(function AiAnalysisTab({
  status, synthesis, error, onRetry,
}: {
  status: AiStatus
  synthesis: AiSynthesis | null
  error: string | null
  onRetry: () => void
}) {
  if (status === 'loading' || status === 'pending') {
    return (
      <View style={ai.loadingWrap}>
        <LinearGradient colors={['#2A3520', colors.dark]} style={ai.loadingIcon}>
          <Text style={{ fontSize: 32 }}>🤖</Text>
        </LinearGradient>
        <Text style={ai.loadingTitle}>
          {status === 'loading' ? 'Lancement de l\'analyse…' : 'Analyse en cours…'}
        </Text>
        <Text style={ai.loadingDesc}>
          Notre IA analyse le profil de votre animal{'\n'}Cela prend environ 2-3 minutes
        </Text>
        <View style={ai.dots}>
          {[0, 1, 2].map((i) => <View key={i} style={[ai.dot, { opacity: 0.3 + i * 0.35 }]} />)}
        </View>
      </View>
    )
  }

  if (status === 'rate_limited') {
    return (
      <View style={ai.loadingWrap}>
        <View style={ai.errorIcon}><Text style={{ fontSize: 32 }}>⏳</Text></View>
        <Text style={ai.loadingTitle}>Limite atteinte</Text>
        <Text style={ai.loadingDesc}>{error}</Text>
      </View>
    )
  }

  if (status === 'failed' || (!synthesis && status === 'completed')) {
    return (
      <View style={ai.loadingWrap}>
        <View style={ai.errorIcon}><Text style={{ fontSize: 32 }}>⚠️</Text></View>
        <Text style={ai.loadingTitle}>Analyse échouée</Text>
        <Text style={ai.loadingDesc}>{error ?? 'Une erreur est survenue'}</Text>
        <Pressable onPress={onRetry} style={({ pressed }) => [ai.retryBtn, pressed && { opacity: 0.8 }]}>
          <Text style={ai.retryBtnText}>Réessayer</Text>
        </Pressable>
      </View>
    )
  }

  if (!synthesis) return null

  const urg = URGENCY_CONFIG[synthesis.overallUrgency] ?? URGENCY_CONFIG.low

  return (
    <>
      {/* Urgency banner */}
      <View style={[ai.urgencyBanner, { backgroundColor: urg.bg }]}>
        <View style={{ flex: 1 }}>
          <Text style={[ai.urgencyLabel, { color: urg.text }]}>Niveau d'urgence</Text>
          <Text style={[ai.urgencyValue, { color: urg.text }]}>{urg.label}</Text>
        </View>
        <View style={[ai.urgencyDot, { backgroundColor: urg.bar }]} />
      </View>

      {/* Summary */}
      <Card>
        <Text style={s.sectionTitle}>📋 Résumé de l'analyse</Text>
        <Text style={ai.summaryText}>{synthesis.userFriendlySummary}</Text>
      </Card>

      {/* Urgent signs */}
      {synthesis.urgentSigns.length > 0 && (
        <Card>
          <Text style={s.sectionTitle}>🚨 Signes à surveiller</Text>
          {synthesis.urgentSigns.map((sign, i) => (
            <View key={i} style={ai.listItem}>
              <View style={ai.bullet} />
              <Text style={ai.listText}>{sign}</Text>
            </View>
          ))}
        </Card>
      )}

      {/* Hypotheses */}
      {synthesis.prioritizedHypotheses.length > 0 && (
        <Card>
          <Text style={s.sectionTitle}>🔬 Hypothèses</Text>
          {synthesis.prioritizedHypotheses.map((h, i) => (
            <View key={i} style={[ai.hypothesisItem, i < synthesis.prioritizedHypotheses.length - 1 && ai.hypothesisBorder]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <View style={[ai.hypothesisNum, { backgroundColor: colors.greenLight }]}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: colors.greenDark }}>{i + 1}</Text>
                </View>
                <Text style={ai.hypothesisTitle}>{h.title}</Text>
                {h.probability && (
                  <View style={[ai.pill, { backgroundColor: colors.beigeLight }]}>
                    <Text style={[ai.pillText, { color: colors.gray[600] }]}>{h.probability}</Text>
                  </View>
                )}
              </View>
              {h.description && <Text style={ai.listText}>{h.description}</Text>}
            </View>
          ))}
        </Card>
      )}

      {/* Recommendations */}
      {synthesis.generalRecommendations.length > 0 && (
        <Card>
          <Text style={s.sectionTitle}>💡 Recommandations</Text>
          {synthesis.generalRecommendations.map((rec, i) => (
            <View key={i} style={ai.listItem}>
              <View style={[ai.bullet, { backgroundColor: colors.green }]} />
              <Text style={ai.listText}>{rec}</Text>
            </View>
          ))}
        </Card>
      )}

      {/* Disclaimer + retry */}
      <View style={ai.disclaimer}>
        <Text style={ai.disclaimerText}>⚕️ Cette analyse est indicative et ne remplace pas l'avis d'un vétérinaire.</Text>
      </View>

      <Pressable onPress={onRetry} style={({ pressed }) => [ai.retryBtn, { marginHorizontal: 0 }, pressed && { opacity: 0.8 }]}>
        <Text style={ai.retryBtnText}>Relancer une analyse</Text>
      </Pressable>
    </>
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

  hero:           { marginHorizontal: 16, marginBottom: 10, backgroundColor: colors.white, borderRadius: radius['2xl'], padding: 18, flexDirection: 'row', gap: 14, borderWidth: 1, borderColor: colors.gray[200] },
  heroAvatarWrap: { position: 'relative' },
  heroAvatar:     { width: 72, height: 72, borderRadius: radius.xl, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  heroAvatarImg:  { width: 72, height: 72, borderRadius: radius.xl },
  heroEmoji:      { fontSize: 40 },
  avatarEditBadge:{ position: 'absolute', bottom: 0, right: 0, width: 20, height: 20, borderRadius: 10, backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.gray[200], alignItems: 'center', justifyContent: 'center' },
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

const ai = StyleSheet.create({
  loadingWrap:  { alignItems: 'center', paddingVertical: 40, gap: 14 },
  loadingIcon:  { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  errorIcon:    { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.gray[100], alignItems: 'center', justifyContent: 'center' },
  loadingTitle: { fontSize: 17, fontWeight: '800', color: colors.dark, textAlign: 'center' },
  loadingDesc:  { fontSize: 13, color: colors.gray[500], textAlign: 'center', lineHeight: 20, paddingHorizontal: 20 },
  dots:         { flexDirection: 'row', gap: 8 },
  dot:          { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.green },

  urgencyBanner: { borderRadius: radius['2xl'], padding: 16, flexDirection: 'row', alignItems: 'center' },
  urgencyLabel:  { fontSize: 11, fontWeight: '600', opacity: 0.7 },
  urgencyValue:  { fontSize: 20, fontWeight: '800', marginTop: 2 },
  urgencyDot:    { width: 14, height: 14, borderRadius: 7 },

  summaryText:   { fontSize: 14, color: colors.gray[600], lineHeight: 22, marginTop: 10 },

  listItem:  { flexDirection: 'row', gap: 10, marginTop: 10, alignItems: 'flex-start' },
  bullet:    { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.orange, marginTop: 7, flexShrink: 0 },
  listText:  { flex: 1, fontSize: 13, color: colors.gray[600], lineHeight: 20 },

  hypothesisItem:   { paddingVertical: 10 },
  hypothesisBorder: { borderBottomWidth: 1, borderBottomColor: colors.gray[100] },
  hypothesisNum:    { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  hypothesisTitle:  { flex: 1, fontSize: 13, fontWeight: '700', color: colors.dark },
  pill:             { paddingHorizontal: 7, paddingVertical: 2, borderRadius: radius.full },
  pillText:         { fontSize: 10, fontWeight: '700' },

  disclaimer:     { backgroundColor: colors.beigeLight, borderRadius: radius.xl, padding: 14 },
  disclaimerText: { fontSize: 11, color: colors.gray[500], lineHeight: 18, textAlign: 'center' },

  retryBtn:     { backgroundColor: colors.dark, borderRadius: radius['2xl'], paddingVertical: 13, alignItems: 'center' },
  retryBtnText: { color: colors.white, fontWeight: '700', fontSize: 14 },
})
