import { useState } from 'react'
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import { api } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/Button'
import { colors, radius, shadow } from '@/constants/theme'

const PLANS: { id: 'monthly' | 'yearly' | 'lifetime'; label: string; price: string; sub: string; badge?: string }[] = [
  { id: 'monthly',  label: 'Mensuel',  price: '4,99 €', sub: '/mois',  badge: undefined },
  { id: 'yearly',   label: 'Annuel',   price: '39,99 €', sub: '/an',   badge: '−33%' },
  { id: 'lifetime', label: 'À vie',    price: '99 €',    sub: 'unique', badge: 'Best' },
]

const FEATURES = [
  { icon: '🤖', title: 'Assistant IA illimité', desc: 'Posez toutes vos questions vétérinaires à l\'IA' },
  { icon: '🔬', title: 'Pré-diagnostic IA',     desc: 'Analyse multi-modèles de symptômes par photo' },
  { icon: '📷', title: 'Scan du carnet santé',  desc: 'Numérisez automatiquement les pages de votre carnet' },
  { icon: '📸', title: 'Analyse photo IA',       desc: 'Détection de symptômes sur photos de votre animal' },
  { icon: '💡', title: 'Conseils personnalisés', desc: 'Recommandations adaptées à votre animal' },
  { icon: '🆘', title: 'Support prioritaire',    desc: 'Réponse en moins de 24h' },
]

