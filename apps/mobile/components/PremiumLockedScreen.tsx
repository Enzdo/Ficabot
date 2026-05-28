import { Pressable, StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import { Button } from '@/components/ui/Button'
import { colors, radius, shadow } from '@/constants/theme'

type Props = {
  feature?: 'chat' | 'prediag' | 'scan' | 'photo'
  title: string
  description: string
}

const PERKS: { icon: string; label: string }[] = [
  { icon: '♾️', label: 'Questions illimitées' },
  { icon: '🔬', label: 'Pré-diagnostic IA' },
  { icon: '📷', label: 'Scan du carnet santé' },
  { icon: '⚡', label: 'Support prioritaire' },
]

export function PremiumLockedScreen({ feature, title, description }: Props) {
  const goPaywall = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    router.push({ pathname: '/paywall', params: feature ? { feature } : {} })
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.container}>
        <LinearGradient
          colors={[colors.greenDark, colors.green]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={s.iconWrap}
        >
          <Ionicons name="lock-closed" size={42} color={colors.white} />
        </LinearGradient>

        <Text style={s.crown}>👑</Text>
        <Text style={s.title}>{title}</Text>
        <Text style={s.description}>{description}</Text>

        <View style={s.perksCard}>
          {PERKS.map((p) => (
            <View key={p.label} style={s.perkRow}>
              <Text style={s.perkIcon}>{p.icon}</Text>
              <Text style={s.perkLabel}>{p.label}</Text>
              <Ionicons name="checkmark" size={18} color={colors.green} />
            </View>
          ))}
        </View>

        <Button title="Découvrir Premium" onPress={goPaywall} style={s.cta} />

        <Pressable onPress={() => router.back()}>
          <Text style={s.skip}>Plus tard</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: colors.beigePale },
  container:   { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center', gap: 14 },
  iconWrap:    { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', ...shadow.dark, marginBottom: 6 },
  crown:       { fontSize: 32 },
  title:       { fontSize: 24, fontWeight: '800', color: colors.dark, textAlign: 'center' },
  description: { fontSize: 14, color: colors.gray[600], textAlign: 'center', lineHeight: 21, paddingHorizontal: 20, marginBottom: 8 },
  perksCard:   { backgroundColor: colors.white, borderRadius: radius.lg, padding: 16, gap: 10, width: '100%', ...shadow.sm },
  perkRow:     { flexDirection: 'row', alignItems: 'center', gap: 12 },
  perkIcon:    { fontSize: 20, width: 28, textAlign: 'center' },
  perkLabel:   { flex: 1, fontSize: 14, color: colors.dark, fontWeight: '600' },
  cta:         { width: '100%', marginTop: 8 },
  skip:        { fontSize: 13, color: colors.gray[500], fontWeight: '600', padding: 12 },
})
