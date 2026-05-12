import { useEffect, useRef, useState } from 'react'
import {
  Animated,
  BackHandler,
  Dimensions,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import { useAuthStore } from '@/stores/auth'
import { colors, radius } from '@/constants/theme'

const { width } = Dimensions.get('window')

const SLIDES = [
  {
    key: 'welcome',
    emoji: '🐾',
    title: 'Bienvenue sur\nFicabot',
    subtitle: 'L\'application tout-en-un pour prendre soin de vos animaux de compagnie.',
    bg: [colors.dark, '#2E231F'] as [string, string],
    light: true,
  },
  {
    key: 'health',
    emoji: '🩺',
    title: 'Suivi de santé\ncentralisé',
    subtitle: 'Vaccins, traitements, visites vétérinaires et poids — tout dans un seul endroit.',
    bg: [colors.greenLight, '#D4EAB8'] as [string, string],
    light: false,
  },
  {
    key: 'ai',
    emoji: '🤖',
    title: 'Assistant IA\npersonnalisé',
    subtitle: 'Posez vos questions à notre assistant intelligent, disponible 24h/24 pour vos compagnons.',
    bg: ['#2B1F3A', '#1A1614'] as [string, string],
    light: true,
  },
  {
    key: 'plan',
    emoji: '📅',
    title: 'Prêt à\ncommencer ?',
    subtitle: 'Créez votre compte gratuitement et ajoutez votre premier compagnon en moins d\'une minute.',
    bg: [colors.beigeLight, colors.beige] as [string, string],
    light: false,
  },
]

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets()
  const markOnboardingDone = useAuthStore((s) => s.markOnboardingDone)
  const scrollRef = useRef<ScrollView>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const dotAnim = useRef(SLIDES.map((_, i) => new Animated.Value(i === 0 ? 1 : 0))).current

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (currentIndex > 0) { goToSlide(currentIndex - 1); return true }
      return false
    })
    return () => sub.remove()
  }, [currentIndex])

  const goToSlide = (index: number) => {
    scrollRef.current?.scrollTo({ x: index * width, animated: true })
    Haptics.selectionAsync()
    dotAnim.forEach((anim, i) => {
      Animated.spring(anim, {
        toValue: i === index ? 1 : 0,
        useNativeDriver: false,
        tension: 120,
        friction: 7,
      }).start()
    })
    setCurrentIndex(index)
  }

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      goToSlide(currentIndex + 1)
    }
  }

  const handleSkip = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    await markOnboardingDone()
    router.replace('/(auth)/login')
  }

  const handleRegister = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    await markOnboardingDone()
    router.replace('/(auth)/register')
  }

  const handleLogin = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    await markOnboardingDone()
    router.replace('/(auth)/login')
  }

  const isLast = currentIndex === SLIDES.length - 1
  const slide = SLIDES[currentIndex]

  return (
    <View style={styles.root}>
      <StatusBar barStyle={slide.light ? 'light-content' : 'dark-content'} />

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        style={styles.slider}
      >
        {SLIDES.map((s) => (
          <LinearGradient
            key={s.key}
            colors={s.bg}
            start={{ x: 0.3, y: 0 }}
            end={{ x: 0.7, y: 1 }}
            style={styles.slide}
          >
            <View style={styles.emojiWrap}>
              <Text style={styles.emoji}>{s.emoji}</Text>
            </View>
            <Text style={[styles.title, s.light ? styles.titleLight : styles.titleDark]}>
              {s.title}
            </Text>
            <Text style={[styles.subtitle, s.light ? styles.subtitleLight : styles.subtitleDark]}>
              {s.subtitle}
            </Text>
          </LinearGradient>
        ))}
      </ScrollView>

      {/* Dots */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => {
          const dotWidth = dotAnim[i].interpolate({ inputRange: [0, 1], outputRange: [8, 24] })
          const opacity = dotAnim[i].interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] })
          return (
            <Pressable key={i} onPress={() => goToSlide(i)} hitSlop={8}>
              <Animated.View
                style={[
                  styles.dot,
                  { width: dotWidth, opacity },
                  slide.light ? styles.dotLight : styles.dotDark,
                ]}
              />
            </Pressable>
          )
        })}
      </View>

      {/* CTA area */}
      <View style={[styles.cta, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        {isLast ? (
          <>
            <Pressable
              onPress={handleRegister}
              style={({ pressed }) => [styles.btnPrimary, pressed && styles.btnPressed]}
            >
              <Text style={styles.btnPrimaryText}>Créer mon compte</Text>
            </Pressable>
            <Pressable onPress={handleLogin} style={styles.btnSecondary}>
              <Text style={[styles.btnSecondaryText, slide.light ? styles.textLight : styles.textDark]}>
                J'ai déjà un compte
              </Text>
            </Pressable>
          </>
        ) : (
          <View style={styles.row}>
            <Pressable onPress={handleSkip} hitSlop={12}>
              <Text style={[styles.skip, slide.light ? styles.textLight : styles.textDark]}>Passer</Text>
            </Pressable>
            <Pressable
              onPress={handleNext}
              style={({ pressed }) => [styles.nextBtn, pressed && styles.btnPressed]}
            >
              <Text style={styles.nextText}>Suivant →</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root:    { flex: 1 },
  slider:  { flex: 1 },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
    paddingTop: 60,
    paddingBottom: 20,
  },

  emojiWrap: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  emoji: { fontSize: 56 },

  title:       { fontSize: 36, fontWeight: '900', textAlign: 'center', lineHeight: 42, marginBottom: 16 },
  titleLight:  { color: colors.white },
  titleDark:   { color: colors.dark },
  subtitle:       { fontSize: 16, textAlign: 'center', lineHeight: 24, opacity: 0.75 },
  subtitleLight:  { color: colors.white },
  subtitleDark:   { color: colors.gray[700] },

  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 20,
  },
  dot:      { height: 8, borderRadius: 4 },
  dotLight: { backgroundColor: colors.white },
  dotDark:  { backgroundColor: colors.dark },

  cta: { paddingHorizontal: 24, gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  btnPrimary: {
    height: 54,
    borderRadius: radius.full,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  btnPrimaryText: { fontSize: 17, fontWeight: '800', color: colors.white },
  btnPressed: { transform: [{ scale: 0.96 }] },

  btnSecondary: { alignItems: 'center', paddingVertical: 10 },
  btnSecondaryText: { fontSize: 15, fontWeight: '600' },

  nextBtn: {
    height: 50,
    paddingHorizontal: 28,
    borderRadius: radius.full,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  nextText:  { fontSize: 16, fontWeight: '800', color: colors.white },
  skip:      { fontSize: 15, fontWeight: '600', opacity: 0.6 },

  textLight: { color: colors.white },
  textDark:  { color: colors.dark },
})
