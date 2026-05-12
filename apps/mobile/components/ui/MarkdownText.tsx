import { Fragment } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { colors } from '@/constants/theme'

interface Props {
  children: string
  style?: object
  dark?: boolean
}

type Segment = { text: string; bold: boolean; italic: boolean }

function parseInline(line: string): Segment[] {
  const segments: Segment[] = []
  const re = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|_(.+?)_)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = re.exec(line)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: line.slice(lastIndex, match.index), bold: false, italic: false })
    }
    if (match[2]) {
      segments.push({ text: match[2], bold: true, italic: true })
    } else if (match[3]) {
      segments.push({ text: match[3], bold: true, italic: false })
    } else if (match[4] || match[5]) {
      segments.push({ text: match[4] ?? match[5], bold: false, italic: true })
    }
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < line.length) {
    segments.push({ text: line.slice(lastIndex), bold: false, italic: false })
  }

  return segments.length ? segments : [{ text: line, bold: false, italic: false }]
}

function InlineLine({ segments, baseStyle }: { segments: Segment[]; baseStyle: object }) {
  return (
    <Text style={baseStyle}>
      {segments.map((seg, i) => (
        <Text
          key={i}
          style={[
            seg.bold && styles.bold,
            seg.italic && styles.italic,
          ]}
        >
          {seg.text}
        </Text>
      ))}
    </Text>
  )
}

export function MarkdownText({ children, style, dark = false }: Props) {
  const baseColor = dark ? colors.white : colors.dark
  const mutedColor = dark ? 'rgba(255,255,255,0.6)' : colors.gray[500]

  const lines = children.split('\n')
  const nodes: React.ReactNode[] = []
  let i = 0

  while (i < lines.length) {
    const raw = lines[i]
    const trimmed = raw.trim()

    if (!trimmed) {
      nodes.push(<View key={`gap-${i}`} style={styles.gap} />)
      i++
      continue
    }

    // H1
    if (trimmed.startsWith('# ')) {
      nodes.push(
        <Text key={i} style={[styles.h1, { color: baseColor }]}>
          {trimmed.slice(2)}
        </Text>
      )
      i++
      continue
    }

    // H2
    if (trimmed.startsWith('## ')) {
      nodes.push(
        <Text key={i} style={[styles.h2, { color: baseColor }]}>
          {trimmed.slice(3)}
        </Text>
      )
      i++
      continue
    }

    // H3
    if (trimmed.startsWith('### ')) {
      nodes.push(
        <Text key={i} style={[styles.h3, { color: baseColor }]}>
          {trimmed.slice(4)}
        </Text>
      )
      i++
      continue
    }

    // Bullet
    if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      const content = trimmed.startsWith('- ') ? trimmed.slice(2) : trimmed.slice(2)
      const segs = parseInline(content)
      nodes.push(
        <View key={i} style={styles.bulletRow}>
          <Text style={[styles.bullet, { color: mutedColor }]}>•</Text>
          <InlineLine segments={segs} baseStyle={[styles.base, { color: baseColor }, style]} />
        </View>
      )
      i++
      continue
    }

    // Numbered list
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/)
    if (numMatch) {
      const segs = parseInline(numMatch[2])
      nodes.push(
        <View key={i} style={styles.bulletRow}>
          <Text style={[styles.bullet, { color: mutedColor }]}>{numMatch[1]}.</Text>
          <InlineLine segments={segs} baseStyle={[styles.base, { color: baseColor }, style]} />
        </View>
      )
      i++
      continue
    }

    // Normal paragraph
    const segs = parseInline(trimmed)
    nodes.push(
      <InlineLine key={i} segments={segs} baseStyle={[styles.base, { color: baseColor }, style]} />
    )
    i++
  }

  return <View style={styles.root}>{nodes}</View>
}

const styles = StyleSheet.create({
  root:      { gap: 2 },
  base:      { fontSize: 14, lineHeight: 21 },
  bold:      { fontWeight: '700' },
  italic:    { fontStyle: 'italic' },
  h1:        { fontSize: 18, fontWeight: '800', lineHeight: 24, marginTop: 4, marginBottom: 2 },
  h2:        { fontSize: 16, fontWeight: '700', lineHeight: 22, marginTop: 4, marginBottom: 2 },
  h3:        { fontSize: 15, fontWeight: '700', lineHeight: 20, marginTop: 2, marginBottom: 1 },
  gap:       { height: 6 },
  bulletRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  bullet:    { fontSize: 14, lineHeight: 21, width: 16, flexShrink: 0 },
})
