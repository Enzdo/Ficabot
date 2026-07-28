/**
 * Feuille de lecture : ouvre un conseil ou un sujet d'éducation en entier.
 * Contrairement à BottomModal, elle n'a pas de bouton de validation — on lit,
 * on ferme.
 */

import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, radius } from '@/constants/theme'

interface DetailSheetProps {
  visible: boolean
  onClose: () => void
  emoji: string
  title: string
  body: string
  why: string
  steps?: string[]
  accent: string
  accentSoft: string
  /** Contexte affiché en haut : « Max · Chiot · 4 mois ». */
  context?: string
}

export function DetailSheet({
  visible, onClose, emoji, title, body, why, steps, accent, accentSoft, context,
}: DetailSheetProps) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={s.root}>
        <View style={s.header}>
          {context ? <Text style={[s.context, { color: accent }]} numberOfLines={1}>{context}</Text> : <View />}
          <Pressable onPress={onClose} hitSlop={12} style={s.closeBtn}>
            <Ionicons name="close" size={20} color={colors.gray[600]} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          <View style={[s.iconWrap, { backgroundColor: accentSoft }]}>
            <Text style={s.emoji}>{emoji}</Text>
          </View>

          <Text style={s.title}>{title}</Text>
          <Text style={s.body}>{body}</Text>

          <View style={[s.whyCard, { backgroundColor: accentSoft }]}>
            <Text style={[s.whyLabel, { color: accent }]}>POURQUOI</Text>
            <Text style={s.whyText}>{why}</Text>
          </View>

          {steps && steps.length > 0 && (
            <View style={s.steps}>
              <Text style={s.stepsLabel}>Comment faire</Text>
              {steps.map((step, i) => (
                <View key={step} style={s.stepRow}>
                  <View style={[s.stepNum, { backgroundColor: accent }]}>
                    <Text style={s.stepNumText}>{i + 1}</Text>
                  </View>
                  <Text style={s.stepText}>{step}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  )
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: colors.beigePale },
  header:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  context: { flex: 1, fontSize: 12, fontWeight: '800', letterSpacing: 0.4, textTransform: 'uppercase' },
  closeBtn:{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.gray[100], alignItems: 'center', justifyContent: 'center' },

  content: { paddingHorizontal: 20, paddingBottom: 48, gap: 16 },
  iconWrap:{ width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  emoji:   { fontSize: 32 },

  title:   { fontSize: 23, fontWeight: '800', color: colors.dark, lineHeight: 30 },
  body:    { fontSize: 15, lineHeight: 23, color: colors.gray[700] },

  whyCard: { borderRadius: radius['2xl'], padding: 16, gap: 8 },
  whyLabel:{ fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  whyText: { fontSize: 14, lineHeight: 22, color: colors.gray[800] },

  steps:      { gap: 12, marginTop: 4 },
  stepsLabel: { fontSize: 16, fontWeight: '800', color: colors.dark },
  stepRow:    { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  stepNum:    { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  stepNumText:{ fontSize: 12, fontWeight: '800', color: colors.white },
  stepText:   { flex: 1, fontSize: 14, lineHeight: 21, color: colors.gray[700] },
})
