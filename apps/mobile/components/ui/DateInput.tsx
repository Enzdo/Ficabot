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

  const handleConfirm = () => {
    setShow(false)
    onChange(toISO(tempDate, mode))
  }

  const isEmpty = !value || isNaN(new Date(value).getTime())

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Pressable
        style={({ pressed }) => [styles.btn, show && styles.btnActive, pressed && styles.btnPressed]}
        onPress={() => { setTempDate(toDate(value)); setShow((v) => !v) }}
      >
        <Ionicons name="calendar-outline" size={16} color={isEmpty ? colors.gray[400] : colors.dark} />
        <Text style={[styles.text, isEmpty && styles.placeholder]}>
          {isEmpty ? 'Choisir une date' : display(value, mode)}
        </Text>
        <Ionicons name={show ? 'chevron-up' : 'chevron-down'} size={14} color={colors.gray[400]} />
      </Pressable>

      {show && Platform.OS === 'ios' && (
        <View style={styles.pickerWrap}>
          <View style={styles.iosActions}>
            <Pressable onPress={() => setShow(false)} hitSlop={12}>
              <Text style={styles.iosCancel}>Annuler</Text>
            </Pressable>
            <Pressable onPress={handleConfirm} hitSlop={12}>
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
            themeVariant="light"
          />
        </View>
      )}

      {show && Platform.OS === 'android' && (
        <DateTimePicker
          value={tempDate}
          mode={mode === 'datetime' ? 'date' : mode}
          display="default"
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  label:   { fontSize: 13, fontWeight: '600', color: colors.gray[600], marginLeft: 2 },

  btn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.white, borderWidth: 1.5,
    borderColor: colors.gray[200], borderRadius: radius.xl,
    paddingHorizontal: 14, paddingVertical: 13,
  },
  btnActive:   { borderColor: colors.green },
  btnPressed:  { borderColor: colors.green },
  text:        { flex: 1, fontSize: 15, color: colors.dark },
  placeholder: { color: colors.gray[400] },

  pickerWrap: {
    backgroundColor: colors.white, borderRadius: radius.xl,
    borderWidth: 1.5, borderColor: colors.green,
    overflow: 'hidden',
  },

  iosActions: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: colors.gray[200],
  },
  iosCancel: { fontSize: 15, color: colors.gray[500] },
  iosDone:   { fontSize: 15, fontWeight: '700', color: colors.green },
})
