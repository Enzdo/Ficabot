import { useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { api } from '@/services/api'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { scoreColor } from '@/components/ui/ScoreRing'
import { useTrainingStore, type TrainingAxis } from '@/stores/training'
import { colors, radius, shadow } from '@/constants/theme'

interface CheckinPayload {
  week: number
  cycle: number
  theme: string
  successCriteria: string
  axes: TrainingAxis[]
  questions: {
    id: string
    axis: TrainingAxis
    text: string
    help?: string
    options: { value: string; label: string }[]
  }[]
  adherenceQuestions: {
    id: string
    text: string
    help?: string
    options: { value: string; label: string }[]
  }[]
  petName: string | null
  currentScores: Record<TrainingAxis, number>
  activeDays: number
  totalChecks: number
  weekNotes: { day: string; week: number; exercise: string; done: boolean; note: string }[]
  due: boolean
  daysUntilCheckin: number
}

interface CheckinResult {
  finished: boolean
  week: number
  nextWeek: number | null
  scores: Record<TrainingAxis, number>
  previousScores: Record<TrainingAxis, number>
  deltas: Record<string, number>
  overallScore: number
  level: string
  axesUpdated: TrainingAxis[]
}

const AXIS_LABEL: Record<TrainingAxis, string> = {
  obedience: 'Obéissance de base',
  recall: 'Rappel',
  leash: 'Marche en laisse',
  social: 'Sociabilité',
  calm: 'Calme & solitude',
  daily: 'Vie quotidienne',
}

export default function TrainingCheckinScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const fetchToday = useTrainingStore((s) => s.fetchToday)

  const [payload, setPayload] = useState<CheckinPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [adherence, setAdherence] = useState<Record<string, string>>({})
  const [result, setResult] = useState<CheckinResult | null>(null)
  const [index, setIndex] = useState(0)

  const progress = useRef(new Animated.Value(0)).current
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let alive = true
    api.get<CheckinPayload>(`/training/programs/${id}/checkin`).then((res) => {
      if (!alive) return
      if (res.success && res.data) setPayload(res.data)
      else Alert.alert('Bilan', res.message ?? 'Bilan indisponible', [
        { text: 'OK', onPress: () => router.back() },
      ])
      setLoading(false)
    })
    return () => {
      alive = false
      if (advanceTimer.current) clearTimeout(advanceTimer.current)
    }
  }, [id])

  // Les questions d'assiduité ferment le parcours : on demande d'abord ce qui
  // est observable chez le chien, ensuite ce qui a réellement été fait.
  const steps = useMemo(() => {
    if (!payload) return []
    return [
      ...payload.questions.map((q) => ({ kind: 'scored' as const, ...q })),
      ...payload.adherenceQuestions.map((q) => ({ kind: 'adherence' as const, axis: null, ...q })),
    ]
  }, [payload])

  const total = steps.length
  const step = steps[index]
  const selected = step
    ? step.kind === 'scored'
      ? answers[step.id]
      : adherence[step.id]
    : undefined

  useEffect(() => {
    if (!total) return
    Animated.timing(progress, {
      toValue: (index + 1) / total,
      duration: 220,
      useNativeDriver: false,
    }).start()
  }, [index, total, progress])

  function choose(value: string) {
    if (!step) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})

    if (step.kind === 'scored') setAnswers((a) => ({ ...a, [step.id]: value }))
    else setAdherence((a) => ({ ...a, [step.id]: value }))

    if (advanceTimer.current) clearTimeout(advanceTimer.current)
    if (index < total - 1) {
      advanceTimer.current = setTimeout(() => setIndex((i) => Math.min(i + 1, total - 1)), 180)
    }
  }

  async function submit() {
    const missing = steps.filter((s2) =>
      s2.kind === 'scored' ? !answers[s2.id] : !adherence[s2.id]
    )
    if (missing.length > 0) {
      setIndex(steps.findIndex((s2) => s2.id === missing[0].id))
      Alert.alert('Bilan incomplet', `Il reste ${missing.length} question(s) sans réponse.`)
      return
    }

    setSubmitting(true)
    const res = await api.post<CheckinResult>(`/training/programs/${id}/checkin`, {
      answers,
      adherence,
    })
    setSubmitting(false)

    if (!res.success || !res.data) {
      Alert.alert('Bilan', res.message ?? "Le bilan n'a pas pu être enregistré")
      return
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {})
    setResult(res.data)
    await fetchToday()
  }

  if (loading || !payload) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <LoadingSpinner fullScreen />
      </SafeAreaView>
    )
  }

  // ── Écran de résultat ────────────────────────────────────────────────────
  if (result) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <ScrollView contentContainerStyle={s.resultContent} showsVerticalScrollIndicator={false}>
          <Text style={s.resultEmoji}>{result.finished ? '🏆' : '📈'}</Text>
          <Text style={s.resultTitle}>
            {result.finished ? 'Cycle terminé !' : `Semaine ${result.week} validée`}
          </Text>
          <Text style={s.resultSub}>
            {result.finished
              ? `Les ${payload.week} semaines sont bouclées. Vous pouvez lancer un nouveau cycle adapté à vos notes actuelles.`
              : `La semaine ${result.nextWeek} vient de s'ouvrir.`}
          </Text>

          <View style={[s.resultCard, shadow.sm]}>
            <Text style={s.resultCardTitle}>Vos notes mises à jour</Text>
            {result.axesUpdated.map((axis) => {
              const delta = result.deltas[axis] ?? 0
              const now = result.scores[axis]
              return (
                <View key={axis} style={s.deltaRow}>
                  <Text style={s.deltaLabel}>{AXIS_LABEL[axis]}</Text>
                  <View style={s.deltaRight}>
                    <Text style={s.deltaBefore}>{result.previousScores[axis]}</Text>
                    <Ionicons name="arrow-forward" size={13} color={colors.gray[400]} />
                    <Text style={[s.deltaNow, { color: scoreColor(now) }]}>{now}</Text>
                    <View
                      style={[
                        s.deltaChip,
                        {
                          backgroundColor:
                            delta > 0 ? colors.greenLight : delta < 0 ? colors.redLight : colors.gray[100],
                        },
                      ]}
                    >
                      <Text
                        style={[
                          s.deltaChipText,
                          { color: delta > 0 ? colors.greenDark : delta < 0 ? colors.red : colors.gray[600] },
                        ]}
                      >
                        {delta > 0 ? `+${delta}` : delta < 0 ? `${delta}` : '='}
                      </Text>
                    </View>
                  </View>
                </View>
              )
            })}
            <View style={s.overallRow}>
              <Text style={s.overallLabel}>Note globale</Text>
              <Text style={[s.overallValue, { color: scoreColor(result.overallScore) }]}>
                {result.overallScore}/100
              </Text>
            </View>
          </View>

          <Button
            title="Voir ma progression"
            onPress={() => router.replace({ pathname: '/training/program/[id]', params: { id: String(id) } })}
            style={{ alignSelf: 'stretch', marginTop: 24 }}
          />
          <Pressable onPress={() => router.replace('/(tabs)')} style={s.homeLink}>
            <Text style={s.homeLinkText}>Retour à l'accueil</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    )
  }

  // ── Questionnaire ────────────────────────────────────────────────────────
  const isLast = index === total - 1

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <Pressable
          onPress={() => (index === 0 ? router.back() : setIndex((i) => i - 1))}
          style={s.backBtn}
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={22} color={colors.gray[700]} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle} numberOfLines={1}>
            Bilan semaine {payload.week}
            {payload.petName ? ` · ${payload.petName}` : ''}
          </Text>
          <Text style={s.headerCount}>
            Question {index + 1} sur {total}
          </Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <View style={s.progressTrack}>
        <Animated.View
          style={[
            s.progressFill,
            { width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
          ]}
        />
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Rappel de la semaine écoulée : on ne note pas de mémoire ce qu'on a
            écrit jour après jour. Affiché sur la première question seulement,
            pour ne pas encombrer les suivantes. */}
        {index === 0 && (
          <View style={s.recapCard}>
            <Text style={s.recapTitle}>Votre semaine</Text>
            <Text style={s.recapStat}>
              {payload.totalChecks} exercice{payload.totalChecks > 1 ? 's' : ''} coché
              {payload.totalChecks > 1 ? 's' : ''} sur {payload.activeDays} jour
              {payload.activeDays > 1 ? 's' : ''}.
            </Text>
            {payload.weekNotes?.length > 0 && (
              <View style={s.recapNotes}>
                {payload.weekNotes.slice(-4).map((n, i) => (
                  <View key={`${n.day}-${i}`} style={s.recapNote}>
                    <Text style={s.recapNoteHead}>
                      {n.day.slice(8, 10)}/{n.day.slice(5, 7)} · {n.exercise}
                    </Text>
                    <Text style={s.recapNoteText}>{n.note}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        <View style={s.chip}>
          <Text style={s.chipText}>
            {step.kind === 'scored'
              ? `${AXIS_LABEL[step.axis as TrainingAxis]} · note actuelle ${payload.currentScores[step.axis as TrainingAxis]}`
              : '👤 Votre semaine'}
          </Text>
        </View>

        <Text style={s.question}>{step.text}</Text>
        {step.help && <Text style={s.help}>{step.help}</Text>}

        <View style={s.options}>
          {step.options.map((option) => {
            const active = selected === option.value
            return (
              <Pressable
                key={option.value}
                onPress={() => choose(option.value)}
                style={({ pressed }) => [s.option, active && s.optionActive, pressed && { opacity: 0.9 }]}
              >
                <View style={[s.radio, active && s.radioActive]}>
                  {active && <Ionicons name="checkmark" size={14} color={colors.white} />}
                </View>
                <Text style={[s.optionLabel, active && s.optionLabelActive]}>{option.label}</Text>
              </Pressable>
            )
          })}
        </View>

        {isLast && (
          <Button
            title={submitting ? 'Enregistrement…' : 'Valider ma semaine'}
            onPress={submit}
            loading={submitting}
            disabled={!selected}
            style={{ marginTop: 24 }}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.beigePale },

  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 10 },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.sm,
  },
  headerTitle: { fontSize: 15, fontWeight: '700', color: colors.dark },
  headerCount: { fontSize: 12, color: colors.gray[500], marginTop: 1 },

  progressTrack: {
    height: 5,
    backgroundColor: colors.gray[200],
    borderRadius: radius.full,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: colors.orange, borderRadius: radius.full },

  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 48 },

  chip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.orangeLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    marginTop: 12,
  },
  chipText: { fontSize: 12, fontWeight: '700', color: colors.orange },

  question: { fontSize: 22, fontWeight: '800', color: colors.dark, marginTop: 16, lineHeight: 30 },
  help: { fontSize: 13, color: colors.gray[600], marginTop: 8, lineHeight: 19 },

  options: { gap: 10, marginTop: 24 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.gray[200],
    padding: 14,
  },
  optionActive: { borderColor: colors.orange, backgroundColor: colors.orangeLight },
  radio: {
    width: 22,
    height: 22,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: colors.orange, backgroundColor: colors.orange },
  optionLabel: { flex: 1, fontSize: 14.5, color: colors.gray[800], lineHeight: 20 },
  optionLabelActive: { color: colors.dark, fontWeight: '600' },

  recapCard: {
    backgroundColor: colors.white,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: colors.gray[200],
    padding: 14,
    marginTop: 12,
    gap: 8,
  },
  recapTitle: { fontSize: 12, fontWeight: '800', color: colors.gray[600], textTransform: 'uppercase' },
  recapStat: { fontSize: 13.5, color: colors.gray[800], lineHeight: 19 },
  recapNotes: { gap: 8, borderTopWidth: 1, borderTopColor: colors.gray[100], paddingTop: 8 },
  recapNote: { gap: 2 },
  recapNoteHead: { fontSize: 11.5, fontWeight: '700', color: colors.greenDark },
  recapNoteText: { fontSize: 12.5, color: colors.gray[700], lineHeight: 18 },

  resultContent: { padding: 24, paddingBottom: 48, alignItems: 'center' },
  resultEmoji: { fontSize: 54, marginTop: 24 },
  resultTitle: { fontSize: 24, fontWeight: '900', color: colors.dark, marginTop: 14, textAlign: 'center' },
  resultSub: {
    fontSize: 14,
    color: colors.gray[600],
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  resultCard: {
    backgroundColor: colors.white,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: colors.gray[200],
    padding: 16,
    marginTop: 24,
    alignSelf: 'stretch',
    gap: 12,
  },
  resultCardTitle: { fontSize: 13, fontWeight: '800', color: colors.gray[700], textTransform: 'uppercase' },
  deltaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  deltaLabel: { fontSize: 13.5, color: colors.gray[800], flex: 1 },
  deltaRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  deltaBefore: { fontSize: 13, color: colors.gray[400] },
  deltaNow: { fontSize: 15, fontWeight: '800' },
  deltaChip: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: radius.full, minWidth: 34, alignItems: 'center' },
  deltaChipText: { fontSize: 11.5, fontWeight: '800' },
  overallRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    paddingTop: 12,
  },
  overallLabel: { fontSize: 14, fontWeight: '700', color: colors.dark },
  overallValue: { fontSize: 18, fontWeight: '900' },
  homeLink: { paddingVertical: 14 },
  homeLinkText: { fontSize: 13.5, fontWeight: '600', color: colors.gray[600] },
})
