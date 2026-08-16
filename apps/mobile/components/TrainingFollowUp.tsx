import { useEffect, useRef } from 'react'
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useTrainingStore, type ProgramSummary } from '@/stores/training'
import { scoreColor } from '@/components/ui/ScoreRing'
import { colors, radius, shadow } from '@/constants/theme'

/**
 * Section « Éducation canine » de l'accueil : les exercices du jour, cochables
 * sur place.
 *
 * Elle n'apparaît qu'une fois le plan généré — avant, il n'y a rien à suivre.
 * À J+7 elle bascule sur le bilan de la semaine et masque les exercices : la
 * semaine suivante ne se débloque qu'une fois le point fait, sinon le suivi ne
 * serait qu'une liste de cases à cocher sans fin.
 */

function ProgressPill({ done, total }: { done: number; total: number }) {
  const ratio = total > 0 ? done / total : 0
  const grow = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(grow, {
      toValue: ratio,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start()
  }, [ratio, grow])

  return (
    <View style={s.pillTrack}>
      <Animated.View
        style={[
          s.pillFill,
          {
            width: grow.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
            backgroundColor: ratio >= 1 ? colors.green : colors.greenDark,
          },
        ]}
      />
    </View>
  )
}

function TaskRow({ program, task }: { program: ProgramSummary; task: ProgramSummary['tasks'][number] }) {
  const toggleTask = useTrainingStore((s) => s.toggleTask)

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(
          task.done ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium
        ).catch(() => {})
        toggleTask(program.id, task.key, !task.done)
      }}
      style={({ pressed }) => [s.task, task.done && s.taskDone, pressed && { opacity: 0.85 }]}
    >
      <View style={[s.check, task.done && s.checkOn]}>
        {task.done && <Ionicons name="checkmark" size={14} color={colors.white} />}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[s.taskTitle, task.done && s.taskTitleDone]} numberOfLines={1}>
          {task.title}
        </Text>
        <Text style={s.taskMeta} numberOfLines={1}>
          {task.axisLabel} · {task.duration}
        </Text>
      </View>
    </Pressable>
  )
}

function ProgramCard({ program }: { program: ProgramSummary }) {
  const openPlan = () =>
    router.push({
      pathname: '/training/result/[id]',
      params: { id: String(program.assessmentId) },
    })

  // Cycle terminé : on propose d'enchaîner plutôt que de laisser le suivi mort.
  if (program.status === 'completed') {
    return (
      <Pressable onPress={openPlan} style={({ pressed }) => [s.card, shadow.sm, pressed && s.pressed]}>
        <View style={s.headRow}>
          <Text style={s.headEmoji}>🏆</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.headTitle}>{program.petName} · cycle terminé</Text>
            <Text style={s.headSub}>
              {program.totalWeeks} semaines bouclées · note {program.overallScore}/100
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.gray[300]} />
        </View>
        <View style={s.ctaBanner}>
          <Text style={s.ctaBannerText}>Voir le bilan et lancer le cycle suivant</Text>
        </View>
      </Pressable>
    )
  }

  // Bilan hebdomadaire dû : les exercices sont masqués tant qu'il n'est pas fait.
  if (program.checkinDue) {
    return (
      <View style={[s.card, s.cardLocked, shadow.sm]}>
        <View style={s.headRow}>
          <Text style={s.headEmoji}>📋</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.headTitle}>Bilan de la semaine {program.week}</Text>
            <Text style={s.headSub}>
              {program.petName} · à faire pour débloquer la suite
            </Text>
          </View>
        </View>
        <Text style={s.lockedText}>
          Une dizaine de questions sur ce que vous avez travaillé cette semaine. Vos notes
          sont mises à jour, puis la semaine {program.week + 1} s'ouvre.
        </Text>
        <Pressable
          onPress={() => {
            Haptics.selectionAsync().catch(() => {})
            router.push({ pathname: '/training/checkin/[id]', params: { id: String(program.id) } })
          }}
          style={({ pressed }) => [s.lockedCta, pressed && { opacity: 0.9 }]}
        >
          <Text style={s.lockedCtaText}>Faire le bilan</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.white} />
        </Pressable>
      </View>
    )
  }

  const allDone = program.totalCount > 0 && program.doneCount >= program.totalCount

  return (
    <View style={[s.card, shadow.sm]}>
      <Pressable onPress={openPlan} style={s.headRow}>
        <View style={[s.weekBadge, { backgroundColor: scoreColor(program.overallScore) + '22' }]}>
          <Text style={[s.weekBadgeText, { color: scoreColor(program.overallScore) }]}>
            S{program.week}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.headTitle} numberOfLines={1}>
            {program.petName} · semaine {program.week}/{program.totalWeeks}
          </Text>
          <Text style={s.headSub} numberOfLines={1}>
            {program.theme}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.gray[300]} />
      </Pressable>

      <View style={s.progressRow}>
        <ProgressPill done={program.doneCount} total={program.totalCount} />
        <Text style={s.progressText}>
          {program.doneCount}/{program.totalCount}
        </Text>
      </View>

      <View style={s.tasks}>
        {program.tasks.map((task) => (
          <TaskRow key={task.key} program={program} task={task} />
        ))}
      </View>

      <Text style={s.footNote}>
        {allDone
          ? `Journée bouclée 🎉 Bilan de la semaine dans ${program.daysUntilCheckin} j.`
          : `Bilan de la semaine dans ${program.daysUntilCheckin} j.`}
      </Text>
    </View>
  )
}

