import { useEffect, useMemo } from 'react'
import { Image, Pressable, ScrollView, StyleSheet, Text, View, RefreshControl } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useBlogStore } from '@/stores/blog'
import { usePetsStore } from '@/stores/pets'
import { Card } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { colors, radius, shadow } from '@/constants/theme'

export default function BlogIndexScreen() {
  const { posts, loading, fetchPosts } = useBlogStore()
  const { pets } = usePetsStore()

  const speciesFilter = useMemo(() => {
    const set = new Set<string>()
    for (const p of pets) set.add(p.species)
    return Array.from(set)
  }, [pets])

  useEffect(() => {
    fetchPosts({ species: speciesFilter.length > 0 ? speciesFilter : undefined })
  }, [fetchPosts, speciesFilter.join(',')])

  const featured = posts[0]
  const rest = posts.slice(1)

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
          {posts.length === 0 ? (
            <View style={s.empty}>
              <Text style={s.emptyEmoji}>📚</Text>
              <Text style={s.emptyTitle}>Aucun article pour le moment</Text>
              <Text style={s.emptyDesc}>Les conseils arrivent bientôt</Text>
            </View>
          ) : (
            <>
              {featured && (
                <Pressable
                  onPress={() => { Haptics.selectionAsync(); router.push(`/blog/${featured.slug}`) }}
                  style={[s.featuredCard, shadow.dark]}
                >
                  {featured.image && <Image source={{ uri: featured.image }} style={s.featuredImg} />}
                  <View style={s.featuredOverlay} />
                  <View style={s.featuredContent}>
                    <View style={s.categoryPill}>
                      <Text style={s.categoryPillText}>{featured.category}</Text>
                    </View>
                    <Text style={s.featuredTitle} numberOfLines={3}>{featured.title}</Text>
                    <Text style={s.featuredExcerpt} numberOfLines={2}>{featured.excerpt}</Text>
                    <Text style={s.featuredMeta}>{featured.author} · {featured.readTime ?? ''}</Text>
                  </View>
                </Pressable>
              )}

              {rest.map((post) => (
                <Pressable
                  key={post.slug}
                  onPress={() => { Haptics.selectionAsync(); router.push(`/blog/${post.slug}`) }}
                >
                  <Card>
                    <View style={s.row}>
                      {post.image && <Image source={{ uri: post.image }} style={s.thumb} />}
                      <View style={{ flex: 1 }}>
                        <Text style={s.category}>{post.category}</Text>
                        <Text style={s.title} numberOfLines={2}>{post.title}</Text>
                        <Text style={s.excerpt} numberOfLines={2}>{post.excerpt}</Text>
                        <Text style={s.meta}>{post.author} · {post.readTime ?? ''}</Text>
                      </View>
                    </View>
                  </Card>
                </Pressable>
              ))}
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: colors.beigePale },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn:     { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', ...shadow.sm },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.dark },
  filterBar:   { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: colors.greenLight, marginHorizontal: 16, borderRadius: radius.md, marginBottom: 8 },
  filterText:  { flex: 1, fontSize: 12, color: colors.greenDark, fontWeight: '600' },
  content:     { padding: 16, gap: 12, paddingBottom: 40 },
  empty:       { alignItems: 'center', paddingTop: 80, gap: 8 },
  emptyEmoji:  { fontSize: 48 },
  emptyTitle:  { fontSize: 16, fontWeight: '700', color: colors.dark },
  emptyDesc:   { fontSize: 13, color: colors.gray[500] },
  featuredCard: { borderRadius: radius.lg, overflow: 'hidden', height: 280, marginBottom: 4, backgroundColor: colors.dark },
  featuredImg: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  featuredOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  featuredContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20 },
  categoryPill: { alignSelf: 'flex-start', backgroundColor: colors.green, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginBottom: 10 },
  categoryPillText: { fontSize: 10, fontWeight: '700', color: colors.white, textTransform: 'uppercase', letterSpacing: 0.5 },
  featuredTitle: { fontSize: 20, fontWeight: '700', color: colors.white, marginBottom: 6, lineHeight: 26 },
  featuredExcerpt: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginBottom: 8, lineHeight: 18 },
  featuredMeta: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  row:         { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  thumb:       { width: 80, height: 80, borderRadius: 10, backgroundColor: colors.gray[200] },
  category:    { fontSize: 10, fontWeight: '700', color: colors.green, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  title:       { fontSize: 14, fontWeight: '700', color: colors.dark, marginBottom: 4, lineHeight: 18 },
  excerpt:     { fontSize: 12, color: colors.gray[600], marginBottom: 4, lineHeight: 16 },
  meta:        { fontSize: 10, color: colors.gray[500] },
})
