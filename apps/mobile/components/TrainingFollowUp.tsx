import { useEffect, useRef, useState } from 'react'
import { Alert, Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useTrainingStore, type DailyTask, type ProgramSummary } from '@/stores/training'
import { scoreColor } from '@/components/ui/ScoreRing'
import { TaskDetailSheet } from '@/components/TaskDetailSheet'
import { TrainingReminderSheet } from '@/components/TrainingReminderSheet'
import { syncTrainingReminders } from '@/services/trainingNotifications'
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

/**
 * La coche et l'ouverture de la fiche sont deux zones distinctes : cocher est
 * le geste courant, il ne doit pas obliger à passer par un écran.
 */
function TaskRow({
  program,
  task,
  onOpen,
}: {
  program: ProgramSummary
  task: DailyTask
  onOpen: () => void
}) {
  const toggleTask = useTrainingStore((s) => s.toggleTask)

  return (
    <Pressable
      onPress={onOpen}
      style={({ pressed }) => [s.task, task.done && s.taskDone, pressed && { opacity: 0.85 }]}
    >
      <Pressable
        onPress={(e) => {
          e.stopPropagation()
          Haptics.impactAsync(
            task.done ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium
          ).catch(() => {})
          toggleTask(program.id, task.key, !task.done)
        }}
        hitSlop={10}
      >
        <View style={[s.check, task.done && s.checkOn]}>
          {task.done && <Ionicons name="checkmark" size={14} color={colors.white} />}
        </View>
      </Pressable>

      <View style={{ flex: 1 }}>
        <Text style={[s.taskTitle, task.done && s.taskTitleDone]} numberOfLines={1}>
          {task.title}
        </Text>
        <Text style={s.taskMeta} numberOfLines={1}>
          {task.axisLabel} · {task.duration}
        </Text>
        {!!task.note && (
          <Text style={s.taskNote} numberOfLines={2}>
            💬 {task.note}
          </Text>
        )}
      </View>

      <Ionicons
        name={task.note ? 'chatbubble' : 'chevron-forward'}
        size={task.note ? 14 : 16}
        color={task.note ? colors.green : colors.gray[300]}
      />
    </Pressable>
  )
}

