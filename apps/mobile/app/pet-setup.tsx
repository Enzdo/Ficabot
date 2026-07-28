/**
 * Onboarding conversationnel « premier animal ».
 *
 * Un chat scripté (aucun appel IA : instantané, hors paywall) qui collecte
 * espèce → prénom → âge → race → poids, crée l'animal, puis révèle un espace
 * déjà personnalisé. L'habillage de l'écran change dès que l'espèce est choisie.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useAuthStore } from '@/stores/auth'
import { usePetsStore } from '@/stores/pets'
import { api, secureStorage } from '@/services/api'
import { geocodeCity, type GeocodedCity } from '@/services/weather'
import { Button } from '@/components/ui/Button'
import { DateInput } from '@/components/ui/DateInput'
import { colors, radius, shadow } from '@/constants/theme'
import {
  PET_KINDS,
  birthDateFromMonths,
  breedForKind,
  describeStage,
  getKindProfile,
  getStageTips,
  type PetKind,
  type PetKindProfile,
} from '@/constants/petProfiles'
import type { Pet, User } from '@/types'

type Msg = { id: number; from: 'bot' | 'user'; text: string }
type Step = 'kind' | 'name' | 'age' | 'breed' | 'weight' | 'city'
type Phase = 'chat' | 'loading' | 'done'

const STEP_ORDER: Step[] = ['kind', 'name', 'age', 'breed', 'weight', 'city']

const LOADING_LINES = [
  'Création de son profil…',
  'Analyse de son espèce et de son âge…',
  'Sélection des conseils adaptés…',
  'Personnalisation de votre espace ✨',
]

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

// ─── Bulles ──────────────────────────────────────────────────────────────────

function Bubble({ msg, accent }: { msg: Msg; accent: string }) {
  const anim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.spring(anim, { toValue: 1, useNativeDriver: true, tension: 90, friction: 9 }).start()
  }, [anim])

  const style = {
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
  }

  if (msg.from === 'user') {
    return (
      <Animated.View style={[s.bubbleUser, { backgroundColor: accent }, style]}>
        <Text style={s.bubbleUserText}>{msg.text}</Text>
      </Animated.View>
    )
  }

  return (
    <Animated.View style={[s.botRow, style]}>
      <View style={[s.avatar, { backgroundColor: accent }]}>
        <Text style={s.avatarEmoji}>🐾</Text>
      </View>
      <View style={s.bubbleBot}>
        <Text style={s.bubbleBotText}>{msg.text}</Text>
      </View>
    </Animated.View>
  )
}

function TypingBubble({ accent }: { accent: string }) {
  const dots = useRef([0, 1, 2].map(() => new Animated.Value(0.3))).current

  useEffect(() => {
    const loops = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 140),
          Animated.timing(dot, { toValue: 1, duration: 320, useNativeDriver: true, easing: Easing.ease }),
          Animated.timing(dot, { toValue: 0.3, duration: 320, useNativeDriver: true, easing: Easing.ease }),
          Animated.delay((2 - i) * 140),
        ])
      )
    )
    loops.forEach((l) => l.start())
    return () => loops.forEach((l) => l.stop())
  }, [dots])

  return (
    <View style={s.botRow}>
      <View style={[s.avatar, { backgroundColor: accent }]}>
        <Text style={s.avatarEmoji}>🐾</Text>
      </View>
      <View style={[s.bubbleBot, s.bubbleTyping]}>
        {dots.map((dot, i) => (
          <Animated.View key={i} style={[s.typingDot, { opacity: dot }]} />
        ))}
      </View>
    </View>
  )
}

// ─── Écran ───────────────────────────────────────────────────────────────────

export default function PetSetupScreen() {
  const firstName = useAuthStore((state) => state.user?.firstName)
  const userId = useAuthStore((state) => state.user?.id)
  const createPet = usePetsStore((state) => state.createPet)
  const updateUser = useAuthStore((state) => state.updateUser)

  const [messages, setMessages] = useState<Msg[]>([])
  const [typing, setTyping] = useState(false)
  const [step, setStep] = useState<Step | null>(null)
  const [phase, setPhase] = useState<Phase>('chat')
  const [loadingLine, setLoadingLine] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const [kind, setKind] = useState<PetKind | null>(null)
  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState<string | undefined>(undefined)
  const [breed, setBreed] = useState<string | undefined>(undefined)
  const [weight, setWeight] = useState<number | null>(null)
  const [createdPet, setCreatedPet] = useState<Pet | null>(null)
  const [cityResults, setCityResults] = useState<GeocodedCity[]>([])

  const [draft, setDraft] = useState('')
  const [dateMode, setDateMode] = useState(false)

  const msgId = useRef(0)
  const started = useRef(false)
  const scrollRef = useRef<ScrollView>(null)
  const bgAnim = useRef(new Animated.Value(0)).current

  const profile: PetKindProfile | null = kind ? getKindProfile(kind) : null
  const accent = profile?.accent ?? colors.green

  // ── Fil de discussion ──
  const pushUser = useCallback((text: string) => {
    msgId.current += 1
    setMessages((prev) => [...prev, { id: msgId.current, from: 'user', text }])
  }, [])

  const pushBot = useCallback(async (lines: string[]) => {
    setTyping(true)
    for (const line of lines) {
      await wait(Math.min(1200, 420 + line.length * 11))
      msgId.current += 1
      setMessages((prev) => [...prev, { id: msgId.current, from: 'bot', text: line }])
    }
    setTyping(false)
  }, [])

  useEffect(() => {
    if (started.current) return
    started.current = true
    ;(async () => {
      await pushBot([
        `Bonjour${firstName ? ` ${firstName}` : ''} 👋`,
        'Je suis Fica. On va créer le profil de votre compagnon ensemble — quelques questions, une minute maximum.',
        'Pour commencer, qui partage votre quotidien ?',
      ])
      setStep('kind')
    })()
  }, [pushBot, firstName])

  // ── Réponses ──
  const answerKind = useCallback(async (picked: PetKindProfile) => {
    Haptics.selectionAsync()
    setKind(picked.kind)
    setStep(null)
    pushUser(`${picked.answerLabel} ${picked.emoji}`)
    Animated.timing(bgAnim, { toValue: 1, duration: 700, useNativeDriver: true, easing: Easing.out(Easing.quad) }).start()
    await pushBot([picked.intro, 'Comment s\'appelle-t-il ?'])
    setStep('name')
  }, [pushBot, pushUser, bgAnim])

  const answerName = useCallback(async (value: string) => {
    const clean = value.trim()
    if (!clean) return
    Haptics.selectionAsync()
    setName(clean)
    setDraft('')
    setStep(null)
    pushUser(clean)
    await pushBot([`${clean}, joli prénom 💚`, `Et quel âge a ${clean}, à peu près ?`])
    setStep('age')
  }, [pushBot, pushUser])

  const askBreed = useCallback(async () => {
    if (!profile) return
    await pushBot([profile.breedQuestion])
    setStep('breed')
  }, [pushBot, profile])

  const answerAgeChip = useCallback(async (label: string, months: number) => {
    Haptics.selectionAsync()
    setBirthDate(birthDateFromMonths(months))
    setStep(null)
    pushUser(label)
    await askBreed()
  }, [askBreed, pushUser])

  const answerExactDate = useCallback(async (value: string) => {
    Haptics.selectionAsync()
    setBirthDate(value)
    setDateMode(false)
    setStep(null)
    pushUser(`Né le ${new Date(value).toLocaleDateString('fr-FR')}`)
    await askBreed()
  }, [askBreed, pushUser])

  const answerUnknownAge = useCallback(async () => {
    Haptics.selectionAsync()
    setBirthDate(undefined)
    setStep(null)
    pushUser('Je ne sais pas')
    await pushBot(['Pas de souci, vous pourrez l\'ajouter plus tard.'])
    await askBreed()
  }, [askBreed, pushBot, pushUser])

  const answerBreed = useCallback(async (value: string | null) => {
    if (!profile) return
    Haptics.selectionAsync()
    const clean = value?.trim()
    setBreed(breedForKind(profile.kind, clean))
    setDraft('')
    setStep(null)
    pushUser(clean || 'Je ne sais pas')
    await pushBot([`Et combien pèse ${name || 'votre compagnon'}, à peu près ? (en kg)`])
    setStep('weight')
  }, [profile, name, pushBot, pushUser])

  const answerWeight = useCallback(async (value: number | null) => {
    Haptics.selectionAsync()
    setWeight(value)
    setDraft('')
    setStep(null)
    pushUser(value === null ? 'Je ne sais pas' : `${value} kg`)
    await pushBot([
      'Dernière chose : dans quelle ville vivez-vous ?',
      'Ça me permet d\'adapter les conseils à la météo du jour — canicule, gel, sol brûlant.',
    ])
    setStep('city')
  }, [pushBot, pushUser])

  // Recherche de la ville pendant la frappe, à partir de 3 lettres.
  useEffect(() => {
    if (step !== 'city' || draft.trim().length < 3) { setCityResults([]); return }
    let cancelled = false
    const timer = setTimeout(() => {
      geocodeCity(draft.trim()).then((results) => { if (!cancelled) setCityResults(results) })
    }, 350)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [draft, step])

  // ── Création ──
  const submit = useCallback(async (city: GeocodedCity | null) => {
    if (!profile) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setDraft('')
    setCityResults([])
    setStep(null)
    pushUser(city ? city.name : 'Je préfère ne pas le dire')
    setPhase('loading')
    setError(null)

    const startedAt = Date.now()

    // La ville se rattache au compte, pas à l'animal : échec sans conséquence
    // sur la création, on ne bloque donc pas le parcours dessus.
    if (city) {
      const res = await api.put<User>('/auth/profile', {
        city: city.name, latitude: city.latitude, longitude: city.longitude,
      })
      if (res.success && res.data) await updateUser(res.data)
    }

    const pet = await createPet({
      name,
      species: profile.species,
      breed,
      birthDate,
      weight: weight ?? undefined,
    })
    const elapsed = Date.now() - startedAt
    if (elapsed < 2800) await wait(2800 - elapsed)

    if (!pet) {
      setPhase('chat')
      setError('La création a échoué. Vérifiez votre connexion et réessayez.')
      setStep('city')
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      return
    }

    setCreatedPet(pet)
    setPhase('done')
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
  }, [profile, name, breed, birthDate, weight, createPet, updateUser, pushUser])

  // Défilement des messages de chargement
  useEffect(() => {
    if (phase !== 'loading') { setLoadingLine(0); return }
    const timer = setInterval(() => {
      setLoadingLine((i) => Math.min(i + 1, LOADING_LINES.length - 1))
    }, 750)
    return () => clearInterval(timer)
  }, [phase])

  const finish = useCallback(async () => {
    if (userId) await secureStorage.setPetSetup(userId, 'true')
    router.replace('/(tabs)')
  }, [userId])

  const skip = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    if (userId) await secureStorage.setPetSetup(userId, 'true')
    router.replace('/(tabs)')
  }, [userId])

  // ── Rendu : révélation ──
  if (phase === 'done' && createdPet && profile) {
    const tips = getStageTips(createdPet)
    return (
      <View style={s.root}>
        <LinearGradient colors={profile.gradient} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={s.flex} edges={['top', 'bottom']}>
          <ScrollView contentContainerStyle={s.revealContent} showsVerticalScrollIndicator={false}>
            <View style={[s.revealAvatar, shadow.md]}>
              <Text style={s.revealEmoji}>{profile.emoji}</Text>
            </View>
            <Text style={s.revealTitle}>L'espace de {createdPet.name} est prêt</Text>
            <View style={[s.revealBadge, { backgroundColor: accent }]}>
              <Text style={s.revealBadgeText}>{describeStage(createdPet)}</Text>
            </View>

            <Text style={s.revealSection}>Ce qui compte pour lui en ce moment</Text>
            {tips.map((tip) => (
              <View key={tip.title} style={[s.tipCard, shadow.sm]}>
                <View style={[s.tipIcon, { backgroundColor: profile.accentSoft }]}>
                  <Text style={s.tipEmoji}>{tip.emoji}</Text>
                </View>
                <View style={s.flex}>
                  <Text style={s.tipTitle}>{tip.title}</Text>
                  <Text style={s.tipBody}>{tip.body}</Text>
                </View>
              </View>
            ))}

            {birthDate && (
              <Text style={s.revealNote}>
                Âge approximatif — vous pourrez l'ajuster à tout moment dans sa fiche.
              </Text>
            )}
          </ScrollView>
          <View style={s.revealCta}>
            <Button title="Découvrir mon espace" onPress={finish} />
          </View>
        </SafeAreaView>
      </View>
    )
  }

  // ── Rendu : chat ──
  const stepIndex = step ? STEP_ORDER.indexOf(step) : STEP_ORDER.indexOf('kind')
  const progress = phase === 'loading' ? 1 : (stepIndex + (typing ? 0.5 : 0)) / STEP_ORDER.length

  return (
    <View style={s.root}>
      <View style={StyleSheet.absoluteFill}>
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.beigePale }]} />
        {profile && (
          <Animated.View style={[StyleSheet.absoluteFill, { opacity: bgAnim }]}>
            <LinearGradient colors={profile.gradient} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={StyleSheet.absoluteFill} />
          </Animated.View>
        )}
      </View>

      <SafeAreaView style={s.flex} edges={['top']}>
        <View style={s.header}>
          <View style={s.progressTrack}>
            <View style={[s.progressFill, { width: `${Math.min(100, progress * 100)}%`, backgroundColor: accent }]} />
          </View>
          <Pressable onPress={skip} hitSlop={12} disabled={phase === 'loading'}>
            <Text style={s.skip}>Passer</Text>
          </Pressable>
        </View>

        <KeyboardAvoidingView
          style={s.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
        >
          <ScrollView
            ref={scrollRef}
            style={s.flex}
            contentContainerStyle={s.thread}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
            keyboardShouldPersistTaps="handled"
          >
            {messages.map((msg) => <Bubble key={msg.id} msg={msg} accent={accent} />)}
            {typing && <TypingBubble accent={accent} />}
            {error && (
              <View style={s.errorBox}>
                <Ionicons name="alert-circle" size={16} color={colors.red} />
                <Text style={s.errorText}>{error}</Text>
              </View>
            )}
          </ScrollView>

          <View style={s.composer}>
            {step === 'kind' && (
              <View style={s.kindGrid}>
                {PET_KINDS.map((option) => (
                  <Pressable
                    key={option.kind}
                    onPress={() => answerKind(option)}
                    style={({ pressed }) => [s.kindCard, shadow.sm, pressed && s.pressed]}
                  >
                    <View style={[s.kindEmojiWrap, { backgroundColor: option.accentSoft }]}>
                      <Text style={s.kindEmoji}>{option.emoji}</Text>
                    </View>
                    <Text style={s.kindLabel}>{option.label}</Text>
                  </Pressable>
                ))}
              </View>
            )}

            {step === 'name' && (
              <View style={s.inputRow}>
                <TextInput
                  style={s.textInput}
                  value={draft}
                  onChangeText={setDraft}
                  placeholder="Son prénom"
                  placeholderTextColor={colors.gray[400]}
                  autoCapitalize="words"
                  autoFocus
                  returnKeyType="send"
                  onSubmitEditing={() => answerName(draft)}
                />
                <Pressable
                  onPress={() => answerName(draft)}
                  disabled={!draft.trim()}
                  style={[s.sendBtn, { backgroundColor: accent }, !draft.trim() && s.sendBtnDisabled]}
                >
                  <Ionicons name="arrow-up" size={20} color={colors.white} />
                </Pressable>
              </View>
            )}

            {step === 'age' && profile && (
              dateMode ? (
                <View style={s.dateWrap}>
                  <DateInput
                    label="Sa date de naissance"
                    value={birthDate ?? ''}
                    onChange={answerExactDate}
                    maximumDate={new Date()}
                  />
                  <Pressable onPress={() => setDateMode(false)} hitSlop={8}>
                    <Text style={[s.linkBtn, { color: accent }]}>Revenir aux tranches d'âge</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={s.chipWrap}>
                  {profile.ageChips.map((chip) => (
                    <Pressable
                      key={chip.label}
                      onPress={() => answerAgeChip(chip.label, chip.months)}
                      style={({ pressed }) => [s.chip, pressed && s.pressed]}
                    >
                      <Text style={s.chipText}>{chip.label}</Text>
                    </Pressable>
                  ))}
                  <Pressable onPress={() => setDateMode(true)} style={({ pressed }) => [s.chip, s.chipGhost, pressed && s.pressed]}>
                    <Text style={[s.chipText, { color: accent }]}>Je connais sa date exacte 📅</Text>
                  </Pressable>
                  <Pressable onPress={answerUnknownAge} style={({ pressed }) => [s.chip, s.chipGhost, pressed && s.pressed]}>
                    <Text style={s.chipTextMuted}>Je ne sais pas</Text>
                  </Pressable>
                </View>
              )
            )}

            {step === 'breed' && profile && (
              <View style={s.breedWrap}>
                {profile.breedSuggestions.length > 0 && (
                  <View style={s.chipWrap}>
                    {profile.breedSuggestions.map((suggestion) => (
                      <Pressable
                        key={suggestion}
                        onPress={() => answerBreed(suggestion)}
                        style={({ pressed }) => [s.chip, pressed && s.pressed]}
                      >
                        <Text style={s.chipText}>{suggestion}</Text>
                      </Pressable>
                    ))}
                    <Pressable onPress={() => answerBreed(null)} style={({ pressed }) => [s.chip, s.chipGhost, pressed && s.pressed]}>
                      <Text style={s.chipTextMuted}>Je ne sais pas</Text>
                    </Pressable>
                  </View>
                )}
                <View style={s.inputRow}>
                  <TextInput
                    style={s.textInput}
                    value={draft}
                    onChangeText={setDraft}
                    placeholder="Ou écrivez-le ici"
                    placeholderTextColor={colors.gray[400]}
                    autoCapitalize="words"
                    returnKeyType="send"
                    onSubmitEditing={() => draft.trim() && answerBreed(draft)}
                  />
                  <Pressable
                    onPress={() => answerBreed(draft)}
                    disabled={!draft.trim()}
                    style={[s.sendBtn, { backgroundColor: accent }, !draft.trim() && s.sendBtnDisabled]}
                  >
                    <Ionicons name="arrow-up" size={20} color={colors.white} />
                  </Pressable>
                </View>
              </View>
            )}

            {step === 'weight' && profile && (
              <View style={s.breedWrap}>
                <View style={s.inputRow}>
                  <TextInput
                    style={s.textInput}
                    value={draft}
                    onChangeText={setDraft}
                    placeholder={`${profile.weightHint} kg`}
                    placeholderTextColor={colors.gray[400]}
                    keyboardType="decimal-pad"
                    returnKeyType="send"
                    onSubmitEditing={() => {
                      const parsed = parseFloat(draft.replace(',', '.'))
                      if (parsed > 0) answerWeight(parsed)
                    }}
                  />
                  <Pressable
                    onPress={() => {
                      const parsed = parseFloat(draft.replace(',', '.'))
                      if (parsed > 0) answerWeight(parsed)
                    }}
                    disabled={!(parseFloat(draft.replace(',', '.')) > 0)}
                    style={[
                      s.sendBtn,
                      { backgroundColor: accent },
                      !(parseFloat(draft.replace(',', '.')) > 0) && s.sendBtnDisabled,
                    ]}
                  >
                    <Ionicons name="arrow-up" size={20} color={colors.white} />
                  </Pressable>
                </View>
                <Pressable onPress={() => answerWeight(null)} style={({ pressed }) => [s.chip, s.chipGhost, s.chipSolo, pressed && s.pressed]}>
                  <Text style={s.chipTextMuted}>Je ne sais pas</Text>
                </Pressable>
              </View>
            )}

            {step === 'city' && (
              <View style={s.breedWrap}>
                {cityResults.length > 0 && (
                  <View style={s.cityList}>
                    {cityResults.map((city) => (
                      <Pressable
                        key={`${city.name}-${city.latitude}`}
                        onPress={() => submit(city)}
                        style={({ pressed }) => [s.cityRow, pressed && s.pressed]}
                      >
                        <Ionicons name="location-outline" size={18} color={accent} />
                        <View style={{ flex: 1 }}>
                          <Text style={s.cityName}>{city.name}</Text>
                          <Text style={s.cityMeta} numberOfLines={1}>
                            {[city.admin, city.country].filter(Boolean).join(' · ')}
                          </Text>
                        </View>
                      </Pressable>
                    ))}
                  </View>
                )}
                <View style={s.inputRow}>
                  <TextInput
                    style={s.textInput}
                    value={draft}
                    onChangeText={setDraft}
                    placeholder="Ex : Lyon"
                    placeholderTextColor={colors.gray[400]}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                </View>
                <Pressable onPress={() => submit(null)} style={({ pressed }) => [s.chip, s.chipGhost, s.chipSolo, pressed && s.pressed]}>
                  <Text style={s.chipTextMuted}>Passer cette question</Text>
                </Pressable>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {phase === 'loading' && profile && (
        <MagicLoader profile={profile} name={name} line={LOADING_LINES[loadingLine]} />
      )}
    </View>
  )
}

// ─── Chargement « magique » ──────────────────────────────────────────────────

function MagicLoader({ profile, name, line }: { profile: PetKindProfile; name: string; line: string }) {
  const spin = useRef(new Animated.Value(0)).current
  const pulse = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const spinLoop = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 2200, useNativeDriver: true, easing: Easing.linear })
    )
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true, easing: Easing.inOut(Easing.quad) }),
        Animated.timing(pulse, { toValue: 0, duration: 800, useNativeDriver: true, easing: Easing.inOut(Easing.quad) }),
      ])
    )
    spinLoop.start()
    pulseLoop.start()
    return () => { spinLoop.stop(); pulseLoop.stop() }
  }, [spin, pulse])

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] })
  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] })

  return (
    <View style={s.loaderRoot}>
      <LinearGradient colors={profile.gradient} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={StyleSheet.absoluteFill} />
      <View style={s.loaderCenter}>
        <View style={s.loaderRingWrap}>
          <Animated.View style={[s.loaderRing, { borderTopColor: profile.accent, transform: [{ rotate }] }]} />
          <Animated.Text style={[s.loaderEmoji, { transform: [{ scale }] }]}>{profile.emoji}</Animated.Text>
        </View>
        <Text style={s.loaderName}>{name}</Text>
        <Text style={s.loaderLine}>{line}</Text>
        <ActivityIndicator color={profile.accent} style={{ marginTop: 20 }} />
      </View>
    </View>
  )
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.beigePale },
  flex: { flex: 1 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },

  header: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  progressTrack: { flex: 1, height: 5, borderRadius: 3, backgroundColor: 'rgba(26,22,20,0.10)', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  skip: { fontSize: 14, fontWeight: '700', color: colors.gray[500] },

  thread: { paddingHorizontal: 20, paddingBottom: 16, gap: 10 },

  botRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, maxWidth: '88%' },
  avatar: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  avatarEmoji: { fontSize: 15 },
  bubbleBot: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.xl, borderBottomLeftRadius: 6,
    paddingHorizontal: 16, paddingVertical: 12,
  },
  bubbleBotText: { fontSize: 15, lineHeight: 21, color: colors.dark },
  bubbleTyping: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', flex: 0, paddingVertical: 15 },
  typingDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: colors.gray[400] },

  bubbleUser: {
    alignSelf: 'flex-end', maxWidth: '82%',
    borderRadius: radius.xl, borderBottomRightRadius: 6,
    paddingHorizontal: 16, paddingVertical: 12,
  },
  bubbleUserText: { fontSize: 15, lineHeight: 21, color: colors.white, fontWeight: '600' },

  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.redLight, borderRadius: radius.lg, padding: 12,
  },
  errorText: { flex: 1, fontSize: 13, color: colors.red, fontWeight: '600' },

  composer: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24 },

  kindGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  kindCard: {
    width: 100, backgroundColor: colors.white, borderRadius: radius.xl,
    paddingVertical: 12, alignItems: 'center', gap: 8,
  },
  kindEmojiWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  kindEmoji: { fontSize: 24 },
  kindLabel: { fontSize: 13, fontWeight: '700', color: colors.dark },

  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: colors.white, borderRadius: radius.full,
    paddingHorizontal: 16, paddingVertical: 11,
    borderWidth: 1.5, borderColor: colors.gray[200],
  },
  chipGhost: { backgroundColor: 'rgba(255,255,255,0.55)' },
  chipSolo: { alignSelf: 'flex-start' },
  chipText: { fontSize: 14, fontWeight: '600', color: colors.dark },
  chipTextMuted: { fontSize: 14, fontWeight: '600', color: colors.gray[500] },

  breedWrap: { gap: 10 },
  cityList:  { backgroundColor: colors.white, borderRadius: radius.xl, overflow: 'hidden', borderWidth: 1.5, borderColor: colors.gray[200] },
  cityRow:   { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.gray[100] },
  cityName:  { fontSize: 15, fontWeight: '700', color: colors.dark },
  cityMeta:  { fontSize: 12, color: colors.gray[500], marginTop: 1 },
  dateWrap: { gap: 10 },
  linkBtn: { fontSize: 13, fontWeight: '700', textAlign: 'center' },

  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  textInput: {
    flex: 1, height: 50,
    backgroundColor: colors.white, borderRadius: radius.full,
    paddingHorizontal: 18, fontSize: 15, color: colors.dark,
    borderWidth: 1.5, borderColor: colors.gray[200],
  },
  sendBtn: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.4 },

  // Chargement
  loaderRoot: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  loaderCenter: { alignItems: 'center', paddingHorizontal: 40 },
  loaderRingWrap: { width: 120, height: 120, alignItems: 'center', justifyContent: 'center', marginBottom: 28 },
  loaderRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 60, borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.55)',
  },
  loaderEmoji: { fontSize: 52 },
  loaderName: { fontSize: 24, fontWeight: '800', color: colors.dark },
  loaderLine: { fontSize: 14, color: colors.gray[600], marginTop: 8, textAlign: 'center', fontWeight: '600' },

  // Révélation
  revealContent: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 20, alignItems: 'center', gap: 12 },
  revealAvatar: {
    width: 104, height: 104, borderRadius: 52,
    backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center',
  },
  revealEmoji: { fontSize: 50 },
  revealTitle: { fontSize: 26, fontWeight: '800', color: colors.dark, textAlign: 'center', marginTop: 4 },
  revealBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: radius.full, marginBottom: 12 },
  revealBadgeText: { fontSize: 13, fontWeight: '700', color: colors.white },
  revealSection: { alignSelf: 'flex-start', fontSize: 16, fontWeight: '800', color: colors.dark, marginBottom: 2 },
  revealNote: { fontSize: 12, color: colors.gray[600], textAlign: 'center', marginTop: 6, paddingHorizontal: 16 },
  revealCta: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },

  tipCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    width: '100%', backgroundColor: colors.white,
    borderRadius: radius['2xl'], padding: 16,
  },
  tipIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  tipEmoji: { fontSize: 20 },
  tipTitle: { fontSize: 14, fontWeight: '800', color: colors.dark, lineHeight: 19 },
  tipBody: { fontSize: 13, color: colors.gray[600], lineHeight: 19, marginTop: 4 },
})
