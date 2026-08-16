import { useEffect, useMemo, useRef, useState } from 'react'
import { Animated, Easing, Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { colors, radius, shadow } from '@/constants/theme'

/**
 * Écran d'attente pendant que le modèle rédige le plan, puis révélation.
 *
 * La barre ne dépasse pas 92 % tant que la réponse n'est pas là : une barre qui
 * atteint 100 % avant la fin donne l'impression que l'app a planté. Les étapes
 * défilent au rythme réel de l'appel (une quinzaine de secondes) et décrivent
 * ce qui se passe vraiment, race comprise, pour que l'attente soit lisible
 * plutôt que décorative.
 */

interface PlanGenerationOverlayProps {
  visible: boolean
  /** 'loading' pendant l'appel, 'done' quand le plan est arrivé, 'error' sinon. */
  phase: 'loading' | 'done' | 'error'
  petName?: string | null
  breed?: string | null
  weekCount?: number
  priorities?: string[]
  summary?: string
  errorMessage?: string | null
  onReveal: () => void
  onRetry?: () => void
  onDismiss?: () => void
}

const PAWS = ['🐾', '🦴', '🎾', '🐕', '⭐']

export function PlanGenerationOverlay({
  visible,
  phase,
  petName,
  breed,
  weekCount = 4,
  priorities = [],
  summary,
  errorMessage,
  onReveal,
  onRetry,
  onDismiss,
}: PlanGenerationOverlayProps) {
  const steps = useMemo(
    () => [
      { icon: '📖', text: 'Lecture de vos 36 réponses' },
      { icon: '📊', text: 'Calcul des notes par domaine' },
      { icon: '🎯', text: 'Repérage des deux points faibles' },
      {
        icon: '🧬',
        text: breed ? `Spécificités du ${breed}` : 'Adaptation à votre chien',
      },
      { icon: '🏋️', text: 'Sélection des exercices' },
      { icon: '🗓️', text: `Montage des ${weekCount} semaines` },
    ],
    [breed, weekCount]
  )

  const [stepIndex, setStepIndex] = useState(0)

  const spin = useRef(new Animated.Value(0)).current
  const pulse = useRef(new Animated.Value(0)).current
  const progress = useRef(new Animated.Value(0)).current
  const stepFade = useRef(new Animated.Value(1)).current
  const reveal = useRef(new Animated.Value(0)).current
  const float = useRef(PAWS.map(() => new Animated.Value(0))).current

  // ── Boucles d'attente ────────────────────────────────────────────────────
  useEffect(() => {
    if (!visible || phase !== 'loading') return

    const rotation = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 3600,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    )
    const breathing = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1100, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    )
    const paws = float.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 420),
          Animated.timing(v, { toValue: 1, duration: 2600, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(v, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      )
    )

    rotation.start()
    breathing.start()
    paws.forEach((p) => p.start())

    // Montée jusqu'à 92 % seulement : les derniers pour cent sont réservés à
    // l'arrivée réelle du plan.
    Animated.timing(progress, {
      toValue: 0.92,
      duration: 17000,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start()

    return () => {
      rotation.stop()
      breathing.stop()
      paws.forEach((p) => p.stop())
    }
  }, [visible, phase, spin, pulse, progress, float])

  // ── Défilement des étapes ────────────────────────────────────────────────
  useEffect(() => {
    if (!visible || phase !== 'loading') return

    const timer = setInterval(() => {
      Animated.timing(stepFade, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
        setStepIndex((i) => (i + 1 < steps.length ? i + 1 : i))
        Animated.timing(stepFade, { toValue: 1, duration: 260, useNativeDriver: true }).start()
      })
    }, 2900)

    return () => clearInterval(timer)
  }, [visible, phase, steps.length, stepFade])

  // ── Révélation ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'done') return

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {})
    Animated.timing(progress, { toValue: 1, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start()
    Animated.spring(reveal, { toValue: 1, friction: 6, tension: 60, useNativeDriver: true }).start()
  }, [phase, progress, reveal])

  useEffect(() => {
    if (!visible) {
      setStepIndex(0)
      progress.setValue(0)
      reveal.setValue(0)
      stepFade.setValue(1)
    }
  }, [visible, progress, reveal, stepFade])

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] })
  const rotateBack = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-360deg'] })
  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.09] })
  const haloOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.28, 0.6] })

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={() => onDismiss?.()}>
      <View style={s.backdrop}>
        <LinearGradient
          colors={['rgba(26,22,20,0.96)', 'rgba(26,22,20,0.99)']}
          style={StyleSheet.absoluteFill}
        />

        {phase === 'loading' && (
          <View style={s.body}>
            {/* Halo animé */}
            <View style={s.stage}>
              <Animated.View
                style={[s.halo, { opacity: haloOpacity, transform: [{ scale }] }]}
              />
              <Animated.View style={[s.ringOuter, { transform: [{ rotate }] }]} />
              <Animated.View style={[s.ringInner, { transform: [{ rotate: rotateBack }] }]} />
              <Animated.View style={[s.core, { transform: [{ scale }] }]}>
                <Text style={s.coreEmoji}>🐕‍🦺</Text>
              </Animated.View>

              {/* Éléments flottants */}
              {PAWS.map((paw, i) => {
                const v = float[i]
                const translateY = v.interpolate({ inputRange: [0, 1], outputRange: [30, -110] })
                const opacity = v.interpolate({ inputRange: [0, 0.15, 0.75, 1], outputRange: [0, 0.9, 0.5, 0] })
                const translateX = (i - 2) * 34
                return (
                  <Animated.Text
                    key={paw}
                    style={[s.paw, { opacity, transform: [{ translateX }, { translateY }] }]}
                  >
                    {paw}
                  </Animated.Text>
                )
              })}
            </View>

            <Text style={s.title}>
              Construction du plan{petName ? ` de ${petName}` : ''}
            </Text>

            <Animated.View style={[s.stepRow, { opacity: stepFade }]}>
              <Text style={s.stepIcon}>{steps[stepIndex].icon}</Text>
              <Text style={s.stepText}>{steps[stepIndex].text}…</Text>
            </Animated.View>

            <View style={s.barTrack}>
              <Animated.View
                style={[
                  s.barFill,
                  { width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
                ]}
              />
            </View>

            <Text style={s.hint}>Une vingtaine de secondes, ne fermez pas l'application</Text>
          </View>
        )}

        {phase === 'done' && (
          <Animated.View
            style={[
              s.body,
              {
                opacity: reveal,
                transform: [
                  { scale: reveal.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) },
                ],
              },
            ]}
          >
            <View style={s.successBadge}>
              <Ionicons name="checkmark" size={38} color={colors.white} />
            </View>

            <Text style={s.successTitle}>Votre plan est prêt</Text>
            <Text style={s.successSub}>
              {weekCount} semaines sur mesure{petName ? ` pour ${petName}` : ''}
              {breed ? `, adaptées au ${breed}` : ''}
            </Text>

            {!!summary && (
              <View style={s.summaryCard}>
                <Text style={s.summaryText} numberOfLines={4}>
                  {summary}
                </Text>
              </View>
            )}

            {priorities.length > 0 && (
              <View style={s.prioRow}>
                {priorities.slice(0, 3).map((p, i) => (
                  <View key={`${p}-${i}`} style={s.prioChip}>
                    <Text style={s.prioText}>{p}</Text>
                  </View>
                ))}
              </View>
            )}

            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {})
                onReveal()
              }}
              style={({ pressed }) => [s.cta, pressed && { opacity: 0.9 }]}
            >
              <LinearGradient
                colors={['#8EC347', '#7EB13F', '#5C8A2A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <Text style={s.ctaText}>Découvrir mon plan</Text>
              <Ionicons name="arrow-forward" size={18} color={colors.white} />
            </Pressable>
          </Animated.View>
        )}

        {phase === 'error' && (
          <View style={s.body}>
            <View style={s.errorBadge}>
              <Ionicons name="alert" size={34} color={colors.white} />
            </View>
            <Text style={s.successTitle}>Le plan n'a pas pu être créé</Text>
            <Text style={s.errorText}>{errorMessage ?? 'Erreur inconnue'}</Text>
            <View style={s.errorActions}>
              {onRetry && (
                <Pressable onPress={onRetry} style={[s.cta, s.ctaSolid]}>
                  <Text style={s.ctaText}>Réessayer</Text>
                </Pressable>
              )}
              <Pressable onPress={() => onDismiss?.()} style={s.ghost}>
                <Text style={s.ghostText}>Plus tard</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </Modal>
  )
}

