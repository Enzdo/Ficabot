import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useTrainingStore, type AxisReference, type DailyTask } from '@/stores/training'
import { colors, radius, shadow } from '@/constants/theme'

/**
 * Fiche d'un exercice : le déroulé pas à pas, le pourquoi, les erreurs
 * fréquentes, les repères de progression, et la note du jour.
 *
 * La note est le seul contenu que l'utilisateur écrit lui-même, et c'est celui
 * que le modèle relit en fin de cycle pour ajuster le plan — d'où le rappel
 * explicite sous le champ.
 */

interface TaskDetailSheetProps {
  visible: boolean
  task: DailyTask | null
  programId: number
  onClose: () => void
}

export function TaskDetailSheet({ visible, task, programId, onClose }: TaskDetailSheetProps) {
  const fetchReference = useTrainingStore((s) => s.fetchReference)
  const setTaskNote = useTrainingStore((s) => s.setTaskNote)
  const toggleTask = useTrainingStore((s) => s.toggleTask)

  const [reference, setReference] = useState<AxisReference | null>(null)
  const [loadingRef, setLoadingRef] = useState(false)
  const [draft, setDraft] = useState('')
  const [savingNote, setSavingNote] = useState(false)

  useEffect(() => {
    if (!visible || !task) return
    setDraft(task.note ?? '')
    setLoadingRef(true)
    fetchReference(task.axis)
      .then(setReference)
      .finally(() => setLoadingRef(false))
  }, [visible, task, fetchReference])

  if (!task) return null

  const dirty = draft.trim() !== (task.note ?? '').trim()

  async function saveNote() {
    if (!task) return
    setSavingNote(true)
    await setTaskNote(programId, task.key, draft)
    setSavingNote(false)
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {})
  }

  async function openLink(url: string) {
    const can = await Linking.canOpenURL(url)
    if (can) Linking.openURL(url)
    else Alert.alert('Lien', "Ce lien n'a pas pu être ouvert.")
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={s.header}>
          <View style={{ flex: 1 }}>
            <Text style={s.headerAxis}>{task.axisLabel}</Text>
            <Text style={s.headerTitle} numberOfLines={2}>{task.title}</Text>
          </View>
          <Pressable onPress={onClose} style={s.closeBtn} hitSlop={8}>
            <Ionicons name="close" size={22} color={colors.gray[600]} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          <View style={s.metaRow}>
            <View style={s.metaChip}>
              <Text style={s.metaChipText}>⏱ {task.duration}</Text>
            </View>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {})
                toggleTask(programId, task.key, !task.done)
              }}
              style={[s.doneChip, task.done && s.doneChipOn]}
            >
              <Ionicons
                name={task.done ? 'checkmark-circle' : 'ellipse-outline'}
                size={16}
                color={task.done ? colors.white : colors.greenDark}
              />
              <Text style={[s.doneChipText, task.done && { color: colors.white }]}>
                {task.done ? 'Fait aujourd\'hui' : 'Marquer comme fait'}
              </Text>
            </Pressable>
          </View>

          {/* ── Déroulé ─────────────────────────────────────────────────── */}
          <Text style={s.sectionTitle}>Comment faire</Text>
          <View style={s.card}>
            {task.steps.map((stepText, i) => (
              <View key={i} style={s.stepRow}>
                <Text style={s.stepNum}>{i + 1}</Text>
                <Text style={s.stepText}>{stepText}</Text>
              </View>
            ))}
            {!!task.tip && (
              <View style={s.tipBox}>
                <Text style={s.tipText}>💡 {task.tip}</Text>
              </View>
            )}
          </View>

          {/* ── Ma note du jour ─────────────────────────────────────────── */}
          <Text style={s.sectionTitle}>Ma note du jour</Text>
          <View style={s.card}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Comment ça s'est passé ? Ce qui a marché, ce qui a bloqué…"
              placeholderTextColor={colors.gray[400]}
              multiline
              maxLength={1000}
              style={s.noteInput}
            />
            <View style={s.noteFooter}>
              <Text style={s.noteHint}>
                Relu par l'IA en fin de cycle pour adapter le plan suivant.
              </Text>
              {dirty && (
                <Pressable onPress={saveNote} disabled={savingNote} style={s.saveBtn}>
                  {savingNote
                    ? <ActivityIndicator size="small" color={colors.white} />
                    : <Text style={s.saveBtnText}>Enregistrer</Text>}
                </Pressable>
              )}
            </View>
          </View>

          {loadingRef && <ActivityIndicator style={{ marginTop: 20 }} color={colors.green} />}

          {reference && (
            <>
              {/* ── Pourquoi ────────────────────────────────────────────── */}
              <Text style={s.sectionTitle}>Pourquoi cet exercice</Text>
              <View style={s.card}>
                <Text style={s.bodyText}>{reference.why}</Text>
                <View style={s.mechanismBox}>
                  <Text style={s.mechanismText}>{reference.mechanism}</Text>
                </View>
              </View>

              {/* ── Erreurs ─────────────────────────────────────────────── */}
              <Text style={s.sectionTitle}>Erreurs fréquentes</Text>
              <View style={[s.card, { borderColor: colors.orange + '40' }]}>
                {reference.mistakes.map((m, i) => (
                  <View key={i} style={s.bulletRow}>
                    <Text style={s.bulletWarn}>⚠️</Text>
                    <Text style={s.bulletText}>{m}</Text>
                  </View>
                ))}
              </View>

              {/* ── Repères ─────────────────────────────────────────────── */}
              <Text style={s.sectionTitle}>Où vous en êtes</Text>
              <View style={s.card}>
                {reference.milestones.map((m, i) => (
                  <View key={i} style={s.milestoneRow}>
                    <View style={s.milestoneDot}>
                      <Text style={s.milestoneNum}>{i + 1}</Text>
                    </View>
                    <Text style={s.bulletText}>{m}</Text>
                  </View>
                ))}
              </View>

              {/* ── Articles ────────────────────────────────────────────── */}
              {reference.articles.length > 0 && (
                <>
                  <Text style={s.sectionTitle}>À lire</Text>
                  <View style={{ gap: 10 }}>
                    {reference.articles.map((a) => (
                      <Pressable
                        key={a.slug}
                        onPress={() => {
                          onClose()
                          router.push({ pathname: '/blog/[slug]', params: { slug: a.slug } })
                        }}
                        style={({ pressed }) => [s.articleCard, pressed && { opacity: 0.9 }]}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={s.articleTitle} numberOfLines={2}>{a.title}</Text>
                          <Text style={s.articleExcerpt} numberOfLines={2}>{a.excerpt}</Text>
                          {!!a.readTime && <Text style={s.articleMeta}>{a.readTime}</Text>}
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={colors.gray[300]} />
                      </Pressable>
                    ))}
                  </View>
                </>
              )}

              {/* ── Vidéos ──────────────────────────────────────────────── */}
              {(reference.videos.length > 0 || reference.videoSearches.length > 0) && (
                <>
                  <Text style={s.sectionTitle}>En vidéo</Text>
                  <View style={{ gap: 10 }}>
                    {reference.videos.map((v) => (
                      <Pressable
                        key={v.url}
                        onPress={() => openLink(v.url)}
                        style={({ pressed }) => [s.videoCard, pressed && { opacity: 0.9 }]}
                      >
                        <Ionicons name="play-circle" size={24} color={colors.red} />
                        <View style={{ flex: 1 }}>
                          <Text style={s.videoTitle} numberOfLines={2}>{v.title}</Text>
                          <Text style={s.videoSource}>{v.source}</Text>
                        </View>
                      </Pressable>
                    ))}
                    {reference.videoSearches.map((v) => (
                      <Pressable
                        key={v.url}
                        onPress={() => openLink(v.url)}
                        style={({ pressed }) => [s.videoCard, pressed && { opacity: 0.9 }]}
                      >
                        <Ionicons name="search" size={20} color={colors.gray[600]} />
                        <View style={{ flex: 1 }}>
                          <Text style={s.videoTitle} numberOfLines={2}>{v.label}</Text>
                          <Text style={s.videoSource}>Recherche YouTube</Text>
                        </View>
                        <Ionicons name="open-outline" size={16} color={colors.gray[400]} />
                      </Pressable>
                    ))}
                  </View>
                </>
              )}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.beigePale },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  headerAxis: { fontSize: 12, fontWeight: '800', color: colors.greenDark, textTransform: 'uppercase' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: colors.dark, marginTop: 4, lineHeight: 26 },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: radius.full,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: { padding: 20, paddingBottom: 60, gap: 12 },

  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  metaChip: {
    backgroundColor: colors.beigeLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.full,
  },
  metaChipText: { fontSize: 12.5, fontWeight: '700', color: colors.gray[700] },
  doneChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.greenLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(126,177,63,0.4)',
  },
  doneChipOn: { backgroundColor: colors.green, borderColor: colors.green },
  doneChipText: { fontSize: 12.5, fontWeight: '700', color: colors.greenDark },

  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.dark, marginTop: 12 },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: colors.gray[200],
    padding: 16,
    gap: 10,
    ...shadow.sm,
  },

  stepRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  stepNum: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.greenDark,
    backgroundColor: colors.greenLight,
    width: 20,
    height: 20,
    borderRadius: radius.full,
    textAlign: 'center',
    lineHeight: 20,
    overflow: 'hidden',
  },
  stepText: { flex: 1, fontSize: 14, color: colors.gray[800], lineHeight: 21 },
  tipBox: { backgroundColor: colors.greenLight, borderRadius: radius.md, padding: 12 },
  tipText: { fontSize: 13, color: colors.greenDark, lineHeight: 19 },

  noteInput: {
    minHeight: 96,
    fontSize: 14.5,
    color: colors.dark,
    lineHeight: 21,
    textAlignVertical: 'top',
  },
  noteFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    paddingTop: 10,
  },
  noteHint: { flex: 1, fontSize: 11.5, color: colors.gray[500], lineHeight: 16 },
  saveBtn: {
    backgroundColor: colors.green,
    paddingHorizontal: 16,
    height: 34,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 96,
  },
  saveBtnText: { fontSize: 13, fontWeight: '800', color: colors.white },

  bodyText: { fontSize: 14, color: colors.gray[800], lineHeight: 21 },
  mechanismBox: {
    backgroundColor: colors.blueLight,
    borderRadius: radius.md,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.blue,
  },
  mechanismText: { fontSize: 13, color: colors.gray[700], lineHeight: 19, fontStyle: 'italic' },

  bulletRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  bulletWarn: { fontSize: 13, lineHeight: 20 },
  bulletText: { flex: 1, fontSize: 13.5, color: colors.gray[700], lineHeight: 20 },

  milestoneRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  milestoneDot: {
    width: 20,
    height: 20,
    borderRadius: radius.full,
    backgroundColor: colors.beigeLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneNum: { fontSize: 11, fontWeight: '800', color: colors.gray[700] },

  articleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
    padding: 14,
  },
  articleTitle: { fontSize: 14, fontWeight: '700', color: colors.dark },
  articleExcerpt: { fontSize: 12.5, color: colors.gray[600], marginTop: 3, lineHeight: 18 },
  articleMeta: { fontSize: 11.5, color: colors.gray[500], marginTop: 4 },

  videoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
    padding: 14,
  },
  videoTitle: { fontSize: 13.5, fontWeight: '600', color: colors.dark },
  videoSource: { fontSize: 11.5, color: colors.gray[500], marginTop: 2 },
})
