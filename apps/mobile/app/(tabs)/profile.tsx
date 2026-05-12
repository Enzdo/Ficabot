import { useEffect, useState } from 'react'
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useAuthStore } from '@/stores/auth'
import { usePetsStore } from '@/stores/pets'
import { useChatStore } from '@/stores/chat'
import { useExpensesStore } from '@/stores/expenses'
import { api } from '@/services/api'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { colors, radius, shadow } from '@/constants/theme'

type MenuItem = {
  icon: React.ComponentProps<typeof Ionicons>['name']
  label: string
  sub?: string
  onPress: () => void
  danger?: boolean
  iconBg: string
  iconColor: string
}

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuthStore()
  const { pets, reset: resetPets } = usePetsStore()
  const resetChat = useChatStore((s) => s.reset)
  const resetExpenses = useExpensesStore((s) => s.reset)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ firstName: user?.firstName ?? '', lastName: user?.lastName ?? '', phone: user?.phone ?? '' })

  useEffect(() => {
    if (!editing) {
      setForm({ firstName: user?.firstName ?? '', lastName: user?.lastName ?? '', phone: user?.phone ?? '' })
    }
  }, [user, editing])
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const r = await api.put('/auth/profile', form)
    setSaving(false)
    if (r.success && r.data) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      await updateUser(r.data as typeof user extends null ? never : NonNullable<typeof user>)
      setEditing(false)
    } else Alert.alert('Erreur', 'Impossible de mettre à jour le profil')
  }

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Êtes-vous sûr de vouloir vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnecter', style: 'destructive', onPress: async () => { await logout(); resetPets(); resetChat(); resetExpenses(); router.replace('/(auth)/login') } },
    ])
  }

  const displayName = user?.firstName ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}` : user?.email ?? 'Utilisateur'
  const initials    = displayName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()

  const menuItems: MenuItem[] = [
    { icon: 'notifications-outline', label: 'Notifications', sub: 'Rappels et alertes',       iconBg: colors.orangeLight, iconColor: colors.orange,   onPress: () => Alert.alert('Bientôt disponible') },
    { icon: 'language-outline',      label: 'Langue',        sub: 'Français',                 iconBg: colors.blueLight,   iconColor: colors.blue,     onPress: () => Alert.alert('Bientôt disponible') },
    { icon: 'lock-closed-outline',   label: 'Sécurité',      sub: 'Changer le mot de passe',  iconBg: colors.beigeLight,  iconColor: colors.gray[700], onPress: () => Alert.alert('Bientôt disponible') },
    { icon: 'help-circle-outline',   label: 'Aide et support',                                iconBg: colors.greenLight,  iconColor: colors.greenDark, onPress: () => Alert.alert('Bientôt disponible') },
    { icon: 'log-out-outline',       label: 'Se déconnecter',                                 iconBg: colors.redLight,    iconColor: colors.red,       onPress: handleLogout, danger: true },
  ]

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={[styles.heroCard, shadow.dark]}>
          <View style={styles.heroBubble} />
          <View style={styles.heroInner}>
            <View style={styles.avatarWrap}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <Pressable onPress={() => setEditing(!editing)} style={styles.editIconBtn}>
                <Ionicons name={editing ? 'close' : 'pencil'} size={14} color={colors.dark} />
              </Pressable>
            </View>
            <Text style={styles.displayName}>{displayName}</Text>
            <Text style={styles.email}>{user?.email}</Text>

            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{pets.length}</Text>
                <Text style={styles.statLabel}>Animal{pets.length !== 1 ? 'x' : ''}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>IA</Text>
                <Text style={styles.statLabel}>Assistant</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>∞</Text>
                <Text style={styles.statLabel}>Suivi</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Formulaire édition */}
        {editing && (
          <Card>
            <Text style={styles.sectionTitle}>Modifier les informations</Text>
            <View style={styles.editFields}>
              <Input label="Prénom" value={form.firstName} onChangeText={(v) => setForm((f) => ({ ...f, firstName: v }))} placeholder="Jean" autoCapitalize="words" />
              <Input label="Nom" value={form.lastName} onChangeText={(v) => setForm((f) => ({ ...f, lastName: v }))} placeholder="Dupont" autoCapitalize="words" />
              <Input label="Téléphone" value={form.phone} onChangeText={(v) => setForm((f) => ({ ...f, phone: v }))} placeholder="+33 6 00 00 00 00" keyboardType="phone-pad" />
            </View>
            <Button title="Enregistrer les modifications" onPress={handleSave} loading={saving} style={styles.saveBtn} />
          </Card>
        )}

        {/* Menu */}
        <Card>
          {menuItems.map((item, index) => (
            <View key={index}>
              <Pressable onPress={() => { Haptics.selectionAsync(); item.onPress() }} style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}>
                <View style={[styles.menuIconWrap, { backgroundColor: item.iconBg }]}>
                  <Ionicons name={item.icon} size={20} color={item.iconColor} />
                </View>
                <View style={styles.menuText}>
                  <Text style={[styles.menuLabel, item.danger && styles.menuLabelDanger]}>{item.label}</Text>
                  {item.sub && <Text style={styles.menuSub}>{item.sub}</Text>}
                </View>
                {!item.danger && <Ionicons name="chevron-forward" size={16} color={colors.gray[300]} />}
              </Pressable>
              {index < menuItems.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </Card>

        <Text style={styles.version}>Ficana v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: colors.beigePale },
  scroll:  { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 40, gap: 16, paddingTop: 12 },

  heroCard:   { backgroundColor: colors.dark, borderRadius: radius['3xl'], overflow: 'hidden' },
  heroBubble: { position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(126,177,63,0.12)' },
  heroInner:  { alignItems: 'center', paddingVertical: 28, paddingHorizontal: 20 },

  avatarWrap: { position: 'relative', marginBottom: 14 },
  avatar: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)',
  },
  avatarText:  { fontSize: 32, fontWeight: '800', color: colors.white },
  editIconBtn: {
    position: 'absolute', bottom: 0, right: -4,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.beige,
    alignItems: 'center', justifyContent: 'center',
    ...shadow.sm,
  },
  displayName: { fontSize: 22, fontWeight: '800', color: colors.white },
  email:       { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4 },

  statsRow: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: 20, backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.xl, paddingVertical: 14, paddingHorizontal: 20,
  },
  stat:         { flex: 1, alignItems: 'center' },
  statValue:    { fontSize: 22, fontWeight: '800', color: colors.white },
  statLabel:    { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2, fontWeight: '600' },
  statDivider:  { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.12)' },

  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.dark, marginBottom: 16 },
  editFields:   { gap: 14 },
  saveBtn:      { marginTop: 16 },

  menuItem:        { flexDirection: 'row', alignItems: 'center', paddingVertical: 13 },
  menuItemPressed: { opacity: 0.6 },
  menuIconWrap:    { width: 40, height: 40, borderRadius: radius.xl, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  menuText:        { flex: 1 },
  menuLabel:       { fontSize: 15, fontWeight: '600', color: colors.dark },
  menuLabelDanger: { color: colors.red },
  menuSub:         { fontSize: 12, color: colors.gray[400], marginTop: 2 },
  divider:         { height: 1, backgroundColor: colors.gray[100], marginLeft: 54 },

  version: { textAlign: 'center', fontSize: 11, color: colors.gray[400], paddingTop: 4 },
})
