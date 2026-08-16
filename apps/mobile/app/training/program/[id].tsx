import { useCallback, useEffect, useState } from 'react'
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { Card } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ScoreRing, scoreColor } from '@/components/ui/ScoreRing'
import { useTrainingStore, type ProgramDetail, type TrainingAxis } from '@/stores/training'
import { colors, radius, shadow } from '@/constants/theme'

/**
 * Écran de progression du programme.
 *
 * C'est ici que le bilan hebdomadaire prend son sens : sans vue sur l'évolution,
 * répondre chaque semaine ne produit qu'un chiffre qui change en silence. On
 * montre donc systématiquement le point de départ à côté de la note actuelle.
 */

const AXIS_META: Record<TrainingAxis, { label: string; emoji: string }> = {
  obedience: { label: 'Obéissance de base', emoji: '🎓' },
  recall: { label: 'Rappel', emoji: '📣' },
  leash: { label: 'Marche en laisse', emoji: '🦮' },
  social: { label: 'Sociabilité', emoji: '🐕‍🦺' },
  calm: { label: 'Calme & solitude', emoji: '🧘' },
  daily: { label: 'Vie quotidienne', emoji: '🏠' },
}

const AXIS_ORDER: TrainingAxis[] = ['obedience', 'recall', 'leash', 'social', 'calm', 'daily']

function DeltaChip({ delta }: { delta: number }) {
  if (delta === 0) {
    return (
      <View style={[s.chip, { backgroundColor: colors.gray[100] }]}>
        <Text style={[s.chipText, { color: colors.gray[600] }]}>=</Text>
      </View>
    )
  }
  const up = delta > 0
  return (
    <View style={[s.chip, { backgroundColor: up ? colors.greenLight : colors.redLight }]}>
      <Ionicons
        name={up ? 'arrow-up' : 'arrow-down'}
        size={10}
        color={up ? colors.greenDark : colors.red}
      />
      <Text style={[s.chipText, { color: up ? colors.greenDark : colors.red }]}>
        {Math.abs(delta)}
      </Text>
    </View>
  )
}

/**
 * Barre à deux niveaux : le repère creux marque le point de départ, la barre
 * pleine la note actuelle. Lire une progression demande les deux valeurs — un
 * seul chiffre ne dit pas si on monte ou si on descend.
 */
function AxisProgress({ start, now }: { start: number; now: number }) {
  return (
    <View style={s.barTrack}>
      <View style={[s.barFill, { width: `${Math.max(now, 2)}%`, backgroundColor: scoreColor(now) }]} />
      {start !== now && (
        <View style={[s.startMarker, { left: `${Math.min(Math.max(start, 1), 99)}%` }]} />
      )}
    </View>
  )
}

