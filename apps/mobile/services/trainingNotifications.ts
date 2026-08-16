import * as Notifications from 'expo-notifications'
import * as SecureStore from 'expo-secure-store'
import { requestNotificationPermission } from '@/services/notifications'
import type { ProgramSummary } from '@/stores/training'

/**
 * Rappels du suivi d'éducation.
 *
 * Un programme quotidien sans rappel est oublié en quelques jours : c'est le
 * rappel qui décide si le suivi survit à la première semaine.
 *
 * Les notifications posées ici sont étiquetées `kind: 'training'` pour pouvoir
 * être annulées seules. `cancelAllScheduledNotificationsAsync()` effacerait
 * aussi les rappels de vaccin et de rendez-vous, qui n'ont rien à voir.
 */

const ENABLED_KEY = 'training_reminder_enabled'
const TIME_KEY = 'training_reminder_time'
const DEFAULT_TIME = '18:00'

export interface ReminderSettings {
  enabled: boolean
  /** Format « HH:MM ». */
  time: string
}

export async function getReminderSettings(): Promise<ReminderSettings> {
  const [enabled, time] = await Promise.all([
    SecureStore.getItemAsync(ENABLED_KEY),
    SecureStore.getItemAsync(TIME_KEY),
  ])
  return {
    // Activé par défaut : quelqu'un qui lance un programme de quatre semaines
    // veut être relancé. Le réglage reste désactivable en deux gestes.
    enabled: enabled === null ? true : enabled === 'true',
    time: time ?? DEFAULT_TIME,
  }
}

export async function saveReminderSettings(settings: ReminderSettings): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(ENABLED_KEY, String(settings.enabled)),
    SecureStore.setItemAsync(TIME_KEY, settings.time),
  ])
}

/** Annule les seuls rappels d'éducation, sans toucher aux autres. */
async function cancelTrainingReminders(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync()
  await Promise.all(
    scheduled
      .filter((n) => (n.content.data as { kind?: string } | null)?.kind === 'training')
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier))
  )
}

function parseTime(time: string): { hour: number; minute: number } {
  const [h, m] = time.split(':').map((n) => Number.parseInt(n, 10))
  return {
    hour: Number.isFinite(h) ? Math.min(23, Math.max(0, h)) : 18,
    minute: Number.isFinite(m) ? Math.min(59, Math.max(0, m)) : 0,
  }
}

/**
 * Reprogramme l'ensemble des rappels à partir de l'état courant des programmes.
 *
 * Appelée à chaque changement : on annule puis on repose tout, plutôt que de
 * tenter des mises à jour ciblées qui laisseraient des rappels fantômes après
 * la fin d'un cycle.
 */
export async function syncTrainingReminders(programs: ProgramSummary[]): Promise<void> {
  await cancelTrainingReminders()

  const settings = await getReminderSettings()
  if (!settings.enabled) return

  const active = programs.filter((p) => p.status === 'active')
  if (active.length === 0) return

  const granted = await requestNotificationPermission()
  if (!granted) return

  const { hour, minute } = parseTime(settings.time)

  // ── Rappel quotidien, tous programmes confondus ─────────────────────────
  // Une seule notification même avec plusieurs chiens : trois bannières à
  // 18 h se font désinstaller.
  const pending = active.filter((p) => !p.checkinDue)
  if (pending.length > 0) {
    const names = pending.map((p) => p.petName).filter(Boolean)
    const remaining = pending.reduce((acc, p) => acc + (p.totalCount - p.doneCount), 0)

    const body =
      remaining === 0
        ? 'Tout est coché pour aujourd\'hui, bravo 🎉'
        : pending.length === 1
          ? `${remaining} exercice${remaining > 1 ? 's' : ''} à faire avec ${names[0] ?? 'votre chien'}.`
          : `${remaining} exercices à faire avec ${names.join(' et ')}.`

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🐾 Séance du jour',
        body,
        sound: true,
        data: { kind: 'training', type: 'daily' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    })
  }

  // ── Rappel de bilan hebdomadaire ────────────────────────────────────────
  for (const program of active) {
    // Déjà dû : on relance le jour même plutôt que d'attendre la semaine
    // suivante, mais jamais dans le passé.
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + program.daysUntilCheckin)
    dueDate.setHours(hour, minute, 0, 0)
    if (dueDate.getTime() <= Date.now()) dueDate.setTime(Date.now() + 60 * 60 * 1000)

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📋 Bilan de la semaine',
        body: `Faites le point sur la semaine ${program.week} de ${program.petName ?? 'votre chien'} pour débloquer la suite.`,
        sound: true,
        data: { kind: 'training', type: 'checkin', programId: program.id },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: dueDate,
      },
    })
  }
}

/** Coupe tous les rappels d'éducation, par exemple à la déconnexion. */
export async function clearTrainingReminders(): Promise<void> {
  await cancelTrainingReminders()
}