function ProgramCard({ program }: { program: ProgramSummary }) {
  // Doit rester au-dessus des `return` de statut : déclaré plus bas, ce hook
  // n'existerait pas sur une carte « bilan dû » puis apparaîtrait sur une carte
  // normale, et React planterait sur un changement du nombre de hooks.
  const [openTask, setOpenTask] = useState<DailyTask | null>(null)
  const restartWeek = useTrainingStore((st) => st.restartWeek)

  // La carte de suivi mène à la progression, qui donne accès au plan. Envoyer
  // directement sur le plan enterrait l'évolution des notes, qui est la
  // contrepartie du bilan hebdomadaire.
  const openProgram = () =>
    router.push({ pathname: '/training/program/[id]', params: { id: String(program.id) } })

  // Cycle terminé : on propose d'enchaîner plutôt que de laisser le suivi mort.
  if (program.status === 'completed') {
    return (
      <Pressable onPress={openProgram} style={({ pressed }) => [s.card, shadow.sm, pressed && s.pressed]}>
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
          <Text style={s.ctaBannerText}>Voir la progression et lancer le cycle suivant</Text>
        </View>
      </Pressable>
    )
  }

  // Bilan hebdomadaire dû : les exercices sont masqués tant qu'il n'est pas fait.
  if (program.checkinDue) {
    return (
      <View style={[s.card, s.cardLocked, shadow.sm]}>
        <View style={s.headRow}>
          <Text style={s.headEmoji}>{program.isStale ? '🌱' : '📋'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.headTitle}>
              {program.isStale ? 'On reprend quand vous voulez' : `Bilan de la semaine ${program.week}`}
            </Text>
            <Text style={s.headSub}>
              {program.petName}
              {program.isStale
                ? ` · ${program.daysSinceWeekStart} jours sans séance`
                : ' · à faire pour débloquer la suite'}
            </Text>
          </View>
        </View>

        <Text style={s.lockedText}>
          {program.isStale
            ? `Le suivi est en pause depuis un moment. Un bilan sur une semaine non travaillée fausserait vos notes : mieux vaut relancer la semaine ${program.week} et repartir tranquillement.`
            : `Une dizaine de questions sur ce que vous avez travaillé cette semaine. Vos notes sont mises à jour, puis la semaine ${program.week + 1} s'ouvre.`}
        </Text>

        <Pressable
          onPress={() => {
            Haptics.selectionAsync().catch(() => {})
            if (program.isStale) {
              Alert.alert(
                `Relancer la semaine ${program.week} ?`,
                'Vos notes restent inchangées et les exercices redeviennent disponibles dès aujourd\'hui.',
                [
                  { text: 'Annuler', style: 'cancel' },
                  { text: 'Relancer', onPress: () => restartWeek(program.id) },
                ]
              )
            } else {
              router.push({ pathname: '/training/checkin/[id]', params: { id: String(program.id) } })
            }
          }}
          style={({ pressed }) => [
            s.lockedCta,
            program.isStale && { backgroundColor: colors.green },
            pressed && { opacity: 0.9 },
          ]}
        >
          <Text style={s.lockedCtaText}>
            {program.isStale ? `Relancer la semaine ${program.week}` : 'Faire le bilan'}
          </Text>
          <Ionicons name="arrow-forward" size={16} color={colors.white} />
        </Pressable>

        {program.isStale && (
          <Pressable
            onPress={() =>
              router.push({ pathname: '/training/checkin/[id]', params: { id: String(program.id) } })
            }
            style={s.secondaryLink}
          >
            <Text style={s.secondaryLinkText}>Faire le bilan quand même</Text>
          </Pressable>
        )}
      </View>
    )
  }

  const allDone = program.totalCount > 0 && program.doneCount >= program.totalCount

  return (
    <View style={[s.card, shadow.sm]}>
      <Pressable onPress={openProgram} style={s.headRow}>
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
          <TaskRow
            key={task.key}
            program={program}
            task={task}
            onOpen={() => {
              Haptics.selectionAsync().catch(() => {})
              setOpenTask(task)
            }}
          />
        ))}
      </View>

      <Text style={s.footNote}>
        {allDone
          ? `Journée bouclée 🎉 Bilan de la semaine dans ${program.daysUntilCheckin} j.`
          : `Bilan de la semaine dans ${program.daysUntilCheckin} j.`}
      </Text>

      <TaskDetailSheet
        visible={openTask !== null}
        // La tâche vient du store pour que la note enregistrée se reflète
        // aussitôt dans la fiche restée ouverte.
        task={openTask ? (program.tasks.find((t) => t.key === openTask.key) ?? openTask) : null}
        programId={program.id}
        onClose={() => setOpenTask(null)}
      />
    </View>
  )
}

export function TrainingFollowUp() {
  const programs = useTrainingStore((s) => s.programs)
  const [showReminders, setShowReminders] = useState(false)

  // Les rappels sont reposés à chaque changement de programme : la semaine
  // courante, le nombre d'exercices restants et la date du bilan y figurent,
  // donc un rappel obsolète annoncerait n'importe quoi.
  useEffect(() => {
    if (programs.length === 0) return
    syncTrainingReminders(programs).catch((e) =>
      console.warn('[training] rappels non programmés', e)
    )
  }, [programs])

  if (programs.length === 0) return null

  return (
    <View>
      <View style={s.sectionRow}>
        <Text style={s.sectionTitle}>Mon éducation canine</Text>
        <Pressable
          onPress={() => {
            Haptics.selectionAsync().catch(() => {})
            setShowReminders(true)
          }}
          hitSlop={10}
          style={s.bellBtn}
        >
          <Ionicons name="notifications-outline" size={18} color={colors.greenDark} />
        </Pressable>
      </View>

      <TrainingReminderSheet visible={showReminders} onClose={() => setShowReminders(false)} />
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
  bellBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.greenLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

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
  taskNote: { fontSize: 11.5, color: colors.greenDark, marginTop: 4, lineHeight: 16, fontStyle: 'italic' },

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
  secondaryLink: { alignItems: 'center', paddingVertical: 10, marginTop: 2 },
  secondaryLinkText: { fontSize: 12.5, fontWeight: '600', color: colors.gray[600] },

  ctaBanner: {
    backgroundColor: colors.greenLight,
    borderRadius: radius.md,
    padding: 10,
    marginTop: 12,
  },
  ctaBannerText: { fontSize: 12.5, fontWeight: '700', color: colors.greenDark, textAlign: 'center' },
})
