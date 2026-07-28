import { useCallback, useEffect, useState } from 'react'
import { Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'
import type { Href } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import { useAuthStore } from '@/stores/auth'
import { usePetsStore } from '@/stores/pets'
import { useExpensesStore } from '@/stores/expenses'
import { api, secureStorage } from '@/services/api'
import { colors, radius, shadow } from '@/constants/theme'
import { describeStage, getEducationTopics, getLifeStage, getPetProfile, getStageTips, resolveKind } from '@/constants/petProfiles'
import type { EducationTopic, Tip } from '@/constants/petProfiles'
import { DetailSheet } from '@/components/ui/DetailSheet'
import { describeWeather, fetchWeather, type Weather } from '@/services/weather'
import { getWeatherAdvice } from '@/constants/weatherAdvice'
import type { VetAppointment, Reminder } from '@/types'

type MonthlyTip = { id: number; species: string; month: number; title: string; body: string; emoji: string | null }
type RecommendedPost = { id: number; slug: string; title: string; excerpt: string; category: string; image?: string | null; readTime?: string | null; reason?: string | null }

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CAT_COLORS: Record<string, string> = {
  vet: colors.blue, food: colors.green, grooming: colors.orange,
  medication: colors.red, accessories: colors.beige, insurance: colors.gray[600], other: colors.gray[400],
}

function daysUntil(dateStr: string) {
  const now  = new Date(); now.setHours(0, 0, 0, 0)
  const then = new Date(dateStr); then.setHours(0, 0, 0, 0)
  return Math.round((then.getTime() - now.getTime()) / 86400000)
}

function friendlyDate(dateStr: string) {
  const d    = new Date(dateStr)
  const days = daysUntil(dateStr)
  if (days === 0) return "Aujourd'hui"
  if (days === 1) return 'Demain'
  if (days === -1) return 'Hier'
  if (days > 0 && days <= 7) return `Dans ${days} jours`
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const user                          = useAuthStore((s) => s.user)
  const userId                        = useAuthStore((s) => s.user?.id)
  const { pets, loading, fetchPets }  = usePetsStore()
  const { expenses, fetchExpenses }   = useExpensesStore()

  const [nextAppt,    setNextAppt]    = useState<VetAppointment | null>(null)
  const [reminders,   setReminders]   = useState<Reminder[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [tips,        setTips]        = useState<MonthlyTip[]>([])
  const [recommended, setRecommended] = useState<RecommendedPost[]>([])
  const [season,      setSeason]      = useState<'winter'|'spring'|'summer'|'autumn'|null>(null)
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null)
  // Conseil ou sujet d'éducation ouvert en lecture.
  const [openDetail, setOpenDetail] = useState<(Tip | EducationTopic) | null>(null)
  const [weather, setWeather] = useState<Weather | null>(null)

  const load = useCallback(async () => {
    setLoadingData(true)
    await Promise.all([
      fetchPets(),
      fetchExpenses(),
      (async () => {
        const r = await api.get<VetAppointment[]>('/appointments')
        if (r.success && r.data) {
          const upcoming = r.data
            .filter((a) => new Date(a.appointmentDate) >= new Date() && a.status !== 'cancelled')
            .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())
          setNextAppt(upcoming[0] ?? null)
        }
      })(),
      (async () => {
        const r = await api.get<Reminder[]>('/reminders')
        if (r.success && r.data) {
          setReminders(r.data.filter((rem) => !rem.isCompleted && daysUntil(rem.dueDate) <= 7).slice(0, 4))
        }
      })(),
    ])
    setLoadingData(false)
  }, [fetchPets, fetchExpenses])

  // Animal mis en avant : restauré depuis le stockage, sinon le plus récent.
  useEffect(() => {
    if (!userId || pets.length === 0) return
    let cancelled = false
    secureStorage.getHomePet(userId).then((saved) => {
      if (cancelled) return
      setSelectedPetId((current) => {
        if (current && pets.some((p) => p.id === current)) return current
        if (saved && pets.some((p) => p.id === saved)) return saved
        return pets[0].id
      })
    })
    return () => { cancelled = true }
  }, [userId, pets])

  const selectedPet = pets.find((p) => p.id === selectedPetId) ?? pets[0] ?? null

  const selectPet = useCallback((petId: string) => {
    Haptics.selectionAsync()
    setSelectedPetId(petId)
    if (userId) secureStorage.setHomePet(userId, petId)
  }, [userId])

  // Conseils du mois et articles recommandés : cadrés sur l'animal sélectionné.
  useEffect(() => {
    if (!selectedPet) { setTips([]); setRecommended([]); return }
    const month = new Date().getMonth() + 1
    api
      .get<MonthlyTip[]>(`/tips?species=${selectedPet.species}&month=${month}`)
      .then((r) => { if (r.success && r.data) setTips(r.data) })
    const stage = getLifeStage(resolveKind(selectedPet), selectedPet.birthDate).key
    const breed = selectedPet.breed ? `&breed=${encodeURIComponent(selectedPet.breed)}` : ''
    api
      .get<RecommendedPost[]>(
        `/blog/recommended?species=${selectedPet.species}&month=${month}&stage=${stage}${breed}&limit=6`
      )
      .then((r) => {
        if (r.success && r.data) setRecommended(r.data)
        const meta = (r as any)?.meta
        if (meta?.season) setSeason(meta.season)
      })
  }, [selectedPet?.id, selectedPet?.species, selectedPet?.breed, selectedPet?.birthDate])

  // Météo du lieu de vie : mise en cache une heure côté service.
  useEffect(() => {
    if (user?.latitude == null || user?.longitude == null) { setWeather(null); return }
    let cancelled = false
    fetchWeather(user.latitude, user.longitude).then((w) => { if (!cancelled) setWeather(w) })
    return () => { cancelled = true }
  }, [user?.latitude, user?.longitude])

  useEffect(() => { load() }, [load])

  // Budget du mois
  const now          = new Date()
  const monthlyTotal = expenses
    .filter((e) => { const d = new Date(e.expenseDate); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() })
    .reduce((s, e) => s + Number(e.amount), 0)

  const topCategories = Object.entries(
    expenses
      .filter((e) => { const d = new Date(e.expenseDate); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() })
      .reduce<Record<string, number>>((acc, e) => { acc[e.category] = (acc[e.category] ?? 0) + Number(e.amount); return acc }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 3)

  // Greeting — prénom et nom, jamais l'email : on préfère saluer sans nom.
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ')
  const hour        = now.getHours()
  const greeting    = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'

  // L'accueil s'habille aux couleurs de l'animal sélectionné et affiche
  // les conseils correspondant à son espèce et à son stade de vie.
  const heroProfile  = selectedPet ? getPetProfile(selectedPet) : null
  const stageTips    = selectedPet ? getStageTips(selectedPet) : []
  const education    = selectedPet ? getEducationTopics(selectedPet) : []

  const weatherAdvice = weather && selectedPet
    ? getWeatherAdvice({
        weather,
        kind: resolveKind(selectedPet),
        stage: getLifeStage(resolveKind(selectedPet), selectedPet.birthDate).key,
        name: selectedPet.name,
      })
    : []

  const isRefreshing = loading || loadingData

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={load} tintColor={colors.green} />}
      >

        {/* ── Greeting ── */}
        {selectedPet && heroProfile ? (
          <LinearGradient
            colors={heroProfile.gradient}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={s.hero}
          >
            <View style={s.greeting}>
              <View style={s.greetingText}>
                {displayName ? (
                  <>
                    <Text style={s.greetingLine}>{greeting},</Text>
                    <Text style={s.greetingName} numberOfLines={1}>{displayName} 👋</Text>
                  </>
                ) : (
                  <Text style={s.greetingName}>{greeting} 👋</Text>
                )}
              </View>
              <Pressable
                onPress={() => { Haptics.selectionAsync(); router.push(`/(tabs)/pets/${selectedPet.id}`) }}
                style={({ pressed }) => [s.heroAvatar, shadow.sm, pressed && s.pressed]}
              >
                <Text style={s.heroAvatarEmoji}>{heroProfile.emoji}</Text>
              </Pressable>
            </View>

            {/* Sélecteur : n'apparaît qu'à partir de deux animaux */}
            {pets.length > 1 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.switchRow}>
                {pets.map((pet) => {
                  const active = pet.id === selectedPet.id
                  const profile = getPetProfile(pet)
                  return (
                    <Pressable
                      key={pet.id}
                      onPress={() => selectPet(pet.id)}
                      style={({ pressed }) => [
                        s.switchChip,
                        active && { backgroundColor: colors.white, borderColor: profile.accent },
                        pressed && s.pressed,
                      ]}
                    >
                      <Text style={s.switchEmoji}>{profile.emoji}</Text>
                      <Text style={[s.switchName, active && { color: colors.dark, fontWeight: '800' }]} numberOfLines={1}>
                        {pet.name}
                      </Text>
                    </Pressable>
                  )
                })}
              </ScrollView>
            )}

            <View style={s.heroFooter}>
              <View style={[s.heroBadge, { backgroundColor: heroProfile.accent }]}>
                <Text style={s.heroBadgeText} numberOfLines={1}>
                  {selectedPet.name} · {describeStage(selectedPet)}
                </Text>
              </View>
              <View style={s.aiPill}>
                <View style={s.aiDot} />
                <Text style={s.aiPillText}>IA prête</Text>
              </View>
            </View>
          </LinearGradient>
        ) : (
          <View style={s.greeting}>
            <View style={s.greetingText}>
              {displayName ? (
                <>
                  <Text style={s.greetingLine}>{greeting},</Text>
                  <Text style={s.greetingName} numberOfLines={1}>{displayName} 👋</Text>
                </>
              ) : (
                <Text style={s.greetingName}>{greeting} 👋</Text>
              )}
            </View>
            <View style={s.aiPill}>
              <View style={s.aiDot} />
              <Text style={s.aiPillText}>IA prête</Text>
            </View>
          </View>
        )}

        {/* ── Mes animaux ── */}
        <View>
          <View style={s.sectionRow}>
            <Text style={s.sectionTitle}>Mes animaux</Text>
            <Pressable onPress={() => router.push('/(tabs)/pets')} style={s.seeAll}>
              <Text style={s.seeAllText}>Voir tout</Text>
              <Ionicons name="chevron-forward" size={13} color={colors.green} />
            </Pressable>
          </View>

          {pets.length === 0 ? (
            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push('/pet-setup' as Href) }}
              style={({ pressed }) => [s.emptyPets, pressed && s.pressed]}
            >
              <Text style={s.emptyPetsEmoji}>🐾</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.emptyPetsTitle}>Aucun animal pour l'instant</Text>
                <Text style={s.emptyPetsSub}>Répondez à quelques questions, on s'occupe du reste</Text>
              </View>
              <Ionicons name="add-circle" size={28} color={colors.green} />
            </Pressable>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.petRow}>
              {pets.map((pet) => {
                const petProfile = getPetProfile(pet)
                return (
                  <Pressable
                    key={pet.id}
                    onPress={() => { Haptics.selectionAsync(); router.push(`/(tabs)/pets/${pet.id}`) }}
                    style={({ pressed }) => [s.petCard, shadow.sm, pressed && s.pressed]}
                  >
                    <View style={[s.petAvatar, { backgroundColor: petProfile.accentSoft }]}>
                      <Text style={s.petEmoji}>{petProfile.emoji}</Text>
                    </View>
                    <Text style={s.petName} numberOfLines={1}>{pet.name}</Text>
                    <Text style={s.petBreed} numberOfLines={1}>{petProfile.label}</Text>
                  </Pressable>
                )
              })}
              <Pressable
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push('/(tabs)/pets') }}
                style={({ pressed }) => [s.petCardAdd, pressed && s.pressed]}
              >
                <View style={s.petAddIcon}>
                  <Ionicons name="add" size={22} color={colors.green} />
                </View>
                <Text style={s.petAddLabel}>Ajouter</Text>
              </Pressable>
            </ScrollView>
          )}
        </View>

        {/* ── Météo du jour traduite en conseils ── */}
        {weather && selectedPet && heroProfile && weatherAdvice.length > 0 && (
          <View>
            <View style={s.sectionRow}>
              <Text style={s.sectionTitle} numberOfLines={1}>
                Aujourd'hui{user?.city ? ` à ${user.city}` : ''}
              </Text>
              <View style={s.weatherNow}>
                <Text style={s.weatherEmoji}>{describeWeather(weather.code).emoji}</Text>
                <Text style={s.weatherTemp}>{weather.temperature}°</Text>
              </View>
            </View>

            <View style={s.weatherMeta}>
              <Text style={s.weatherMetaText}>
                {describeWeather(weather.code).label} · {weather.tempMin}° / {weather.tempMax}°
                {weather.windSpeed >= 20 ? ` · vent ${weather.windSpeed} km/h` : ''}
                {weather.uvIndex >= 6 ? ` · UV ${weather.uvIndex}` : ''}
              </Text>
            </View>

            <View style={s.eduList}>
              {weatherAdvice.map((advice) => (
                <View
                  key={advice.title}
                  style={[
                    s.weatherCard,
                    shadow.sm,
                    advice.priority === 3 && { borderColor: colors.red, backgroundColor: colors.redLight },
                  ]}
                >
                  <Text style={s.weatherAdviceEmoji}>{advice.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={s.weatherAdviceTitle}>{advice.title}</Text>
                    <Text style={s.weatherAdviceBody}>{advice.body}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Éducation, selon l'espèce et le stade de vie ── */}
        {selectedPet && heroProfile && education.length > 0 && (
          <View>
            <View style={s.sectionRow}>
              <Text style={s.sectionTitle}>Éducation</Text>
              <View style={[s.stageBadge, { backgroundColor: heroProfile.accentSoft }]}>
                <Text style={[s.stageBadgeText, { color: heroProfile.accent }]}>
                  {getLifeStage(resolveKind(selectedPet), selectedPet.birthDate).label}
                </Text>
              </View>
            </View>
            <View style={s.eduList}>
              {education.map((topic) => (
                <Pressable
                  key={topic.title}
                  onPress={() => { Haptics.selectionAsync(); setOpenDetail(topic) }}
                  style={({ pressed }) => [s.eduCard, shadow.sm, pressed && s.pressed]}
                >
                  <View style={[s.eduIcon, { backgroundColor: heroProfile.accentSoft }]}>
                    <Text style={s.eduEmoji}>{topic.emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.eduTitle}>{topic.title}</Text>
                    <Text style={s.eduBody} numberOfLines={2}>{topic.body}</Text>
                    <Text style={[s.eduSteps, { color: heroProfile.accent }]}>
                      {topic.steps.length} étapes · le pourquoi
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.gray[300]} />
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* ── Conseils selon l'espèce et le stade de vie ── */}
        {selectedPet && heroProfile && stageTips.length > 0 && (
          <View>
            <View style={s.sectionRow}>
              <Text style={s.sectionTitle}>Pour {selectedPet.name}</Text>
              <View style={[s.stageBadge, { backgroundColor: heroProfile.accentSoft }]}>
                <Text style={[s.stageBadgeText, { color: heroProfile.accent }]}>{describeStage(selectedPet)}</Text>
              </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.stageRow}>
              {stageTips.map((tip) => (
                <Pressable
                  key={tip.title}
                  onPress={() => { Haptics.selectionAsync(); setOpenDetail(tip) }}
                  style={({ pressed }) => [s.stageCard, shadow.sm, { borderColor: heroProfile.accentSoft }, pressed && s.pressed]}
                >
                  <View style={[s.stageIcon, { backgroundColor: heroProfile.accentSoft }]}>
                    <Text style={s.stageEmoji}>{tip.emoji}</Text>
                  </View>
                  <Text style={s.stageTitle} numberOfLines={3}>{tip.title}</Text>
                  <Text style={s.stageBody} numberOfLines={3}>{tip.body}</Text>
                  <Text style={[s.stageMore, { color: heroProfile.accent }]}>Pourquoi ? →</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── Recommandé pour vous (saison × espèce) ── */}
        {recommended.length > 0 && (
          <View>
            <View style={s.sectionRow}>
              <Text style={s.sectionTitle} numberOfLines={1}>
                {selectedPet ? `Pour ${selectedPet.name}` : 'Recommandé pour vous'}
                {season === 'winter' ? ' cet hiver ❄️'
                 : season === 'spring' ? ' ce printemps 🌷'
                 : season === 'summer' ? ' cet été ☀️'
                 : season === 'autumn' ? ' cet automne 🍂' : ''}
              </Text>
              <Pressable onPress={() => router.push('/blog')} style={s.seeAll}>
                <Text style={s.seeAllText}>Voir tout</Text>
                <Ionicons name="chevron-forward" size={13} color={colors.green} />
              </Pressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.recoRow}>
              {recommended.map((post) => (
                <Pressable
                  key={post.slug}
                  onPress={() => { Haptics.selectionAsync(); router.push(`/blog/${post.slug}`) }}
                  style={[s.recoCard, shadow.sm]}
                >
                  {post.image && <Image source={{ uri: post.image }} style={s.recoImg} />}
                  <View style={s.recoBody}>
                    <View style={s.recoTop}>
                      <Text style={s.recoCategory} numberOfLines={1}>{post.category}</Text>
                      {post.reason && heroProfile && (
                        <View style={[s.recoReason, { backgroundColor: heroProfile.accentSoft }]}>
                          <Text style={[s.recoReasonText, { color: heroProfile.accent }]} numberOfLines={1}>
                            {post.reason}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={s.recoTitle} numberOfLines={2}>{post.title}</Text>
                    {post.readTime && <Text style={s.recoMeta}>📖 {post.readTime}</Text>}
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── Conseils du mois ── */}
        {tips.length > 0 && (
          <View>
            <View style={s.sectionRow}>
              <Text style={s.sectionTitle}>Conseil du mois</Text>
              <Pressable onPress={() => router.push('/blog')} style={s.seeAll}>
                <Text style={s.seeAllText}>Tous les conseils</Text>
                <Ionicons name="chevron-forward" size={13} color={colors.green} />
              </Pressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tipsRow}>
              {tips.map((tip) => (
                <View key={tip.id} style={[s.tipCard, shadow.sm]}>
                  <View style={s.tipHeader}>
                    <Text style={s.tipEmoji}>{tip.emoji ?? '💡'}</Text>
                    <View style={s.tipSpeciesBadge}>
                      <Text style={s.tipSpeciesText}>
                        {tip.species === 'dog' ? 'Chien' : tip.species === 'cat' ? 'Chat' : 'NAC'}
                      </Text>
                    </View>
                  </View>
                  <Text style={s.tipTitle} numberOfLines={2}>{tip.title}</Text>
                  <Text style={s.tipBody} numberOfLines={5}>{tip.body}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── Prochain rendez-vous ── */}
        <View>
          <View style={s.sectionRow}>
            <Text style={s.sectionTitle}>Prochain rendez-vous</Text>
            <Pressable onPress={() => router.push('/(tabs)/appointments')} style={s.seeAll}>
              <Text style={s.seeAllText}>Tous les RDV</Text>
              <Ionicons name="chevron-forward" size={13} color={colors.green} />
            </Pressable>
          </View>

          {nextAppt ? (
            <Pressable
              onPress={() => { Haptics.selectionAsync(); router.push('/(tabs)/appointments') }}
              style={({ pressed }) => [s.apptCard, shadow.sm, pressed && s.pressed]}
            >
              <LinearGradient
                colors={['#EFF6FF', '#DBEAFE']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={s.apptIconWrap}
              >
                <Text style={s.apptIcon}>📅</Text>
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={s.apptReason} numberOfLines={1}>{nextAppt.title}</Text>
                <Text style={s.apptMeta}>
                  {friendlyDate(nextAppt.appointmentDate)}
                  {nextAppt.vetName ? ` · ${nextAppt.vetName}` : ''}
                  {nextAppt.pet ? ` · ${nextAppt.pet.name}` : ''}
                </Text>
              </View>
              <View style={[s.apptBadge, daysUntil(nextAppt.appointmentDate) <= 1 && s.apptBadgeUrgent]}>
                <Text style={[s.apptBadgeText, daysUntil(nextAppt.appointmentDate) <= 1 && s.apptBadgeTextUrgent]}>
                  {friendlyDate(nextAppt.appointmentDate)}
                </Text>
              </View>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push('/(tabs)/appointments') }}
              style={({ pressed }) => [s.emptyWidget, pressed && s.pressed]}
            >
              <Text style={s.emptyWidgetEmoji}>📅</Text>
              <Text style={s.emptyWidgetText}>Aucun rendez-vous à venir</Text>
              <View style={s.emptyWidgetCta}>
                <Text style={s.emptyWidgetCtaText}>En planifier un</Text>
                <Ionicons name="arrow-forward" size={13} color={colors.green} />
              </View>
            </Pressable>
          )}
        </View>

        {/* ── Rappels proches ── */}
        {reminders.length > 0 && (
          <View>
            <View style={s.sectionRow}>
              <Text style={s.sectionTitle}>Rappels</Text>
              <Pressable onPress={() => router.push('/(tabs)/appointments')} style={s.seeAll}>
                <Text style={s.seeAllText}>Voir tout</Text>
                <Ionicons name="chevron-forward" size={13} color={colors.green} />
              </Pressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.reminderRow}>
              {reminders.map((rem) => {
                const days    = daysUntil(rem.dueDate)
                const overdue = days < 0
                const today   = days === 0
                return (
                  <Pressable
                    key={rem.id}
                    onPress={() => { Haptics.selectionAsync(); router.push('/(tabs)/appointments') }}
                    style={({ pressed }) => [s.reminderCard, shadow.sm, overdue && s.reminderCardOverdue, pressed && s.pressed]}
                  >
                    <Text style={s.reminderEmoji}>🔔</Text>
                    <Text style={s.reminderTitle} numberOfLines={2}>{rem.title}</Text>
                    <Text style={[s.reminderDue, overdue && s.reminderDueOverdue, today && s.reminderDueToday]}>
                      {overdue ? `En retard de ${Math.abs(days)}j` : today ? "Aujourd'hui" : `Dans ${days}j`}
                    </Text>
                  </Pressable>
                )
              })}
            </ScrollView>
          </View>
        )}

        {/* ── Budget du mois ── */}
        <View>
          <View style={s.sectionRow}>
            <Text style={s.sectionTitle}>Budget ce mois</Text>
            <Pressable onPress={() => router.push('/(tabs)/expenses' as never)} style={s.seeAll}>
              <Text style={s.seeAllText}>Voir le détail</Text>
              <Ionicons name="chevron-forward" size={13} color={colors.green} />
            </Pressable>
          </View>

          <Pressable
            onPress={() => { Haptics.selectionAsync(); router.push('/(tabs)/expenses' as never) }}
            style={({ pressed }) => [s.budgetCard, shadow.sm, pressed && s.pressed]}
          >
            {monthlyTotal === 0 ? (
              <View style={s.budgetEmpty}>
                <Text style={s.budgetEmptyEmoji}>💰</Text>
                <Text style={s.budgetEmptyText}>Aucune dépense ce mois-ci</Text>
                <View style={s.emptyWidgetCta}>
                  <Text style={s.emptyWidgetCtaText}>En ajouter une</Text>
                  <Ionicons name="arrow-forward" size={13} color={colors.green} />
                </View>
              </View>
            ) : (
              <View style={s.budgetContent}>
                <View style={s.budgetLeft}>
                  <Text style={s.budgetAmount}>
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(monthlyTotal)}
                  </Text>
                  <Text style={s.budgetSub}>ce mois</Text>
                </View>
                <View style={s.budgetCats}>
                  {topCategories.map(([cat, amt]) => (
                    <View key={cat} style={s.budgetCatRow}>
                      <View style={[s.budgetCatDot, { backgroundColor: CAT_COLORS[cat] ?? colors.gray[400] }]} />
                      <Text style={s.budgetCatLabel} numberOfLines={1}>
                        {cat === 'vet' ? 'Vétérinaire' : cat === 'food' ? 'Alimentation' : cat === 'grooming' ? 'Toilettage' : cat === 'medication' ? 'Médicaments' : cat}
                      </Text>
                      <Text style={s.budgetCatAmt}>{amt.toFixed(0)}€</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </Pressable>
        </View>

        {/* ── Assistant IA ── */}
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push('/(tabs)/chat') }}
          style={({ pressed }) => [pressed && s.pressed]}
        >
          <LinearGradient
            colors={['#1A1614', '#1E2A14', '#1A1614']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={s.aiCard}
          >
            <View style={s.aiGlow} />
            <View style={s.aiCardContent}>
              <View style={s.aiCardLeft}>
                <View style={s.aiCardBadge}>
                  <View style={s.aiDot} />
                  <Text style={s.aiCardBadgeText}>Disponible 24h/24</Text>
                </View>
                <Text style={s.aiCardTitle}>Posez une question{'\n'}à votre assistant</Text>
                <Text style={s.aiCardDesc}>
                  {selectedPet
                    ? `Parlez de ${selectedPet.name}, vaccination, symptômes…`
                    : 'Symptômes, vaccination, alimentation…'}
                </Text>
              </View>
              <View style={s.aiCardIcon}>
                <Text style={{ fontSize: 36 }}>🤖</Text>
              </View>
            </View>
            <View style={s.aiCardCta}>
              <Text style={s.aiCardCtaText}>Commencer une conversation</Text>
              <Ionicons name="arrow-forward" size={14} color={colors.green} />
            </View>
            <LinearGradient
              colors={['transparent', colors.green, 'transparent']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={s.aiAccentLine}
            />
          </LinearGradient>
        </Pressable>

      </ScrollView>

      {openDetail && heroProfile && selectedPet && (
        <DetailSheet
          visible
          onClose={() => setOpenDetail(null)}
          emoji={openDetail.emoji}
          title={openDetail.title}
          body={openDetail.body}
          why={openDetail.why}
          steps={'steps' in openDetail ? openDetail.steps : undefined}
          accent={heroProfile.accent}
          accentSoft={heroProfile.accentSoft}
          context={`${selectedPet.name} · ${describeStage(selectedPet)}`}
        />
      )}
    </SafeAreaView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: colors.beigePale },
  scroll:  { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 40, gap: 28, paddingTop: 16 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.97 }] },

  // Greeting
  hero:          { borderRadius: radius['3xl'], padding: 18, gap: 16 },
  heroAvatar:    { width: 54, height: 54, borderRadius: 27, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  heroAvatarEmoji: { fontSize: 27 },
  heroFooter:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  heroBadge:     { flexShrink: 1, paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.full },
  heroBadgeText: { fontSize: 12, fontWeight: '700', color: colors.white },

  switchRow:   { gap: 8, paddingVertical: 2 },
  switchChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderWidth: 1.5, borderColor: 'transparent',
    maxWidth: 150,
  },
  switchEmoji: { fontSize: 16 },
  switchName:  { fontSize: 13, fontWeight: '600', color: colors.gray[700], flexShrink: 1 },

  greeting:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  greetingText:  { flex: 1, paddingRight: 12 },
  greetingLine:  { fontSize: 15, color: colors.gray[500], fontWeight: '600' },
  greetingName:  { fontSize: 28, fontWeight: '800', color: colors.dark, marginTop: 2 },
  aiPill:        { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.dark, paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.full },
  aiDot:         { width: 7, height: 7, borderRadius: 3.5, backgroundColor: colors.green },
  aiPillText:    { fontSize: 12, fontWeight: '700', color: colors.white },

  // Section header
  sectionRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle:  { fontSize: 18, fontWeight: '800', color: colors.dark },
  seeAll:        { flexDirection: 'row', alignItems: 'center', gap: 2 },
  seeAllText:    { fontSize: 13, fontWeight: '700', color: colors.green },

  // Empty pets
  emptyPets:      { backgroundColor: colors.white, borderRadius: radius['2xl'], padding: 20, flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1.5, borderColor: colors.gray[200], borderStyle: 'dashed' },
  emptyPetsEmoji: { fontSize: 32 },
  emptyPetsTitle: { fontSize: 14, fontWeight: '700', color: colors.dark },
  emptyPetsSub:   { fontSize: 12, color: colors.gray[400], marginTop: 2 },

  // Pet cards (horizontal)
  petRow:    { gap: 12, paddingBottom: 4 },
  petCard:   { width: 90, backgroundColor: colors.white, borderRadius: radius['2xl'], padding: 12, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: colors.gray[200] },
  petAvatar: { width: 52, height: 52, borderRadius: radius.xl, alignItems: 'center', justifyContent: 'center' },
  petEmoji:  { fontSize: 26 },
  petName:   { fontSize: 12, fontWeight: '700', color: colors.dark, textAlign: 'center' },
  petBreed:  { fontSize: 10, color: colors.gray[400], textAlign: 'center' },
  petCardAdd:  { width: 90, borderRadius: radius['2xl'], padding: 12, alignItems: 'center', gap: 6, borderWidth: 1.5, borderColor: colors.gray[200], borderStyle: 'dashed', justifyContent: 'center' },
  petAddIcon:  { width: 52, height: 52, borderRadius: radius.xl, backgroundColor: colors.greenLight, alignItems: 'center', justifyContent: 'center' },
  petAddLabel: { fontSize: 12, fontWeight: '700', color: colors.green, textAlign: 'center' },

  // Appointment widget
  apptCard:    { backgroundColor: colors.white, borderRadius: radius['2xl'], padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: colors.gray[200] },
  apptIconWrap:{ width: 48, height: 48, borderRadius: radius.xl, alignItems: 'center', justifyContent: 'center' },
  apptIcon:    { fontSize: 22 },
  apptReason:  { fontSize: 15, fontWeight: '700', color: colors.dark },
  apptMeta:    { fontSize: 12, color: colors.gray[500], marginTop: 3 },
  apptBadge:   { backgroundColor: colors.blueLight, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.full },
  apptBadgeUrgent:    { backgroundColor: '#FEE2E2' },
  apptBadgeText:      { fontSize: 11, fontWeight: '700', color: colors.blue },
  apptBadgeTextUrgent:{ color: colors.red },

  // Empty widget (generic)
  emptyWidget:     { backgroundColor: colors.white, borderRadius: radius['2xl'], padding: 20, flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1, borderColor: colors.gray[200] },
  emptyWidgetEmoji:{ fontSize: 28 },
  emptyWidgetText: { flex: 1, fontSize: 14, color: colors.gray[500], fontWeight: '500' },
  emptyWidgetCta:  { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  emptyWidgetCtaText: { fontSize: 13, fontWeight: '700', color: colors.green },

  // Reminders
  reminderRow:  { gap: 10, paddingBottom: 4 },
  reminderCard: { width: 130, backgroundColor: colors.white, borderRadius: radius['2xl'], padding: 14, gap: 6, borderWidth: 1, borderColor: colors.gray[200] },
  reminderCardOverdue: { borderColor: '#FCA5A5', backgroundColor: '#FFF5F5' },
  reminderEmoji:   { fontSize: 22 },
  reminderTitle:   { fontSize: 12, fontWeight: '700', color: colors.dark, lineHeight: 16 },
  reminderDue:     { fontSize: 11, fontWeight: '600', color: colors.gray[400] },
  reminderDueOverdue: { color: colors.red },
  reminderDueToday:   { color: colors.orange },

  // Recommended posts (seasonal × species)
  recoRow:         { gap: 12, paddingBottom: 4 },
  recoCard:        { width: 240, backgroundColor: colors.white, borderRadius: radius.lg, overflow: 'hidden' },
  recoImg:         { width: '100%', height: 120, backgroundColor: colors.gray[200] },
  recoBody:        { padding: 12, gap: 4 },
  recoTop:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  recoCategory:    { flexShrink: 1, fontSize: 10, fontWeight: '700', color: colors.green, textTransform: 'uppercase', letterSpacing: 0.5 },
  recoReason:      { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full },
  recoReasonText:  { fontSize: 10, fontWeight: '700' },
  recoTitle:       { fontSize: 14, fontWeight: '700', color: colors.dark, lineHeight: 18 },
  recoMeta:        { fontSize: 11, color: colors.gray[500], marginTop: 4 },

  // Conseils par stade de vie (local, sans appel réseau)
  stageBadge:     { paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.full },
  stageBadgeText: { fontSize: 11, fontWeight: '700' },
  stageRow:       { gap: 12, paddingBottom: 4 },
  stageCard:      { width: 250, backgroundColor: colors.white, borderRadius: radius['2xl'], padding: 16, gap: 8, borderWidth: 1 },
  stageIcon:      { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  stageEmoji:     { fontSize: 20 },
  stageTitle:     { fontSize: 14, fontWeight: '800', color: colors.dark, lineHeight: 19 },
  stageBody:      { fontSize: 12, color: colors.gray[600], lineHeight: 18 },
  stageMore:      { fontSize: 12, fontWeight: '800', marginTop: 2 },

  weatherNow:      { flexDirection: 'row', alignItems: 'center', gap: 6 },
  weatherEmoji:    { fontSize: 20 },
  weatherTemp:     { fontSize: 18, fontWeight: '800', color: colors.dark },
  weatherMeta:     { marginTop: -6, marginBottom: 12 },
  weatherMetaText: { fontSize: 12, color: colors.gray[500], fontWeight: '600' },
  weatherCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: colors.white, borderRadius: radius['2xl'], padding: 16,
    borderWidth: 1.5, borderColor: colors.gray[200],
  },
  weatherAdviceEmoji: { fontSize: 24 },
  weatherAdviceTitle: { fontSize: 14, fontWeight: '800', color: colors.dark, lineHeight: 19 },
  weatherAdviceBody:  { fontSize: 13, color: colors.gray[700], lineHeight: 20, marginTop: 5 },

  eduList:  { gap: 10 },
  eduCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.white, borderRadius: radius['2xl'], padding: 14,
    borderWidth: 1, borderColor: colors.gray[200],
  },
  eduIcon:  { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  eduEmoji: { fontSize: 22 },
  eduTitle: { fontSize: 14, fontWeight: '800', color: colors.dark, lineHeight: 19 },
  eduBody:  { fontSize: 12, color: colors.gray[600], lineHeight: 17, marginTop: 3 },
  eduSteps: { fontSize: 11, fontWeight: '700', marginTop: 5 },

  // Monthly tips
  tipsRow:         { gap: 12, paddingBottom: 4 },
  tipCard:         { width: 280, backgroundColor: colors.white, borderRadius: radius['2xl'], padding: 16, gap: 10, borderWidth: 1, borderColor: colors.greenLight },
  tipHeader:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tipEmoji:        { fontSize: 28 },
  tipSpeciesBadge: { backgroundColor: colors.greenLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  tipSpeciesText:  { fontSize: 10, fontWeight: '700', color: colors.greenDark, textTransform: 'uppercase', letterSpacing: 0.5 },
  tipTitle:        { fontSize: 14, fontWeight: '700', color: colors.dark, lineHeight: 18 },
  tipBody:         { fontSize: 12, color: colors.gray[600], lineHeight: 18 },

  // Budget
  budgetCard:    { backgroundColor: colors.white, borderRadius: radius['2xl'], padding: 18, borderWidth: 1, borderColor: colors.gray[200] },
  budgetEmpty:   { alignItems: 'center', gap: 6 },
  budgetEmptyEmoji: { fontSize: 32 },
  budgetEmptyText:  { fontSize: 14, color: colors.gray[500], fontWeight: '500' },
  budgetContent: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  budgetLeft:    { alignItems: 'flex-start' },
  budgetAmount:  { fontSize: 32, fontWeight: '800', color: colors.dark },
  budgetSub:     { fontSize: 12, color: colors.gray[400], fontWeight: '600', marginTop: 2 },
  budgetCats:    { flex: 1, gap: 6 },
  budgetCatRow:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  budgetCatDot:  { width: 8, height: 8, borderRadius: 4 },
  budgetCatLabel:{ flex: 1, fontSize: 12, color: colors.gray[600], fontWeight: '500' },
  budgetCatAmt:  { fontSize: 12, fontWeight: '700', color: colors.dark },

  // AI card
  aiCard: { borderRadius: radius['3xl'], overflow: 'hidden', padding: 24, position: 'relative' },
  aiGlow: { position: 'absolute', top: -30, right: -10, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(126,177,63,0.10)' },
  aiCardContent: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 },
  aiCardLeft:    { flex: 1 },
  aiCardBadge:   { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  aiCardBadgeText: { fontSize: 11, fontWeight: '700', color: colors.green, letterSpacing: 0.4 },
  aiCardTitle:   { fontSize: 22, fontWeight: '800', color: colors.white, lineHeight: 28 },
  aiCardDesc:    { fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 8 },
  aiCardIcon:    { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(126,177,63,0.15)', alignItems: 'center', justifyContent: 'center' },
  aiCardCta:     { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(126,177,63,0.15)', paddingVertical: 12, paddingHorizontal: 16, borderRadius: radius.xl },
  aiCardCtaText: { flex: 1, fontSize: 14, fontWeight: '700', color: colors.white },
  aiAccentLine:  { position: 'absolute', bottom: 0, left: 0, right: 0, height: 2 },
})