export function TrainingFollowUp() {
  const programs = useTrainingStore((s) => s.programs)

  if (programs.length === 0) return null

  return (
    <View>
      <View style={s.sectionRow}>
        <Text style={s.sectionTitle}>Mon éducation canine</Text>
        <View style={s.sectionBadge}>
          <Text style={s.sectionBadgeText}>Suivi</Text>
        </View>
      </View>
      <View style={{ gap: 12 }}>
        {programs.map((program) => (
          <ProgramCard key={program.id} program={program} />
        ))}
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.dark },
  sectionBadge: {
    backgroundColor: colors.greenLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  sectionBadgeText: { fontSize: 11, fontWeight: '800', color: colors.greenDark },

  card: {
    backgroundColor: colors.white,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: colors.gray[200],
    padding: 14,
  },
  cardLocked: { borderColor: colors.orange + '55', backgroundColor: colors.orangeLight },
  pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },

  headRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headEmoji: { fontSize: 26, width: 38, textAlign: 'center' },
  weekBadge: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekBadgeText: { fontSize: 13, fontWeight: '900' },
  headTitle: { fontSize: 14.5, fontWeight: '700', color: colors.dark },
  headSub: { fontSize: 12.5, color: colors.gray[600], marginTop: 2 },

  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  pillTrack: {
    flex: 1,
    height: 6,
    backgroundColor: colors.gray[100],
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  pillFill: { height: '100%', borderRadius: radius.full },
  progressText: { fontSize: 12, fontWeight: '800', color: colors.gray[600] },

  tasks: { gap: 8, marginTop: 12 },
  task: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.gray[50],
    borderRadius: radius.lg,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.gray[100],
  },
  taskDone: { backgroundColor: colors.greenLight, borderColor: 'rgba(126,177,63,0.3)' },
  check: {
    width: 22,
    height: 22,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: { borderColor: colors.green, backgroundColor: colors.green },
  taskTitle: { fontSize: 13.5, fontWeight: '600', color: colors.gray[800] },
  taskTitleDone: { color: colors.greenDark, textDecorationLine: 'line-through' },
  taskMeta: { fontSize: 11.5, color: colors.gray[500], marginTop: 1 },

  footNote: { fontSize: 11.5, color: colors.gray[500], marginTop: 10, textAlign: 'center' },

  lockedText: { fontSize: 13, color: colors.gray[700], marginTop: 10, lineHeight: 19 },
  lockedCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.orange,
    borderRadius: radius.full,
    height: 44,
    marginTop: 12,
  },
  lockedCtaText: { fontSize: 14, fontWeight: '800', color: colors.white },

  ctaBanner: {
    backgroundColor: colors.greenLight,
    borderRadius: radius.md,
    padding: 10,
    marginTop: 12,
  },
  ctaBannerText: { fontSize: 12.5, fontWeight: '700', color: colors.greenDark, textAlign: 'center' },
})