export default function TrainingProgramScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const fetchProgram = useTrainingStore((st) => st.fetchProgram)

  const [program, setProgram] = useState<ProgramDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [openJournal, setOpenJournal] = useState(false)

  const load = useCallback(async () => {
    const data = await fetchProgram(id)
    setProgram(data)
    setLoading(false)
  }, [id, fetchProgram])

  useEffect(() => { load() }, [load])

  if (loading || !program) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <LoadingSpinner fullScreen />
      </SafeAreaView>
    )
  }

  const history = program.scoresHistory ?? []
  const start = history[0]?.scores ?? program.scores
  const startOverall = history[0]?.overallScore ?? program.overallScore
  const overallDelta = program.overallScore - startOverall

  const journal = program.journal
  const weeksDone = journal?.byWeek?.filter((w) => w.done > 0).length ?? 0

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.backBtn} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={colors.gray[700]} />
        </Pressable>
        <Text style={s.headerTitle} numberOfLines={1}>
          Progression{program.petName ? ` · ${program.petName}` : ''}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false) }}
            tintColor={colors.green}
          />
        }
      >
        {/* ── Note actuelle et écart depuis le départ ────────────────────── */}
        <LinearGradient
          colors={['#FFFFFF', colors.beigeLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[s.hero, shadow.md]}
        >
          <ScoreRing score={program.overallScore} size={126} stroke={10} />
          <View style={s.heroDelta}>
            <Text style={s.heroDeltaLabel}>Depuis le bilan de départ</Text>
            <View style={s.heroDeltaRow}>
              <Text style={s.heroStart}>{startOverall}</Text>
              <Ionicons name="arrow-forward" size={14} color={colors.gray[400]} />
              <Text style={[s.heroNow, { color: scoreColor(program.overallScore) }]}>
                {program.overallScore}
              </Text>
              <DeltaChip delta={overallDelta} />
            </View>
          </View>
          <Text style={s.heroMeta}>
            Cycle {program.cycle} · semaine {program.week}/{program.totalWeeks}
          </Text>
        </LinearGradient>

        {/* ── Progression par domaine ────────────────────────────────────── */}
        <Text style={s.sectionTitle}>Par domaine</Text>
        <Card style={{ gap: 16 }}>
          {AXIS_ORDER.map((axis) => {
            const now = program.scores?.[axis] ?? 0
            const from = start?.[axis] ?? now
            return (
              <View key={axis}>
                <View style={s.axisRow}>
                  <Text style={s.axisLabel}>
                    {AXIS_META[axis].emoji} {AXIS_META[axis].label}
                  </Text>
                  <View style={s.axisRight}>
                    <Text style={s.axisFrom}>{from}</Text>
                    <Ionicons name="arrow-forward" size={11} color={colors.gray[400]} />
                    <Text style={[s.axisNow, { color: scoreColor(now) }]}>{now}</Text>
                    <DeltaChip delta={now - from} />
                  </View>
                </View>
                <AxisProgress start={from} now={now} />
              </View>
            )
          })}
          <Text style={s.legend}>
            Le repère clair sur la barre marque votre point de départ.
          </Text>
        </Card>

        {/* ── Semaine par semaine ────────────────────────────────────────── */}
        {history.length > 1 && (
          <>
            <Text style={s.sectionTitle}>Semaine par semaine</Text>
            <Card style={{ gap: 12 }}>
              {history.map((snapshot, i) => {
                const previous = i > 0 ? history[i - 1].overallScore : snapshot.overallScore
                return (
                  <View key={`${snapshot.at}-${i}`} style={s.weekRow}>
                    <View style={s.weekLabel}>
                      <Text style={s.weekLabelText}>
                        {snapshot.source === 'initial' ? 'Départ' : `S${snapshot.week}`}
                      </Text>
                    </View>
                    <View style={s.weekBarTrack}>
                      <View
                        style={[
                          s.weekBarFill,
                          {
                            width: `${Math.max(snapshot.overallScore, 2)}%`,
                            backgroundColor: scoreColor(snapshot.overallScore),
                          },
                        ]}
                      />
                    </View>
                    <Text style={[s.weekScore, { color: scoreColor(snapshot.overallScore) }]}>
                      {snapshot.overallScore}
                    </Text>
                    {i > 0 && <DeltaChip delta={snapshot.overallScore - previous} />}
                  </View>
                )
              })}
            </Card>
          </>
        )}

        {/* ── Assiduité ──────────────────────────────────────────────────── */}
        {journal && (
          <>
            <Text style={s.sectionTitle}>Votre assiduité</Text>
            <Card style={{ gap: 14 }}>
              <View style={s.statsRow}>
                <View style={s.stat}>
                  <Text style={s.statValue}>{journal.totalChecks}</Text>
                  <Text style={s.statLabel}>exercices faits</Text>
                </View>
                <View style={s.statDivider} />
                <View style={s.stat}>
                  <Text style={s.statValue}>{journal.activeDays}</Text>
                  <Text style={s.statLabel}>jours actifs</Text>
                </View>
                <View style={s.statDivider} />
                <View style={s.stat}>
                  <Text style={s.statValue}>{weeksDone}</Text>
                  <Text style={s.statLabel}>semaines entamées</Text>
                </View>
              </View>

              {journal.byWeek.map((w) => {
                const ratio = w.planned > 0 ? Math.min(1, w.done / w.planned) : 0
                return (
                  <View key={w.week}>
                    <View style={s.axisRow}>
                      <Text style={s.axisLabel}>Semaine {w.week}</Text>
                      <Text style={s.weekAdherence}>
                        {w.done}/{w.planned} · {w.activeDays} j
                      </Text>
                    </View>
                    <View style={s.barTrack}>
                      <View
                        style={[
                          s.barFill,
                          { width: `${Math.max(ratio * 100, 2)}%`, backgroundColor: colors.greenDark },
                        ]}
                      />
                    </View>
                  </View>
                )
              })}
              <Text style={s.legend}>
                Le maximum théorique suppose tous les exercices tous les jours — personne
                ne l'atteint, c'est un repère, pas un objectif.
              </Text>
            </Card>
          </>
        )}

        {/* ── Journal de bord ────────────────────────────────────────────── */}
        {journal && journal.notes.length > 0 && (
          <>
            <Pressable onPress={() => setOpenJournal((v) => !v)} style={s.journalHeader}>
              <Text style={s.sectionTitle}>Mon journal ({journal.notes.length})</Text>
              <Ionicons
                name={openJournal ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={colors.gray[500]}
              />
            </Pressable>
            {openJournal && (
              <Card style={{ gap: 14 }}>
                {journal.notes
                  .slice()
                  .reverse()
                  .map((n, i) => (
                    <View key={`${n.day}-${i}`} style={s.noteRow}>
                      <View style={s.noteMeta}>
                        <Text style={s.noteWeek}>S{n.week}</Text>
                        <Text style={s.noteDay}>{n.day.slice(8, 10)}/{n.day.slice(5, 7)}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.noteExercise}>
                          {n.exercise}
                          {!n.done && <Text style={s.noteNotDone}> · non fait</Text>}
                        </Text>
                        <Text style={s.noteText}>{n.note}</Text>
                      </View>
                    </View>
                  ))}
                <Text style={s.legend}>
                  Ces observations sont relues par l'IA en fin de cycle pour adapter le plan
                  suivant.
                </Text>
              </Card>
            )}
          </>
        )}

        {/* ── Accès au plan ──────────────────────────────────────────────── */}
        <Pressable
          onPress={() =>
            router.push({
              pathname: '/training/result/[id]',
              params: { id: String(program.assessmentId) },
            })
          }
          style={({ pressed }) => [s.planCta, pressed && { opacity: 0.9 }]}
        >
          <Text style={s.planCtaEmoji}>📋</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.planCtaTitle}>Voir le plan complet</Text>
            <Text style={s.planCtaDesc}>
              Les {program.totalWeeks} semaines, exercices détaillés et erreurs à éviter
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.greenDark} />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.beigePale },

  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 10 },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.sm,
  },
  headerTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: colors.dark, textAlign: 'center' },

  content: { padding: 16, paddingBottom: 56, gap: 14 },

  hero: {
    alignItems: 'center',
    borderRadius: radius['3xl'],
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  heroDelta: { alignItems: 'center', marginTop: 16 },
  heroDeltaLabel: { fontSize: 12, color: colors.gray[500] },
  heroDeltaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  heroStart: { fontSize: 17, fontWeight: '700', color: colors.gray[400] },
  heroNow: { fontSize: 22, fontWeight: '900' },
  heroMeta: { fontSize: 12.5, color: colors.gray[600], marginTop: 12 },

  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.dark, marginTop: 8 },

  axisRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, gap: 8 },
  axisLabel: { fontSize: 13.5, color: colors.gray[800], fontWeight: '600', flex: 1 },
  axisRight: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  axisFrom: { fontSize: 12.5, color: colors.gray[400] },
  axisNow: { fontSize: 15, fontWeight: '800' },

  barTrack: {
    height: 8,
    backgroundColor: colors.gray[100],
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: radius.full },
  startMarker: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: colors.white,
    opacity: 0.9,
  },

  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.full,
    minWidth: 28,
    justifyContent: 'center',
  },
  chipText: { fontSize: 11, fontWeight: '800' },

  legend: { fontSize: 11.5, color: colors.gray[500], lineHeight: 16, marginTop: 2 },

  weekRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  weekLabel: { width: 46 },
  weekLabelText: { fontSize: 12, fontWeight: '800', color: colors.gray[600] },
  weekBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: colors.gray[100],
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  weekBarFill: { height: '100%', borderRadius: radius.full },
  weekScore: { fontSize: 13.5, fontWeight: '800', width: 26, textAlign: 'right' },

  statsRow: { flexDirection: 'row', alignItems: 'center' },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '900', color: colors.dark },
  statLabel: { fontSize: 11, color: colors.gray[500], marginTop: 2, textAlign: 'center' },
  statDivider: { width: 1, height: 32, backgroundColor: colors.gray[200] },
  weekAdherence: { fontSize: 12, color: colors.gray[600], fontWeight: '600' },

  journalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  noteRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  noteMeta: { width: 42, alignItems: 'center' },
  noteWeek: { fontSize: 11, fontWeight: '800', color: colors.greenDark },
  noteDay: { fontSize: 10.5, color: colors.gray[400], marginTop: 1 },
  noteExercise: { fontSize: 13, fontWeight: '700', color: colors.dark },
  noteNotDone: { fontWeight: '500', color: colors.orange },
  noteText: { fontSize: 13, color: colors.gray[700], marginTop: 3, lineHeight: 19 },

  planCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.greenLight,
    borderRadius: radius['2xl'],
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(126,177,63,0.35)',
    marginTop: 6,
  },
  planCtaEmoji: { fontSize: 22, width: 32, textAlign: 'center' },
  planCtaTitle: { fontSize: 14.5, fontWeight: '700', color: colors.dark },
  planCtaDesc: { fontSize: 12, color: colors.gray[600], marginTop: 2 },
})