const s = StyleSheet.create({
  backdrop: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  body: { alignItems: 'center', paddingHorizontal: 32, width: '100%' },

  stage: { width: 200, height: 200, alignItems: 'center', justifyContent: 'center' },
  halo: {
    position: 'absolute',
    width: 176,
    height: 176,
    borderRadius: 88,
    backgroundColor: 'rgba(126,177,63,0.22)',
  },
  ringOuter: {
    position: 'absolute',
    width: 168,
    height: 168,
    borderRadius: 84,
    borderWidth: 3,
    borderColor: 'rgba(126,177,63,0.75)',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  ringInner: {
    position: 'absolute',
    width: 126,
    height: 126,
    borderRadius: 63,
    borderWidth: 2,
    borderColor: 'rgba(212,188,159,0.7)',
    borderLeftColor: 'transparent',
    borderTopColor: 'transparent',
  },
  core: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coreEmoji: { fontSize: 40 },
  paw: { position: 'absolute', fontSize: 20 },

  title: { fontSize: 21, fontWeight: '800', color: colors.white, marginTop: 22, textAlign: 'center' },

  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14, minHeight: 26 },
  stepIcon: { fontSize: 16 },
  stepText: { fontSize: 14.5, color: 'rgba(255,255,255,0.72)' },

  barTrack: {
    width: '78%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: radius.full,
    marginTop: 26,
    overflow: 'hidden',
  },
  barFill: { height: '100%', backgroundColor: colors.green, borderRadius: radius.full },
  hint: { fontSize: 12, color: 'rgba(255,255,255,0.42)', marginTop: 14, textAlign: 'center' },

  successBadge: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.green,
  },
  successTitle: { fontSize: 24, fontWeight: '900', color: colors.white, marginTop: 20, textAlign: 'center' },
  successSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },

  summaryCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.lg,
    padding: 14,
    marginTop: 20,
    width: '100%',
  },
  summaryText: { fontSize: 13.5, color: 'rgba(255,255,255,0.82)', lineHeight: 20 },

  prioRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14, justifyContent: 'center' },
  prioChip: {
    backgroundColor: 'rgba(126,177,63,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(126,177,63,0.45)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  prioText: { fontSize: 12.5, color: '#B9DE86', fontWeight: '700' },

  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: radius.full,
    overflow: 'hidden',
    marginTop: 28,
    paddingHorizontal: 28,
  },
  ctaSolid: { backgroundColor: colors.green },
  ctaText: { fontSize: 15.5, fontWeight: '800', color: colors.white },

  errorBadge: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.72)',
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorActions: { alignItems: 'center' },
  ghost: { marginTop: 14, padding: 10 },
  ghostText: { fontSize: 14, color: 'rgba(255,255,255,0.55)', fontWeight: '600' },
})
