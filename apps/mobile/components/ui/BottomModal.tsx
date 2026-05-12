import { memo } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { colors, radius } from '@/constants/theme'

interface BottomModalProps {
  visible: boolean
  title: string
  onClose: () => void
  onConfirm: () => void
  saving?: boolean
  confirmLabel?: string
  children: React.ReactNode
}

export const BottomModal = memo(function BottomModal({
  visible, title, onClose, onConfirm, saving = false, confirmLabel = 'Ajouter', children,
}: BottomModalProps) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.root}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={12}>
            <Text style={styles.cancel}>Annuler</Text>
          </Pressable>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <Pressable onPress={onConfirm} disabled={saving} hitSlop={12}>
            <Text style={[styles.confirm, saving && styles.confirmDisabled]}>
              {saving ? 'En cours…' : confirmLabel}
            </Text>
          </Pressable>
        </View>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.fields} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      </View>
    </Modal>
  )
})

const styles = StyleSheet.create({
  root:            { flex: 1, backgroundColor: colors.beigePale },
  handle:          { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.gray[300], alignSelf: 'center', marginTop: 12, marginBottom: 4 },
  header:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.gray[200], backgroundColor: colors.white },
  cancel:          { fontSize: 15, color: colors.gray[500] },
  title:           { flex: 1, fontSize: 16, fontWeight: '700', color: colors.dark, textAlign: 'center', marginHorizontal: 8 },
  confirm:         { fontSize: 15, fontWeight: '700', color: colors.green },
  confirmDisabled: { color: colors.gray[400] },
  scroll:          { flex: 1, paddingHorizontal: 20 },
  fields:          { gap: 20, paddingTop: 24, paddingBottom: 40 },
})
