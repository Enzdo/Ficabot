import { useEffect, useRef, useState } from 'react'
import { Alert, Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ScoreRing, scoreColor } from '@/components/ui/ScoreRing'
import { PlanGenerationOverlay } from '@/components/ui/PlanGenerationOverlay'
import { useTrainingStore, type TrainingAxis } from '@/stores/training'
import { useAuthStore } from '@/stores/auth'
import { colors, radius, shadow } from '@/constants/theme'
import { PAYWALL_VISIBLE } from '@/constants/features'

const AXIS_META: Record<TrainingAxis, { label: string; emoji: string }> = {
  obedience: { label: 'Obéissance de base', emoji: '🎓' },
  recall: { label: 'Rappel', emoji: '📣' },
  leash: { label: 'Marche en laisse', emoji: '🦮' },
  social: { label: 'Sociabilité', emoji: '🐕‍🦺' },
  calm: { label: 'Calme & solitude', emoji: '🧘' },
  daily: { label: 'Vie quotidienne', emoji: '🏠' },
}

const AXIS_ORDER: TrainingAxis[] = ['obedience', 'recall', 'leash', 'social', 'calm', 'daily']

/** Barre qui se remplit à l'affichage, à la couleur de sa note. */
function AxisBar({ score, delay }: { score: number; delay: number }) {
  const grow = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(grow, {
      toValue: 1,
      duration: 900,
      delay,
      easing: Easing.out(Easing.cubic),
      // La largeur n'est pas animable par le driver natif.
      useNativeDriver: false,
    }).start()
  }, [grow, delay])

  return (
    <View style={s.barTrack}>
      <Animated.View
        style={[
          s.barFill,
          {
            backgroundColor: scoreColor(score),
            width: grow.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', `${Math.max(score, 2)}%`],
            }),
          },
        ]}
      />
    </View>
  )
}

