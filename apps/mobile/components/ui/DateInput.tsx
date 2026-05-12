import { useState } from 'react'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker'
import { Ionicons } from '@expo/vector-icons'
import { colors, radius } from '@/constants/theme'

interface DateInputProps {
  label?: string
  value: string       // YYYY-MM-DD
  onChange: (date: string) => void
  mode?: 'date' | 'datetime'
  minimumDate?: Date
  maximumDate?: Date
}

function toDate(val: string): Date {
  const d = new Date(val)
  return isNaN(d.getTime()) ? new Date() : d
}

function toISO(d: Date, mode: 'date' | 'datetime'): string {
  if (mode === 'datetime') {
    return d.toISOString().slice(0, 16).replace('T', ' ')
  }
  return d.toISOString().slice(0, 10)
}

function display(val: string, mode: 'date' | 'datetime'): string {
  const d = new Date(val)
  if (isNaN(d.getTime())) return 'Choisir une date'
  if (mode === 'datetime') {
    return d.toLocaleDateString('fr-FR') + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString('fr-FR')
}

export function DateInput({ label, value, onChange, mode = 'date', minimumDate, maximumDate }: DateInputProps) {
  const [show, setShow] = useState(false)
  const [tempDate, setTempDate] = useState<Date>(toDate(value))

  const handleChange = (_: DateTimePickerEvent, selected?: Date) => {
    if (!selected) { setShow(false); return }
    setTempDate(selected)
    if (Platform.OS === 'android') {
      setShow(false)
      onChange(toISO(selected, mode))
    }
  }

  const handleIOSConfirm = () => {
    setShow(false)
    onChange(toISO(tempDate, mode))
  }

  const isEmpty = !value || isNaN(new Date(value).getTime())

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Pressable
        style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
        onPress={() => { setTempDate(toDate(value)); setShow(true) }}
      >
        <Ionicons name="calendar-outline" size={16} color={isEmpty ? colors.gray[400] : colors.dark} style={styles.icon} />
        <Text style={[styles.text, isEmpty && styles.placeholder]}>
          {isEmpty ? 'Choisir une date' : display(value, mode)}
        </Text>
        <Ionicons name="chevron-down" size={14} color={colors.gray[400]} />
      </Pressable>

      {show && (
        <>
          {Platform.OS === 'ios' && (
            <View style={styles.iosSheet}>
              <View style={styles.iosHeader}>
                <Pressable onPress={() => setShow(false)}>
                  <Text style={styles.iosCancel}>Annuler</Text>
                </Pressable>
                <Pressable onPress={handleIOSConfirm}>
                  <Text style={styles.iosDone}>OK</Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={tempDate}
                mode={mode}
                display="spinner"
                onChange={handleChange}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                locale="fr-FR"
              />
            </View>
          )}
          {Platform.OS === 'android' && (
            <DateTimePicker
              value={tempDate}
              mode={mode === 'datetime' ? 'date' : mode}
              display="default"
              onChange={handleChange}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
            />
          )}
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper:  { gap: 6 },
  label:    { fontSize: 13, fontWeight: '600', color: colors.gray[600], marginLeft: 2 },
  btn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.white, borderWidth: 1.5,
    borderColor: colors.gray[200], borderRadius: radius.xl,
    paddingHorizontal: 14, paddingVertical: 13, gap: 8,
  },
  btnPressed:  { borderColor: colors.green },
  icon:        { },
  text:        { flex: 1, fontSize: 15, color: colors.dark },
  placeholder: { color: colors.gray[400] },

  iosSheet: {
    backgroundColor: colors.white, borderRadius: radius['2xl'],
    borderWidth: 1, borderColor: colors.gray[200],
    overflow: 'hidden', marginTop: 4,
  },
  iosHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: colors.gray[200],
  },
  iosCancel: { fontSize: 15, color: colors.gray[500] },
  iosDone:   { fontSize: 15, fontWeight: '700', color: colors.green },
})
