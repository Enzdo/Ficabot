import { useEffect, useMemo } from 'react'
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useBlogStore } from '@/stores/blog'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { colors, radius, shadow } from '@/constants/theme'

type Block =
  | { kind: 'h2' | 'h3' | 'p'; segments: Segment[] }
  | { kind: 'ul'; items: Segment[][] }

type Segment = { text: string; bold: boolean }

function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&laquo;/g, '«')
    .replace(/&raquo;/g, '»')
}

function parseSegments(html: string): Segment[] {
  // Split on <strong>..</strong> while preserving bold/normal markers
  const segments: Segment[] = []
  const re = /<strong[^>]*>([\s\S]*?)<\/strong>/gi
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(html)) !== null) {
    if (m.index > last) {
      segments.push({ text: decodeEntities(html.slice(last, m.index).replace(/<[^>]+>/g, '')), bold: false })
    }
    segments.push({ text: decodeEntities(m[1].replace(/<[^>]+>/g, '')), bold: true })
    last = m.index + m[0].length
  }
  if (last < html.length) {
    segments.push({ text: decodeEntities(html.slice(last).replace(/<[^>]+>/g, '')), bold: false })
  }
  return segments.filter((s) => s.text.length > 0)
}

function parseHtml(content: string): Block[] {
  const blocks: Block[] = []
  // Strip wrappers like <div>...</div>
  const tagRe = /<(h2|h3|p|ul)(?:[^>]*)>([\s\S]*?)<\/\1>/gi
  let m: RegExpExecArray | null
  while ((m = tagRe.exec(content)) !== null) {
    const tag = m[1].toLowerCase()
    const inner = m[2]
    if (tag === 'ul') {
      const items: Segment[][] = []
      const liRe = /<li[^>]*>([\s\S]*?)<\/li>/gi
      let li: RegExpExecArray | null
      while ((li = liRe.exec(inner)) !== null) {
        items.push(parseSegments(li[1]))
      }
      if (items.length > 0) blocks.push({ kind: 'ul', items })
    } else {
      const segments = parseSegments(inner)
      if (segments.length > 0) blocks.push({ kind: tag as 'h2' | 'h3' | 'p', segments })
    }
  }
  return blocks
}

export default function BlogArticleScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const { currentPost, loading, fetchPost } = useBlogStore()

  useEffect(() => {
    if (slug) fetchPost(slug)
  }, [slug, fetchPost])

  const blocks = useMemo(() => (currentPost ? parseHtml(currentPost.content) : []), [currentPost])

  if (loading && !currentPost) return <LoadingSpinner fullScreen />
  if (!currentPost) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.empty}>
          <Text style={s.emptyEmoji}>🔍</Text>
          <Text style={s.emptyTitle}>Article non trouvé</Text>
          <Pressable onPress={() => router.back()} style={s.backBtn2}>
            <Text style={s.backText}>← Retour</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.gray[700]} />
        </Pressable>
        <Text style={s.headerTitle} numberOfLines={1}>{currentPost.category}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {currentPost.image && (
          <Image source={{ uri: currentPost.image }} style={s.heroImg} />
        )}

        <View style={s.body}>
          <View style={s.categoryPill}>
            <Text style={s.categoryPillText}>{currentPost.category}</Text>
          </View>
          <Text style={s.title}>{currentPost.title}</Text>
          <Text style={s.lead}>{currentPost.excerpt}</Text>
          <Text style={s.meta}>{currentPost.author} · {currentPost.publishedAt}{currentPost.readTime ? ` · ${currentPost.readTime}` : ''}</Text>

          <View style={s.separator} />

          {blocks.map((b, i) => {
            if (b.kind === 'h2') return <Text key={i} style={s.h2}>{b.segments.map((seg, j) => <Text key={j} style={seg.bold && s.bold}>{seg.text}</Text>)}</Text>
            if (b.kind === 'h3') return <Text key={i} style={s.h3}>{b.segments.map((seg, j) => <Text key={j} style={seg.bold && s.bold}>{seg.text}</Text>)}</Text>
            if (b.kind === 'p')  return <Text key={i} style={s.p}>{b.segments.map((seg, j) => <Text key={j} style={seg.bold && s.bold}>{seg.text}</Text>)}</Text>
            if (b.kind === 'ul') return (
              <View key={i} style={s.ul}>
                {b.items.map((item, j) => (
                  <View key={j} style={s.li}>
                    <Text style={s.bullet}>•</Text>
                    <Text style={s.liText}>{item.map((seg, k) => <Text key={k} style={seg.bold && s.bold}>{seg.text}</Text>)}</Text>
                  </View>
                ))}
              </View>
            )
            return null
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: colors.white },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.gray[100] },
  backBtn:     { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.gray[100], alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 14, fontWeight: '600', color: colors.gray[600] },
  content:     { paddingBottom: 60 },
  heroImg:     { width: '100%', height: 220, backgroundColor: colors.gray[200] },
  body:        { padding: 20 },
  categoryPill:   { alignSelf: 'flex-start', backgroundColor: colors.green, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginBottom: 12 },
  categoryPillText: { fontSize: 10, fontWeight: '700', color: colors.white, textTransform: 'uppercase', letterSpacing: 0.5 },
  title:       { fontSize: 24, fontWeight: '800', color: colors.dark, lineHeight: 32, marginBottom: 12 },
  lead:        { fontSize: 15, color: colors.gray[700], lineHeight: 22, marginBottom: 12, fontStyle: 'italic' },
  meta:        { fontSize: 12, color: colors.gray[500], marginBottom: 20 },
  separator:   { height: 1, backgroundColor: colors.gray[200], marginBottom: 20 },
  h2:          { fontSize: 18, fontWeight: '700', color: colors.dark, marginTop: 20, marginBottom: 10, lineHeight: 24 },
  h3:          { fontSize: 16, fontWeight: '700', color: colors.dark, marginTop: 16, marginBottom: 8, lineHeight: 22 },
  p:           { fontSize: 15, color: colors.gray[800], lineHeight: 24, marginBottom: 14 },
  ul:          { marginBottom: 14, gap: 8 },
  li:          { flexDirection: 'row', gap: 10, paddingLeft: 4 },
  bullet:      { fontSize: 15, color: colors.green, lineHeight: 24 },
  liText:      { flex: 1, fontSize: 15, color: colors.gray[800], lineHeight: 24 },
  bold:        { fontWeight: '700', color: colors.dark },
  empty:       { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyEmoji:  { fontSize: 48 },
  emptyTitle:  { fontSize: 16, fontWeight: '700', color: colors.dark },
  backBtn2:    { padding: 12 },
  backText:    { fontSize: 14, color: colors.green, fontWeight: '600' },
})