export default function PaywallScreen() {
  const params = useLocalSearchParams<{ feature?: string }>()
  const { user, fetchMe } = useAuthStore()
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | 'lifetime'>('yearly')
  const [activating, setActivating] = useState(false)

  const handleActivate = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setActivating(true)
    const res = await api.post<{ isPremium: boolean }>('/user/subscription/activate', { plan: selectedPlan })
    setActivating(false)

    if (res.success) {
      await fetchMe()
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      Alert.alert('Premium activé', 'Toutes les fonctionnalités IA sont maintenant débloquées.', [
        { text: 'Continuer', onPress: () => router.back() },
      ])
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      Alert.alert(
        'Paiement en attente',
        res.message ?? "L'intégration paiement Stripe arrive bientôt. Contactez le support pour activer manuellement.",
      )
    }
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.closeBtn}>
          <Ionicons name="close" size={22} color={colors.gray[700]} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[colors.greenDark, colors.green]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={s.hero}
        >
          <Text style={s.crown}>👑</Text>
          <Text style={s.heroTitle}>Ficabot Premium</Text>
          <Text style={s.heroSub}>Toutes les fonctionnalités IA débloquées pour vous et vos animaux</Text>
        </LinearGradient>

        {params.feature && (
          <View style={s.contextNote}>
            <Ionicons name="lock-closed" size={14} color={colors.orange} />
            <Text style={s.contextNoteText}>
              {params.feature === 'chat' ? "L'assistant IA est une fonctionnalité Premium"
               : params.feature === 'prediag' ? 'Le pré-diagnostic est une fonctionnalité Premium'
               : params.feature === 'scan' ? "Le scan du carnet santé est une fonctionnalité Premium"
               : 'Cette fonctionnalité est réservée aux comptes Premium'}
            </Text>
          </View>
        )}

        <Text style={s.sectionTitle}>Ce qui est inclus</Text>
        <View style={s.featureList}>
          {FEATURES.map((f) => (
            <View key={f.title} style={s.featureRow}>
              <Text style={s.featureIcon}>{f.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.featureTitle}>{f.title}</Text>
                <Text style={s.featureDesc}>{f.desc}</Text>
              </View>
              <Ionicons name="checkmark-circle" size={20} color={colors.green} />
            </View>
          ))}
        </View>

        <Text style={s.sectionTitle}>Choisissez votre formule</Text>
        <View style={s.plansList}>
          {PLANS.map((plan) => {
            const active = selectedPlan === plan.id
            return (
              <Pressable
                key={plan.id}
                onPress={() => { Haptics.selectionAsync(); setSelectedPlan(plan.id) }}
                style={[s.planCard, active && s.planCardActive]}
              >
                {plan.badge && (
                  <View style={[s.planBadge, plan.badge === 'Best' && s.planBadgeBest]}>
                    <Text style={s.planBadgeText}>{plan.badge}</Text>
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={[s.planLabel, active && s.planLabelActive]}>{plan.label}</Text>
                  <Text style={s.planPriceRow}>
                    <Text style={[s.planPrice, active && s.planPriceActive]}>{plan.price}</Text>
                    <Text style={s.planSub}> {plan.sub}</Text>
                  </Text>
                </View>
                <View style={[s.radio, active && s.radioActive]}>
                  {active && <View style={s.radioDot} />}
                </View>
              </Pressable>
            )
          })}
        </View>

        <Button
          title={activating ? 'Activation…' : `Activer · ${PLANS.find((p) => p.id === selectedPlan)?.price}`}
          onPress={handleActivate}
          disabled={activating}
          style={s.cta}
        />

        <Text style={s.legal}>
          Sans engagement. Annulable à tout moment. Paiement sécurisé via App Store / Google Play.
          {user?.email ? `\nCompte: ${user.email}` : ''}
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: colors.beigePale },
  header:     { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 16, paddingVertical: 8 },
  closeBtn:   { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', ...shadow.sm },
  content:    { paddingHorizontal: 16, paddingBottom: 40, gap: 18 },
  hero:       { borderRadius: radius.lg, padding: 24, alignItems: 'center', gap: 6, ...shadow.dark },
  crown:      { fontSize: 44 },
  heroTitle:  { fontSize: 26, fontWeight: '800', color: colors.white },
  heroSub:    { fontSize: 14, color: 'rgba(255,255,255,0.9)', textAlign: 'center', lineHeight: 20 },
  contextNote: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.orangeLight, borderLeftWidth: 3, borderLeftColor: colors.orange, paddingHorizontal: 14, paddingVertical: 10, borderRadius: radius.md },
  contextNoteText: { flex: 1, fontSize: 12, color: colors.gray[800], fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.dark, marginTop: 4 },
  featureList:  { gap: 12, backgroundColor: colors.white, borderRadius: radius.lg, padding: 16 },
  featureRow:   { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureIcon:  { fontSize: 24, width: 32, textAlign: 'center' },
  featureTitle: { fontSize: 14, fontWeight: '700', color: colors.dark },
  featureDesc:  { fontSize: 12, color: colors.gray[600], marginTop: 2 },
  plansList:    { gap: 10 },
  planCard:     { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.lg, padding: 16, borderWidth: 1.5, borderColor: colors.gray[200] },
  planCardActive: { borderColor: colors.green, backgroundColor: colors.greenLight },
  planBadge:    { position: 'absolute', top: -8, left: 16, backgroundColor: colors.orange, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  planBadgeBest: { backgroundColor: colors.greenDark },
  planBadgeText: { fontSize: 10, fontWeight: '700', color: colors.white, textTransform: 'uppercase', letterSpacing: 0.5 },
  planLabel:    { fontSize: 15, fontWeight: '700', color: colors.gray[700] },
  planLabelActive: { color: colors.greenDark },
  planPriceRow: { marginTop: 4 },
  planPrice:    { fontSize: 18, fontWeight: '800', color: colors.dark },
  planPriceActive: { color: colors.greenDark },
  planSub:      { fontSize: 13, color: colors.gray[500], fontWeight: '500' },
  radio:        { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.gray[300], alignItems: 'center', justifyContent: 'center' },
  radioActive:  { borderColor: colors.green },
  radioDot:     { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.green },
  cta:          { marginTop: 8 },
  legal:        { fontSize: 11, color: colors.gray[500], textAlign: 'center', lineHeight: 16 },
})