export default function TrainingResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { current, loading, generatingPlan, error, premiumRequired, fetchAssessment, generatePlan, clearError } =
    useTrainingStore()

  const isPremium = useAuthStore((s) => !!s.user?.isPremium)
  // Paywall masqué en phase de test : le plan est présenté comme ouvert.
  const planUnlocked = !PAYWALL_VISIBLE || isPremium

  const [openWeek, setOpenWeek] = useState<number | null>(1)
  const [overlay, setOverlay] = useState<null | 'loading' | 'done' | 'error'>(null)

  const scrollRef = useRef<ScrollView>(null)
  // Position de la section « plan » dans le scroll, pour y amener l'utilisateur
  // après la révélation plutôt que de le laisser chercher.
  const planOffset = useRef(0)

  useEffect(() => {
    // Le bilan tout juste soumis est déjà en mémoire ; on ne recharge que si on
    // arrive sur l'écran par un autre chemin (historique, lien direct).
    if (!current || String(current.id) !== String(id)) fetchAssessment(id)
  }, [id, current, fetchAssessment])

  useEffect(() => {
    // Pendant la génération, l'erreur est déjà portée par l'overlay : une
    // alerte par-dessus ferait doublon.
    if (error && !overlay) Alert.alert("Plan d'éducation", error, [{ text: 'OK', onPress: clearError }])
  }, [error, overlay, clearError])

  useEffect(() => {
    if (premiumRequired) {
      clearError()
      setOverlay(null)
      router.push({ pathname: '/paywall', params: { feature: 'training' } })
    }
  }, [premiumRequired, clearError])

  if (loading || !current) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <LoadingSpinner fullScreen />
      </SafeAreaView>
    )
  }

  const plan = current.plan

  async function handleGeneratePlan() {
    if (!planUnlocked) {
      router.push({ pathname: '/paywall', params: { feature: 'training' } })
      return
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setOverlay('loading')
    const ok = await generatePlan(id)
    setOverlay(ok ? 'done' : 'error')
  }

  function revealPlan() {
    setOverlay(null)
    // Un cran au-dessus de la section pour que le titre reste visible.
    scrollRef.current?.scrollTo({ y: Math.max(0, planOffset.current - 12), animated: true })
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <Pressable
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace('/(tabs)/pets')
          }
          style={s.backBtn}
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={22} color={colors.gray[700]} />
        </Pressable>
        <Text style={s.headerTitle} numberOfLines={1}>
          Bilan d'éducation{current.petName ? ` · ${current.petName}` : ''}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        ref={scrollRef}
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Score global ────────────────────────────────────────────────── */}
        <LinearGradient
          colors={['#FFFFFF', colors.beigeLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[s.hero, shadow.md]}
        >
          <ScoreRing score={current.overallScore} size={132} stroke={10} />
          <Text style={s.levelLabel}>{current.levelLabel}</Text>
          <Text style={s.levelMessage}>{current.levelMessage}</Text>
        </LinearGradient>

        {/* ── Notes par domaine ───────────────────────────────────────────── */}
        <Text style={s.sectionTitle}>Vos notes par domaine</Text>
        <Card style={{ gap: 16 }}>
          {AXIS_ORDER.map((axis, i) => {
            const score = current.scores?.[axis] ?? 0
            const meta = AXIS_META[axis]
            return (
              <View key={axis}>
                <View style={s.axisRow}>
                  <Text style={s.axisLabel}>
                    {meta.emoji} {meta.label}
                  </Text>
                  <Text style={[s.axisScore, { color: scoreColor(score) }]}>{score}</Text>
                </View>
                {/* Le décalage fait descendre le remplissage barre par barre. */}
                <AxisBar score={score} delay={200 + i * 90} />
              </View>
            )
          })}
        </Card>

        <View style={s.tagsRow}>
          <View style={[s.tag, { backgroundColor: colors.greenLight }]}>
            <Text style={[s.tagText, { color: colors.greenDark }]}>
              💪 Point fort : {AXIS_META[current.strongest]?.label ?? '—'}
            </Text>
          </View>
          {current.weakest?.slice(0, 2).map((axis) => (
            <View key={axis} style={[s.tag, { backgroundColor: colors.orangeLight }]}>
              <Text style={[s.tagText, { color: colors.orange }]}>
                🎯 À travailler : {AXIS_META[axis]?.label ?? '—'}
              </Text>
            </View>
          ))}
        </View>

        {/* ── Plan ────────────────────────────────────────────────────────── */}
        {!plan ? (
          <View style={[s.planCta, shadow.sm]}>
            <Text style={s.planCtaEmoji}>{planUnlocked ? '📋' : '🔒'}</Text>
            <Text style={s.planCtaTitle}>
              Votre plan d'éducation sur 4 semaines
            </Text>
            <Text style={s.planCtaDesc}>
              Un programme construit à partir de vos notes, de la race
              {current.petBreed ? ` (${current.petBreed})` : ''} et de votre temps disponible :
              exercices détaillés, objectifs par semaine et erreurs à éviter.
            </Text>
            <Button
              title={
                generatingPlan
                  ? 'Génération en cours…'
                  : planUnlocked
                    ? 'Générer mon plan'
                    : 'Débloquer avec Premium'
              }
              onPress={handleGeneratePlan}
              loading={generatingPlan}
              style={{ marginTop: 16, alignSelf: 'stretch' }}
            />
            {generatingPlan && (
              <Text style={s.planCtaHint}>Comptez une vingtaine de secondes.</Text>
            )}
          </View>
        ) : (
          <>
            <Text
              style={s.sectionTitle}
              onLayout={(e) => { planOffset.current = e.nativeEvent.layout.y }}
            >
              Votre plan sur {plan.weeks.length} semaines
            </Text>

            <Card style={{ gap: 12 }}>
              <Text style={s.planSummary}>{plan.summary}</Text>
              {!!plan.breedInsight && (
                <View style={s.breedBox}>
                  <Text style={s.breedTitle}>
                    🧬 {current.petBreed ? current.petBreed : 'Spécificités de race'}
                  </Text>
                  <Text style={s.breedText}>{plan.breedInsight}</Text>
                </View>
              )}
            </Card>

            {plan.priorities?.length > 0 && (
              <>
                <Text style={s.sectionTitle}>Priorités</Text>
                <Card style={{ gap: 14 }}>
                  {plan.priorities.map((p, i) => (
                    <View key={`${p.axis}-${i}`} style={s.priorityRow}>
                      <View style={s.priorityRank}>
                        <Text style={s.priorityRankText}>{i + 1}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.priorityTitle}>
                          {AXIS_META[p.axis]?.emoji} {p.title}
                        </Text>
                        {!!p.why && <Text style={s.priorityWhy}>{p.why}</Text>}
                      </View>
                    </View>
                  ))}
                </Card>
              </>
            )}

            {plan.weeks.map((week) => {
              const open = openWeek === week.week
              return (
                <View key={week.week} style={[s.weekCard, shadow.sm]}>
                  <Pressable
                    onPress={() => {
                      Haptics.selectionAsync()
                      setOpenWeek(open ? null : week.week)
                    }}
                    style={s.weekHeader}
                  >
                    <View style={s.weekBadge}>
                      <Text style={s.weekBadgeText}>S{week.week}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.weekTheme}>{week.theme}</Text>
                      {!!week.sessions && <Text style={s.weekSessions}>{week.sessions}</Text>}
                    </View>
                    <Ionicons
                      name={open ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color={colors.gray[400]}
                    />
                  </Pressable>

                  {open && (
                    <View style={s.weekBody}>
                      {!!week.goal && (
                        <View style={s.goalBox}>
                          <Text style={s.goalLabel}>Objectif</Text>
                          <Text style={s.goalText}>{week.goal}</Text>
                        </View>
                      )}

                      {week.exercises.map((ex, i) => (
                        <View key={`${week.week}-${i}`} style={s.exercise}>
                          <Text style={s.exerciseTitle}>
                            {AXIS_META[ex.axis]?.emoji ?? '•'} {ex.title}
                          </Text>
                          {!!ex.duration && <Text style={s.exerciseDuration}>⏱ {ex.duration}</Text>}
                          {ex.steps.map((stepText, j) => (
                            <View key={j} style={s.stepRow}>
                              <Text style={s.stepNum}>{j + 1}</Text>
                              <Text style={s.stepText}>{stepText}</Text>
                            </View>
                          ))}
                          {!!ex.tip && (
                            <View style={s.tipBox}>
                              <Text style={s.tipText}>💡 {ex.tip}</Text>
                            </View>
                          )}
                        </View>
                      ))}

                      {!!week.successCriteria && (
                        <View style={s.successBox}>
                          <Text style={s.successLabel}>✅ Passez à la suite quand</Text>
                          <Text style={s.successText}>{week.successCriteria}</Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              )
            })}

            {plan.dailyRoutine?.length > 0 && (
              <>
                <Text style={s.sectionTitle}>Routine quotidienne</Text>
                <Card style={{ gap: 10 }}>
                  {plan.dailyRoutine.map((item, i) => (
                    <View key={i} style={s.bulletRow}>
                      <Text style={s.bulletDot}>•</Text>
                      <Text style={s.bulletText}>{item}</Text>
                    </View>
                  ))}
                </Card>
              </>
            )}

            {plan.mistakesToAvoid?.length > 0 && (
              <>
                <Text style={s.sectionTitle}>Erreurs à éviter</Text>
                <Card style={{ gap: 10, borderColor: colors.orange + '40' }}>
                  {plan.mistakesToAvoid.map((item, i) => (
                    <View key={i} style={s.bulletRow}>
                      <Text style={[s.bulletDot, { color: colors.orange }]}>⚠️</Text>
                      <Text style={s.bulletText}>{item}</Text>
                    </View>
                  ))}
                </Card>
              </>
            )}

            {!!plan.whenToSeePro && (
              <View style={s.proBox}>
                <Text style={s.proTitle}>👨‍🏫 Quand consulter un éducateur</Text>
                <Text style={s.proText}>{plan.whenToSeePro}</Text>
              </View>
            )}

            {!current.planFromAi && (
              <Text style={s.fallbackNote}>
                Ce plan a été construit à partir de notre bibliothèque d'exercices : la
                personnalisation par race n'a pas pu être appliquée cette fois.
              </Text>
            )}
          </>
        )}

        <Text style={s.disclaimer}>
          Ce bilan est un outil d'accompagnement, pas un diagnostic comportemental. En cas
          d'agression, de morsure ou de détresse marquée, consultez un éducateur canin
          comportementaliste ou votre vétérinaire.
        </Text>

        {/* Seule porte de sortie pour tout reprendre à zéro : la fiche animal
            renvoie désormais ici au lieu de reproposer le questionnaire. Un
            nouveau bilan efface le suivi en cours, d'où la confirmation. */}
        <Pressable
          onPress={() =>
            Alert.alert(
              'Refaire le bilan ?',
              plan
                ? 'Le plan actuel et la progression du suivi seront remplacés par un nouveau bilan.'
                : 'Vous allez répondre à nouveau aux 36 questions.',
              [
                { text: 'Annuler', style: 'cancel' },
                {
                  text: 'Recommencer',
                  style: 'destructive',
                  onPress: () =>
                    router.replace({
                      pathname: '/training/[petId]',
                      params: { petId: String(current.petId), petName: current.petName ?? '' },
                    }),
                },
              ]
            )
          }
          style={s.redoLink}
        >
          <Ionicons name="refresh" size={16} color={colors.gray[600]} />
          <Text style={s.redoText}>Refaire le bilan</Text>
        </Pressable>
      </ScrollView>

      <PlanGenerationOverlay
        visible={overlay !== null}
        phase={overlay ?? 'loading'}
        petName={current.petName}
        breed={current.petBreed}
        weekCount={plan?.weeks.length ?? 4}
        summary={plan?.summary}
        priorities={plan?.priorities.map((p) => p.title) ?? []}
        errorMessage={error}
        onReveal={revealPlan}
        onRetry={() => { clearError(); handleGeneratePlan() }}
        onDismiss={() => { clearError(); setOverlay(null) }}
      />
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.beigePale },

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
  headerTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: colors.dark, textAlign: 'center' },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 56, gap: 14 },

  hero: {
    alignItems: 'center',
    borderRadius: radius['3xl'],
    paddingVertical: 28,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  levelLabel: { fontSize: 20, fontWeight: '800', color: colors.dark, marginTop: 16 },
  levelMessage: {
    fontSize: 14,
    color: colors.gray[600],
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },

  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.dark, marginTop: 10 },

  axisRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  axisLabel: { fontSize: 14, color: colors.gray[800], fontWeight: '600', flex: 1 },
  axisScore: { fontSize: 15, fontWeight: '800' },
  barTrack: { height: 8, backgroundColor: colors.gray[100], borderRadius: radius.full, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: radius.full },

  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.full },
  tagText: { fontSize: 12.5, fontWeight: '700' },

  planCta: {
    backgroundColor: colors.white,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: colors.gray[200],
    padding: 20,
    alignItems: 'center',
    marginTop: 4,
  },
  planCtaEmoji: { fontSize: 32 },
  planCtaTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.dark,
    marginTop: 10,
    textAlign: 'center',
  },
  planCtaDesc: {
    fontSize: 13.5,
    color: colors.gray[600],
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  planCtaHint: { fontSize: 12, color: colors.gray[500], marginTop: 10 },

  planSummary: { fontSize: 14.5, color: colors.gray[800], lineHeight: 22 },
  breedBox: {
    backgroundColor: colors.blueLight,
    borderRadius: radius.md,
    padding: 12,
  },
  breedTitle: { fontSize: 13, fontWeight: '800', color: colors.blue },
  breedText: { fontSize: 13.5, color: colors.gray[700], marginTop: 4, lineHeight: 20 },

  priorityRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  priorityRank: {
    width: 26,
    height: 26,
    borderRadius: radius.full,
    backgroundColor: colors.greenLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityRankText: { fontSize: 13, fontWeight: '800', color: colors.greenDark },
  priorityTitle: { fontSize: 14.5, fontWeight: '700', color: colors.dark },
  priorityWhy: { fontSize: 13, color: colors.gray[600], marginTop: 3, lineHeight: 19 },

  weekCard: {
    backgroundColor: colors.white,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: colors.gray[200],
    overflow: 'hidden',
  },
  weekHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  weekBadge: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.greenLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekBadgeText: { fontSize: 14, fontWeight: '900', color: colors.greenDark },
  weekTheme: { fontSize: 14.5, fontWeight: '700', color: colors.dark },
  weekSessions: { fontSize: 12, color: colors.gray[500], marginTop: 2 },
  weekBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 14,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    paddingTop: 14,
  },

  goalBox: { backgroundColor: colors.beigeLight, borderRadius: radius.md, padding: 12 },
  goalLabel: { fontSize: 11, fontWeight: '800', color: colors.gray[600], textTransform: 'uppercase' },
  goalText: { fontSize: 13.5, color: colors.gray[800], marginTop: 4, lineHeight: 20 },

  exercise: {
    borderLeftWidth: 3,
    borderLeftColor: colors.green,
    paddingLeft: 12,
    gap: 6,
  },
  exerciseTitle: { fontSize: 14.5, fontWeight: '700', color: colors.dark },
  exerciseDuration: { fontSize: 12.5, color: colors.gray[500] },
  stepRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  stepNum: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.greenDark,
    backgroundColor: colors.greenLight,
    width: 18,
    height: 18,
    borderRadius: radius.full,
    textAlign: 'center',
    lineHeight: 18,
    overflow: 'hidden',
  },
  stepText: { flex: 1, fontSize: 13.5, color: colors.gray[700], lineHeight: 20 },
  tipBox: { backgroundColor: colors.greenLight, borderRadius: radius.sm, padding: 10, marginTop: 2 },
  tipText: { fontSize: 12.5, color: colors.greenDark, lineHeight: 18 },

  successBox: { backgroundColor: colors.gray[100], borderRadius: radius.md, padding: 12 },
  successLabel: { fontSize: 12, fontWeight: '800', color: colors.gray[700] },
  successText: { fontSize: 13, color: colors.gray[700], marginTop: 4, lineHeight: 19 },

  bulletRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  bulletDot: { fontSize: 14, color: colors.green, lineHeight: 20 },
  bulletText: { flex: 1, fontSize: 13.5, color: colors.gray[700], lineHeight: 20 },

  proBox: {
    backgroundColor: colors.redLight,
    borderRadius: radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.red + '30',
  },
  proTitle: { fontSize: 13.5, fontWeight: '800', color: colors.red },
  proText: { fontSize: 13, color: colors.gray[700], marginTop: 6, lineHeight: 20 },

  fallbackNote: {
    fontSize: 12,
    color: colors.gray[500],
    fontStyle: 'italic',
    lineHeight: 18,
  },

  disclaimer: {
    fontSize: 11.5,
    color: colors.gray[500],
    lineHeight: 17,
    marginTop: 8,
    textAlign: 'center',
  },

  redoLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  redoText: { fontSize: 13.5, fontWeight: '600', color: colors.gray[600] },
})
