import { useEffect, useState } from 'react'
import { Modal, Platform, Pressable, StyleSheet, Switch, Text, View } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import {
  getReminderSettings,
  saveReminderSettings,
  syncTrainingReminders,
} from '@/services/trainingNotifications'
import { useTrainingStore } from '@/stores/training'
import { colors, radius } from '@/constants/theme'

/**
 * Réglage des rappels du suivi : activés ou non, et à quelle heure.
 *
 * Une seule heure pour tous les chiens — c'est la disponibilité du
 * propriétaire qui compte, pas celle de l'animal.
 */

interface Props {
  visible: boolean
  onClose: () => void
}

function toDate(time: string): Date {
  const [h, m] = time.split(':').map((n) => Number.parseInt(n, 10))
  const d = new Date()
  d.setHours(Number.isFinite(h) ? h : 18, Number.isFinite(m) ? m : 0, 0, 0)
  return d
}

function toTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

export function TrainingReminderSheet({ visible, onClose }: Props) {
  const programs = useTrainingStore((s) => s.programs)

  const [enabled, setEnabled] = useState(true)
  const [date, setDate] = useState(toDate('18:00'))
  const [showPicker, setShowPicker] = useState(Platform.OS === 'ios')

  useEffect(() => {
    if (!visible) return
    getReminderSettings().then((s) => {
      setEnabled(s.enabled)
      setDate(toDate(s.time))
    })
  }, [visible])

  async function persist(nextEnabled: boolean, nextDate: Date) {
    await saveReminderSettings({ enabled: nextEnabled, time: toTime(nextDate) })
    await syncTrainingReminders(programs)
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={s.backdrop} onPress={onClose}>
        <Pressable style={s.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={s.header}>
            <Text style={s.title}>Rappels d'éducation</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={22} color={colors.gray[500]} />
            </Pressable>
          </View>

          <View style={s.row}>
            <View style={{ flex: 1 }}>
              <Text style={s.rowTitle}>Rappel quotidien</Text>
              <Text style={s.rowDesc}>
                Une notification par jour avec les exercices restants, et une relance quand
                le bilan de la semaine est disponible.
              </Text>
            </View>
            <Switch
              value={enabled}
              onValueChange={(v) => {
                Haptics.selectionAsync().catch(() => {})
                setEnabled(v)
                persist(v, date)
              }}
              trackColor={{ true: colors.green, false: colors.gray[300] }}
            />
          </View>

          {enabled && (
            <View style={s.pickerBlock}>
              <Text style={s.pickerLabel}>À quelle heure ?</Text>

              {Platform.OS === 'android' && !showPicker && (
                <Pressable onPress={() => setShowPicker(true)} style={s.timeButton}>
                  <Ionicons name="time-outline" size={18} color={colors.greenDark} />
                  <Text style={s.timeButtonText}>{toTime(date)}</Text>
                </Pressable>
              )}

              {(Platform.OS === 'ios' || showPicker) && (
                <DateTimePicker
                  value={date}
                  mode="time"
                  is24Hour
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(_, selected) => {
                    if (Platform.OS === 'android') setShowPicker(false)
                    if (!selected) return
                    setDate(selected)
                    persist(enabled, selected)
                  }}
                  style={Platform.OS === 'ios' ? { height: 150 } : undefined}
                />
              )}

              <Text style={s.hint}>
                Choisissez un moment où vous êtes réellement avec votre chien — la fin
                d'après-midi marche mieux que le matin pressé.
              </Text>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(26,22,20,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius['3xl'],
    borderTopRightRadius: radius['3xl'],
    padding: 24,
    paddingBottom: 40,
    gap: 18,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 19, fontWeight: '800', color: colors.dark },

  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  rowTitle: { fontSize: 15, fontWeight: '700', color: colors.dark },
  rowDesc: { fontSize: 12.5, color: colors.gray[600], marginTop: 4, lineHeight: 18 },

  pickerBlock: { borderTopWidth: 1, borderTopColor: colors.gray[100], paddingTop: 16, gap: 10 },
  pickerLabel: { fontSize: 14, fontWeight: '700', color: colors.dark },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    backgroundColor: colors.greenLight,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.full,
  },
  timeButtonText: { fontSize: 16, fontWeight: '800', color: colors.greenDark },
  hint: { fontSize: 12, color: colors.gray[500], lineHeight: 17 },
})
