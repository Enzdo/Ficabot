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
import { secureStorage } from '@/services/api'
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
  // 'intro' avant de commencer, 'review' pour relire avant d'envoyer.
  const [phase, setPhase] = useState<'intro' | 'quiz' | 'review'>('intro')
  const [draftLoaded, setDraftLoaded] = useState(false)
  const [hasDraft, setHasDraft] = useState(false)

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

  // ── Brouillon ────────────────────────────────────────────────────────────
  // 36 questions ne se refont pas parce qu'un appel est arrivé au milieu.
  useEffect(() => {
    let alive = true
    secureStorage
      .getTrainingDraft(petId)
      .then((raw) => {
        if (!alive || !raw) return
        try {
          const draft = JSON.parse(raw) as {
            answers?: Record<string, string>
            context?: Record<string, string>
            index?: number
          }
          const count = Object.keys(draft.answers ?? {}).length + Object.keys(draft.context ?? {}).length
          if (count === 0) return
          setAnswers(draft.answers ?? {})
          setContext(draft.context ?? {})
          setIndex(draft.index ?? 0)
          setHasDraft(true)
        } catch {
          // Brouillon illisible : on repart à zéro plutôt que de bloquer.
        }
      })
      .finally(() => { if (alive) setDraftLoaded(true) })
    return () => { alive = false }
  }, [petId])

  // Écriture à chaque réponse. On attend d'avoir lu le brouillon existant,
  // sinon l'état vide initial l'écraserait aussitôt.
  useEffect(() => {
    if (!draftLoaded) return
    if (Object.keys(answers).length === 0 && Object.keys(context).length === 0) return
    secureStorage
      .setTrainingDraft(petId, JSON.stringify({ answers, context, index }))
      .catch(() => {})
  }, [answers, context, index, petId, draftLoaded])

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
      setPhase('intro')
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
      // Le bilan est enregistré côté serveur : le brouillon n'a plus d'objet.
      await secureStorage.clearTrainingDraft(petId).catch(() => {})
      router.replace({ pathname: '/training/result/[id]', params: { id: String(result.id) } })
    }
  }

  /** Toutes les questions répondues : condition d'accès à la relecture. */
  const answeredCount = steps.filter((st) =>
    st.kind === 'context' ? !!context[st.id] : !!answers[st.id]
  ).length

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

  // ── Intro ────────────────────────────────────────────────────────────────
  // Personne ne devrait découvrir qu'il y a 36 questions à la question 12.
  if (phase === 'intro') {
    const minutes = Math.max(5, Math.round((total * 11) / 60))
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <View style={s.header}>
          <Pressable onPress={() => router.back()} style={s.backBtn} hitSlop={8}>
            <Ionicons name="chevron-back" size={22} color={colors.gray[700]} />
          </Pressable>
          <Text style={s.headerTitle} numberOfLines={1}>Bilan d'éducation</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={s.introContent} showsVerticalScrollIndicator={false}>
          <Text style={s.introEmoji}>🎓</Text>
          <Text style={s.introTitle}>
            Où en est {petName || 'votre chien'} ?
          </Text>
          <Text style={s.introSub}>
            {total} questions, environ {minutes} minutes. Répondez d'après ce que fait
            vraiment votre chien aujourd'hui, pas d'après son meilleur jour — c'est ce qui
            rend le plan utile.
          </Text>

          <View style={s.introCard}>
            <Text style={s.introCardTitle}>Six domaines évalués</Text>
            {(questionnaire?.axes ?? []).map((a) => (
              <View key={a.key} style={s.introAxis}>
                <Text style={s.introAxisEmoji}>{a.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.introAxisLabel}>{a.label}</Text>
                  <Text style={s.introAxisDesc}>{a.description}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={s.introCard}>
            <Text style={s.introCardTitle}>Ce que vous obtenez</Text>
            <Text style={s.introBullet}>📊 Une note sur 100 par domaine, et une note globale</Text>
            <Text style={s.introBullet}>📋 Un plan de 4 semaines adapté à la race et à votre temps</Text>
            <Text style={s.introBullet}>🗓️ Des exercices du jour à cocher, suivis sur l'accueil</Text>
          </View>

          {hasDraft && (
            <View style={s.draftBox}>
              <Ionicons name="bookmark" size={16} color={colors.orange} />
              <Text style={s.draftText}>
                Bilan commencé : {answeredCount} réponse{answeredCount > 1 ? 's' : ''} sur {total}.
              </Text>
            </View>
          )}

          <Button
            title={hasDraft ? 'Reprendre où j\'en étais' : 'Commencer'}
            onPress={() => setPhase('quiz')}
            style={{ alignSelf: 'stretch', marginTop: 20 }}
          />

          {hasDraft && (
            <Pressable
              onPress={() =>
                Alert.alert('Repartir de zéro ?', 'Vos réponses en cours seront effacées.', [
                  { text: 'Annuler', style: 'cancel' },
                  {
                    text: 'Recommencer',
                    style: 'destructive',
                    onPress: () => {
                      secureStorage.clearTrainingDraft(petId).catch(() => {})
                      setAnswers({})
                      setContext({})
                      setIndex(0)
                      setHasDraft(false)
                      setPhase('quiz')
                    },
                  },
                ])
              }
              style={s.introReset}
            >
              <Text style={s.introResetText}>Repartir de zéro</Text>
            </Pressable>
          )}
        </ScrollView>
      </SafeAreaView>
    )
  }

  // ── Relecture ────────────────────────────────────────────────────────────
  if (phase === 'review') {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <View style={s.header}>
          <Pressable onPress={() => setPhase('quiz')} style={s.backBtn} hitSlop={8}>
            <Ionicons name="chevron-back" size={22} color={colors.gray[700]} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={s.headerTitle} numberOfLines={1}>Relecture</Text>
            <Text style={s.headerCount}>{answeredCount} réponses sur {total}</Text>
          </View>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={s.reviewContent} showsVerticalScrollIndicator={false}>
          <Text style={s.reviewIntro}>
            Touchez une réponse pour la corriger. Rien n'est envoyé tant que vous n'avez pas
            validé.
          </Text>

          {steps.map((st, i) => {
            const value = st.kind === 'context' ? context[st.id] : answers[st.id]
            const chosen = st.options.find((o) => o.value === value)
            return (
              <Pressable
                key={st.id}
                onPress={() => { setIndex(i); setPhase('quiz') }}
                style={({ pressed }) => [s.reviewRow, pressed && { opacity: 0.85 }]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={s.reviewQuestion} numberOfLines={2}>{st.text}</Text>
                  <Text style={[s.reviewAnswer, !chosen && s.reviewMissing]} numberOfLines={2}>
                    {chosen?.label ?? 'Sans réponse'}
                  </Text>
                </View>
                <Ionicons name="pencil" size={15} color={colors.gray[400]} />
              </Pressable>
            )
          })}

          <Button
            title={submitting ? 'Calcul en cours…' : 'Voir mes résultats'}
            onPress={handleSubmit}
            loading={submitting}
            disabled={answeredCount < total}
            style={{ marginTop: 20 }}
          />
        </ScrollView>
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
              'Vos réponses sont conservées, vous pourrez reprendre où vous en êtes.',
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
            title="Relire mes réponses"
            onPress={() => setPhase('review')}
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

  introContent: { padding: 24, paddingBottom: 56, alignItems: 'center' },
  introEmoji: { fontSize: 48, marginTop: 12 },
  introTitle: { fontSize: 25, fontWeight: '900', color: colors.dark, marginTop: 14, textAlign: 'center' },
  introSub: { fontSize: 14, color: colors.gray[600], marginTop: 10, textAlign: 'center', lineHeight: 21 },
  introCard: {
    alignSelf: 'stretch',
    backgroundColor: colors.white,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: colors.gray[200],
    padding: 16,
    marginTop: 20,
    gap: 12,
  },
  introCardTitle: { fontSize: 13, fontWeight: '800', color: colors.gray[700], textTransform: 'uppercase' },
  introAxis: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  introAxisEmoji: { fontSize: 18, width: 26, textAlign: 'center' },
  introAxisLabel: { fontSize: 14, fontWeight: '700', color: colors.dark },
  introAxisDesc: { fontSize: 12.5, color: colors.gray[600], marginTop: 2, lineHeight: 17 },
  introBullet: { fontSize: 13.5, color: colors.gray[700], lineHeight: 20 },
  draftBox: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.orangeLight,
    borderRadius: radius.lg,
    padding: 12,
    marginTop: 18,
  },
  draftText: { flex: 1, fontSize: 13, color: colors.gray[700], fontWeight: '600' },
  introReset: { paddingVertical: 14 },
  introResetText: { fontSize: 13.5, color: colors.gray[500], fontWeight: '600' },

  reviewContent: { padding: 20, paddingBottom: 56 },
  reviewIntro: { fontSize: 13, color: colors.gray[600], lineHeight: 19, marginBottom: 16 },
  reviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
    padding: 12,
    marginBottom: 8,
  },
  reviewQuestion: { fontSize: 12.5, color: colors.gray[500], lineHeight: 17 },
  reviewAnswer: { fontSize: 13.5, fontWeight: '700', color: colors.dark, marginTop: 3, lineHeight: 19 },
  reviewMissing: { color: colors.red },
})
