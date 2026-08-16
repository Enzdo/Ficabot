import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Alert,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Button } from '@/components/ui/Button'
import { useTrainingStore, type TrainingAxis } from '@/stores/training'
import { colors, radius, shadow } from '@/constants/theme'

/**
 * Une étape du parcours : soit une question de contexte, soit une question
 * notée. Les deux partagent la même présentation, seul le suivi diffère —
 * les réponses ne partent pas dans le même dictionnaire.
 */
type Step =
  | { kind: 'context'; id: string; text: string; help?: string; options: { value: string; label: string }[] }
  | {
      kind: 'scored'
      id: string
      axis: TrainingAxis
      text: string
      help?: string
      options: { value: string; label: string }[]
    }

export default function TrainingQuestionnaireScreen() {
  const { petId, petName } = useLocalSearchParams<{ petId: string; petName?: string }>()

  const { questionnaire, loading, submitting, error, fetchQuestionnaire, submit, clearError } =
    useTrainingStore()

  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [context, setContext] = useState<Record<string, string>>({})

  const progress = useRef(new Animated.Value(0)).current
  // Un `setTimeout` d'auto-avance laissé en vol après un retour arrière ferait
  // sauter une question sans que l'utilisateur comprenne pourquoi.
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    fetchQuestionnaire()
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current)
    }
  }, [fetchQuestionnaire])

  const steps: Step[] = useMemo(() => {
    if (!questionnaire) return []
    return [
      ...questionnaire.contextQuestions.map(
        (q): Step => ({ kind: 'context', id: q.id, text: q.text, help: q.help, options: q.options })
      ),
      ...questionnaire.questions.map(
        (q): Step => ({
          kind: 'scored',
          id: q.id,
          axis: q.axis,
          text: q.text,
          help: q.help,
          options: q.options.map((o) => ({ value: o.value, label: o.label })),
        })
      ),
    ]
  }, [questionnaire])

  const axisInfo = useMemo(() => {
    const map = new Map<TrainingAxis, { label: string; emoji: string }>()
    for (const a of questionnaire?.axes ?? []) map.set(a.key, { label: a.label, emoji: a.emoji })
    return map
  }, [questionnaire])

  const total = steps.length
  const step = steps[index]

  useEffect(() => {
    if (!total) return
    Animated.timing(progress, {
      toValue: (index + 1) / total,
      duration: 240,
      useNativeDriver: false,
    }).start()
  }, [index, total, progress])

  useEffect(() => {
    if (error) {
      Alert.alert('Bilan', error, [{ text: 'OK', onPress: clearError }])
    }
  }, [error, clearError])

  const selected = step ? (step.kind === 'context' ? context[step.id] : answers[step.id]) : undefined

  function goBack() {
    if (advanceTimer.current) clearTimeout(advanceTimer.current)
    if (index === 0) {
      router.back()
      return
    }
    Haptics.selectionAsync()
    setIndex((i) => i - 1)
  }

  function choose(value: string) {
    if (!step) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

    if (step.kind === 'context') setContext((c) => ({ ...c, [step.id]: value }))
    else setAnswers((a) => ({ ...a, [step.id]: value }))

    if (advanceTimer.current) clearTimeout(advanceTimer.current)
    if (index < total - 1) {
      // Court délai : l'utilisateur voit sa réponse cochée avant de passer.
      advanceTimer.current = setTimeout(() => setIndex((i) => Math.min(i + 1, total - 1)), 180)
    }
  }

  async function handleSubmit() {
    const missing = steps.filter((s) =>
      s.kind === 'context' ? !context[s.id] : !answers[s.id]
    )
    if (missing.length > 0) {
      // Renvoyer sur la première question oubliée vaut mieux qu'un message qui
      // laisse chercher laquelle.
      const firstMissing = steps.findIndex((s) => s.id === missing[0].id)
      setIndex(firstMissing)
      Alert.alert(
        'Bilan incomplet',
        `Il reste ${missing.length} question${missing.length > 1 ? 's' : ''} sans réponse.`
      )
      return
    }

    const result = await submit(petId, answers, context)
    if (result) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      router.replace({ pathname: '/training/result/[id]', params: { id: String(result.id) } })
    }
  }

  if (loading || !questionnaire) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <LoadingSpinner fullScreen />
      </SafeAreaView>
    )
  }

  if (!step) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <View style={s.centered}>
          <Text style={s.emptyTitle}>Questionnaire indisponible</Text>
          <Text style={s.emptyDesc}>Réessayez dans un instant.</Text>
          <Button title="Retour" variant="secondary" onPress={() => router.back()} style={{ marginTop: 20 }} />
        </View>
      </SafeAreaView>
    )
  }

  const isLast = index === total - 1
  const section =
    step.kind === 'context'
      ? { emoji: '👤', label: 'Votre situation' }
      : (axisInfo.get(step.axis) ?? { emoji: '🎓', label: 'Éducation' })

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <Pressable onPress={goBack} style={s.backBtn} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={colors.gray[700]} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle} numberOfLines={1}>
            Bilan d'éducation{petName ? ` · ${petName}` : ''}
          </Text>
          <Text style={s.headerCount}>
            Question {index + 1} sur {total}
          </Text>
        </View>
        <Pressable
          onPress={() =>
            Alert.alert(
              'Quitter le bilan ?',
              'Vos réponses ne seront pas enregistrées.',
              [
                { text: 'Continuer', style: 'cancel' },
                { text: 'Quitter', style: 'destructive', onPress: () => router.back() },
              ]
            )
          }
          style={s.closeBtn}
          hitSlop={8}
        >
          <Ionicons name="close" size={22} color={colors.gray[500]} />
        </Pressable>
      </View>

      <View style={s.progressTrack}>
        <Animated.View
          style={[
            s.progressFill,
            { width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
          ]}
        />
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.sectionChip}>
          <Text style={s.sectionChipText}>
            {section.emoji} {section.label}
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
                style={({ pressed }) => [
                  s.option,
                  active && s.optionActive,
                  pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
                ]}
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
            title={submitting ? 'Calcul en cours…' : 'Voir mes résultats'}
            onPress={handleSubmit}
            loading={submitting}
            disabled={!selected}
            style={{ marginTop: 24 }}
          />
        )}

        {!isLast && selected && (
          <Pressable onPress={() => setIndex((i) => Math.min(i + 1, total - 1))} style={s.nextLink}>
            <Text style={s.nextLinkText}>Question suivante</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.green} />
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.beigePale },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: colors.dark },
  emptyDesc: { fontSize: 14, color: colors.gray[600], marginTop: 6, textAlign: 'center' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.sm,
  },
  closeBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 15, fontWeight: '700', color: colors.dark },
  headerCount: { fontSize: 12, color: colors.gray[500], marginTop: 1 },

  progressTrack: {
    height: 5,
    backgroundColor: colors.gray[200],
    borderRadius: radius.full,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: colors.green, borderRadius: radius.full },

  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 48 },

  sectionChip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.greenLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    marginTop: 12,
  },
  sectionChipText: { fontSize: 12, fontWeight: '700', color: colors.greenDark },

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
  optionActive: { borderColor: colors.green, backgroundColor: colors.greenLight },
  radio: {
    width: 22,
    height: 22,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: colors.green, backgroundColor: colors.green },
  optionLabel: { flex: 1, fontSize: 14.5, color: colors.gray[800], lineHeight: 20 },
  optionLabelActive: { color: colors.dark, fontWeight: '600' },

  nextLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 24,
    paddingVertical: 12,
  },
  nextLinkText: { fontSize: 14, fontWeight: '700', color: colors.green },
})
