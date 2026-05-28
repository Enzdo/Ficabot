import { useEffect, useMemo, useState } from 'react'
import { Dimensions, FlatList, Image, Pressable, ScrollView, StyleSheet, Text, View, RefreshControl } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useBlogStore, type BlogPost } from '@/stores/blog'
import { usePetsStore } from '@/stores/pets'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { colors, radius, shadow } from '@/constants/theme'

const { width: SCREEN_W } = Dimensions.get('window')
const CARD_W = Math.round(SCREEN_W * 0.78)
const CARD_GAP = 12

const ALL = '__all__'

export default function BlogIndexScreen() {
  const { posts, loading, fetchPosts } = useBlogStore()
  const { pets } = usePetsStore()
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL)

  const speciesFilter = useMemo(() => {
    const set = new Set<string>()
    for (const p of pets) set.add(p.species)
    return Array.from(set)
  }, [pets])

  useEffect(() => {
    fetchPosts({ species: speciesFilter.length > 0 ? speciesFilter : undefined })
  }, [fetchPosts, speciesFilter.join(',')])

  // Unique categories from current posts
  const categories = useMemo(() => {
    const set = new Set<string>()
    for (const p of posts) set.add(p.category)
    return Array.from(set)
  }, [posts])

  // Posts filtered by current category selection
  const filtered = useMemo(
    () => (selectedCategory === ALL ? posts : posts.filter((p) => p.category === selectedCategory)),
    [posts, selectedCategory]
  )

  const featured = filtered[0]
  const carouselPosts = filtered.slice(1)

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.gray[700]} />
        </Pressable>
        <Text style={s.headerTitle}>Blog & conseils</Text>
        <View style={{ width: 36 }} />
      </View>

      {speciesFilter.length > 0 && (
        <View style={s.filterBar}>
          <Ionicons name="filter" size={14} color={colors.greenDark} />
          <Text style={s.filterText}>
            Articles pour : {speciesFilter.map((sp) => sp === 'dog' ? 'chien' : sp === 'cat' ? 'chat' : 'NAC').join(', ')}
          </Text>
        </View>
      )}

      {/* Category pills */}
      {categories.length > 0 && (
        <View style={s.pillsWrap}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.pillsRow}>
            <CategoryPill
              label="Tous"
              count={posts.length}
              active={selectedCategory === ALL}
              onPress={() => { Haptics.selectionAsync(); setSelectedCategory(ALL) }}
            />
            {categories.map((cat) => (
              <CategoryPill
                key={cat}
                label={cat}
                count={posts.filter((p) => p.category === cat).length}
                active={selectedCategory === cat}
                onPress={() => { Haptics.selectionAsync(); setSelectedCategory(cat) }}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {loading && posts.length === 0 ? (
        <LoadingSpinner fullScreen />
      ) : (
        <ScrollView
          contentContainerStyle={s.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => fetchPosts({ species: speciesFilter.length > 0 ? speciesFilter : undefined })}
              tintColor={colors.green}
            />
          }
        >
          {filtered.length === 0 ? (
            <View style={s.empty}>
              <Text style={s.emptyEmoji}>📚</Text>
              <Text style={s.emptyTitle}>Aucun article</Text>
              <Text style={s.emptyDesc}>{selectedCategory === ALL ? 'Les conseils arrivent bientôt' : `Pas d'article dans "${selectedCategory}"`}</Text>
            </View>
          ) : (
            <>
              {/* Featured */}
              {featured && (
                <Pressable
                  onPress={() => { Haptics.selectionAsync(); router.push(`/blog/${featured.slug}`) }}
                  style={[s.featuredCard, shadow.dark]}
                >
                  {featured.image && <Image source={{ uri: featured.image }} style={s.featuredImg} />}
                  <View style={s.featuredOverlay} />
                  <View style={s.featuredContent}>
                    <View style={s.categoryPillFeat}>
                      <Text style={s.categoryPillFeatText}>{featured.category}</Text>
                    </View>
                    <Text style={s.featuredTitle} numberOfLines={3}>{featured.title}</Text>
                    <Text style={s.featuredExcerpt} numberOfLines={2}>{featured.excerpt}</Text>
                    <Text style={s.featuredMeta}>{featured.author}{featured.readTime ? ` · ${featured.readTime}` : ''}</Text>
                  </View>
                </Pressable>
              )}

              {/* Carousel of remaining posts */}
              {carouselPosts.length > 0 && (
                <View style={s.carouselSection}>
                  <View style={s.carouselHeader}>
                    <Text style={s.sectionTitle}>
                      {selectedCategory === ALL ? 'À découvrir' : selectedCategory}
                    </Text>
                    <Text style={s.sectionCount}>{carouselPosts.length} articles</Text>
                  </View>
                  <FlatList
                    data={carouselPosts}
                    keyExtractor={(item) => item.slug}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    snapToInterval={CARD_W + CARD_GAP}
                    decelerationRate="fast"
                    contentContainerStyle={s.carouselContent}
                    renderItem={({ item }) => <CarouselCard post={item} />}
                  />
                </View>
              )}
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

function CategoryPill({ label, count, active, onPress }: { label: string; count: number; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[s.pill, active && s.pillActive]}>
      <Text style={[s.pillText, active && s.pillTextActive]}>{label}</Text>
      <View style={[s.pillBadge, active && s.pillBadgeActive]}>
        <Text style={[s.pillBadgeText, active && s.pillBadgeTextActive]}>{count}</Text>
      </View>
    </Pressable>
  )
}

function CarouselCard({ post }: { post: BlogPost }) {
  return (
    <Pressable
      onPress={() => { Haptics.selectionAsync(); router.push(`/blog/${post.slug}`) }}
      style={[s.card, shadow.sm]}
    >
      {post.image && <Image source={{ uri: post.image }} style={s.cardImg} />}
      <View style={s.cardBody}>
        <Text style={s.cardCategory}>{post.category}</Text>
        <Text style={s.cardTitle} numberOfLines={2}>{post.title}</Text>
        <Text style={s.cardExcerpt} numberOfLines={3}>{post.excerpt}</Text>
        <View style={s.cardFooter}>
          <Text style={s.cardMeta} numberOfLines={1}>{post.author}</Text>
          {post.readTime && <Text style={s.cardReadTime}>· {post.readTime}</Text>}
        </View>
      </View>
    </Pressable>
  )
}

const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: colors.beigePale },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn:     { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', ...shadow.sm },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.dark },

  filterBar:   { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: colors.greenLight, marginHorizontal: 16, borderRadius: radius.md, marginBottom: 8 },
  filterText:  { flex: 1, fontSize: 12, color: colors.greenDark, fontWeight: '600' },

  pillsWrap:   { paddingVertical: 8 },
  pillsRow:    { paddingHorizontal: 16, gap: 8, flexDirection: 'row' },
  pill:        { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.white, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.full, borderWidth: 1, borderColor: colors.gray[200] },
  pillActive:  { backgroundColor: colors.greenDark, borderColor: colors.greenDark },
  pillText:    { fontSize: 13, fontWeight: '600', color: colors.gray[700] },
  pillTextActive: { color: colors.white },
  pillBadge:   { backgroundColor: colors.gray[100], paddingHorizontal: 7, paddingVertical: 1, borderRadius: 10, minWidth: 22, alignItems: 'center' },
  pillBadgeActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  pillBadgeText:   { fontSize: 11, fontWeight: '700', color: colors.gray[600] },
  pillBadgeTextActive: { color: colors.white },

  content:     { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 40, gap: 20 },
  empty:       { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyEmoji:  { fontSize: 48 },
  emptyTitle:  { fontSize: 16, fontWeight: '700', color: colors.dark },
  emptyDesc:   { fontSize: 13, color: colors.gray[500], textAlign: 'center', paddingHorizontal: 20 },

  // Featured
  featuredCard:     { borderRadius: radius.lg, overflow: 'hidden', height: 260, backgroundColor: colors.dark },
  featuredImg:      { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  featuredOverlay:  { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  featuredContent:  { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 18 },
  categoryPillFeat: { alignSelf: 'flex-start', backgroundColor: colors.green, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginBottom: 8 },
  categoryPillFeatText: { fontSize: 10, fontWeight: '700', color: colors.white, textTransform: 'uppercase', letterSpacing: 0.5 },
  featuredTitle:    { fontSize: 20, fontWeight: '700', color: colors.white, marginBottom: 6, lineHeight: 26 },
  featuredExcerpt:  { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginBottom: 8, lineHeight: 18 },
  featuredMeta:     { fontSize: 11, color: 'rgba(255,255,255,0.7)' },

  // Carousel section
  carouselSection: { gap: 12 },
  carouselHeader:  { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  sectionTitle:    { fontSize: 17, fontWeight: '700', color: colors.dark },
  sectionCount:    { fontSize: 12, color: colors.gray[500], fontWeight: '600' },
  carouselContent: { paddingRight: 16, gap: CARD_GAP },

  // Carousel card
  card:         { width: CARD_W, backgroundColor: colors.white, borderRadius: radius.lg, overflow: 'hidden' },
  cardImg:      { width: '100%', height: 140, backgroundColor: colors.gray[200] },
  cardBody:     { padding: 14, gap: 4 },
  cardCategory: { fontSize: 10, fontWeight: '700', color: colors.green, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  cardTitle:    { fontSize: 15, fontWeight: '700', color: colors.dark, lineHeight: 20, marginBottom: 4 },
  cardExcerpt:  { fontSize: 12, color: colors.gray[600], lineHeight: 17, marginBottom: 6 },
  cardFooter:   { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 'auto' },
  cardMeta:     { fontSize: 11, color: colors.gray[500], fontWeight: '600', flex: 1 },
  cardReadTime: { fontSize: 11, color: colors.gray[400] },
})
