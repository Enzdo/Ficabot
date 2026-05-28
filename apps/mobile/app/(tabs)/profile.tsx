import { useEffect, useState } from 'react'
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import * as SecureStore from 'expo-secure-store'
import { useAuthStore } from '@/stores/auth'
import { usePetsStore } from '@/stores/pets'
import { useChatStore } from '@/stores/chat'
import { useExpensesStore } from '@/stores/expenses'
import { api } from '@/services/api'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { BottomModal } from '@/components/ui/BottomModal'
import { scheduleTestNotification } from '@/services/notifications'
import { colors, radius, shadow } from '@/constants/theme'

const NOTIF_KEY = 'notif_prefs'

type NotifPrefs = {
  appointments: boolean
  reminders: boolean
  vaccines: boolean
  treatments: boolean
}

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
  const [showEditModal, setShowEditModal] = useState(false)
  const [form, setForm] = useState({ firstName: user?.firstName ?? '', lastName: user?.lastName ?? '', phone: user?.phone ?? '', newEmail: '', emailPassword: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!showEditModal) {
      setForm({ firstName: user?.firstName ?? '', lastName: user?.lastName ?? '', phone: user?.phone ?? '', newEmail: '', emailPassword: '' })
    }
  }, [user, showEditModal])

  // Notifications
  const [showNotifModal, setShowNotifModal] = useState(false)
  const [notifPrefs, setNotifPrefs] = useState<NotifPrefs>({ appointments: true, reminders: true, vaccines: true, treatments: true })
  const [testingNotif, setTestingNotif] = useState(false)

  useEffect(() => {
    SecureStore.getItemAsync(NOTIF_KEY).then((val) => {
      if (val) setNotifPrefs(JSON.parse(val))
    })
  }, [])

  const toggleNotif = async (key: keyof NotifPrefs) => {
    Haptics.selectionAsync()
    const next = { ...notifPrefs, [key]: !notifPrefs[key] }
    setNotifPrefs(next)
    await SecureStore.setItemAsync(NOTIF_KEY, JSON.stringify(next))
  }

  const handleTestNotification = async () => {
    setTestingNotif(true)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    const ok = await scheduleTestNotification()
    setTestingNotif(false)
    if (!ok) Alert.alert('Permission refusée', 'Autorisez les notifications dans les réglages iOS pour recevoir des alertes.')
    else Alert.alert('Notification envoyée', 'Vous allez recevoir une notification dans 3 secondes.')
  }

  // Change password
  const [showPwdModal, setShowPwdModal] = useState(false)
  const [pwdForm, setPwdForm] = useState({ current: '', next: '', confirm: '' })
  const [pwdSaving, setPwdSaving] = useState(false)

  const handleChangePassword = async () => {
    if (!pwdForm.current || !pwdForm.next || !pwdForm.confirm) { Alert.alert('Champs requis', 'Remplissez tous les champs'); return }
    if (pwdForm.next.length < 8) { Alert.alert('Mot de passe trop court', 'Minimum 8 caractères'); return }
    if (pwdForm.next !== pwdForm.confirm) { Alert.alert('Erreur', 'Les mots de passe ne correspondent pas'); return }
    setPwdSaving(true)
    const r = await api.put('/auth/password', { currentPassword: pwdForm.current, newPassword: pwdForm.next })
    setPwdSaving(false)
    if (r.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      setShowPwdModal(false)
      setPwdForm({ current: '', next: '', confirm: '' })
      Alert.alert('Succès', 'Mot de passe mis à jour')
    } else {
      Alert.alert('Erreur', r.message ?? 'Impossible de changer le mot de passe')
    }
  }

  const handleSave = async () => {
    if (form.newEmail && !form.emailPassword) {
      Alert.alert('Mot de passe requis', 'Saisissez votre mot de passe actuel pour changer l\'email')
      return
    }
    setSaving(true)
    const profileR = await api.put('/auth/profile', { firstName: form.firstName, lastName: form.lastName, phone: form.phone })
    if (!profileR.success) {
      setSaving(false)
      Alert.alert('Erreur', 'Impossible de mettre à jour le profil')
      return
    }
    if (profileR.data) await updateUser(profileR.data as any)

    if (form.newEmail) {
      const emailR = await api.put('/auth/email', { email: form.newEmail, password: form.emailPassword })
      setSaving(false)
      if (!emailR.success) { Alert.alert('Erreur', emailR.message ?? 'Impossible de changer l\'email'); return }
      if (emailR.data) await updateUser(emailR.data as any)
    } else {
      setSaving(false)
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    setShowEditModal(false)
  }

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Êtes-vous sûr de vouloir vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnecter', style: 'destructive', onPress: async () => { await logout(); resetPets(); resetChat(); resetExpenses(); router.replace('/(auth)/login') } },
    ])
  }

  const firstName   = user?.firstName ?? ''
  const lastName    = user?.lastName  ?? ''
  const hasName     = !!(firstName || lastName)
  const displayName = hasName ? [firstName, lastName].filter(Boolean).join(' ') : ''
  const initials    = hasName
    ? [firstName[0], lastName[0]].filter(Boolean).join('').toUpperCase()
    : (user?.email?.[0] ?? 'U').toUpperCase()

  const isPremium = !!user?.isPremium
  const menuItems: MenuItem[] = [
    { icon: 'person-outline',        label: 'Modifier mon profil', sub: 'Prénom, nom, téléphone',   iconBg: colors.greenLight,  iconColor: colors.greenDark, onPress: () => setShowEditModal(true) },
    { icon: (isPremium ? 'star' : 'star-outline') as any, label: isPremium ? 'Premium actif 👑' : 'Passer à Premium', sub: isPremium ? 'Toutes les fonctionnalités IA débloquées' : "Débloquez l'IA, le scan et plus", iconBg: colors.orangeLight, iconColor: colors.orange, onPress: () => router.push('/paywall') },
    { icon: 'book-outline',          label: 'Blog & conseils',     sub: 'Articles adaptés à vos animaux', iconBg: colors.beigeLight, iconColor: colors.greenDark, onPress: () => router.push('/blog') },
    { icon: 'notifications-outline', label: 'Notifications',       sub: 'Gérer mes alertes',        iconBg: colors.orangeLight, iconColor: colors.orange,   onPress: () => setShowNotifModal(true) },
    { icon: 'lock-closed-outline',   label: 'Sécurité',            sub: 'Changer le mot de passe',  iconBg: colors.beigeLight,  iconColor: colors.gray[700], onPress: () => setShowPwdModal(true) },
    { icon: 'help-circle-outline',   label: 'Aide et support',                                      iconBg: colors.blueLight,   iconColor: colors.blue,      onPress: () => Alert.alert('Bientôt disponible') },
    { icon: 'log-out-outline',       label: 'Se déconnecter',                                       iconBg: colors.redLight,    iconColor: colors.red,       onPress: handleLogout, danger: true },
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
            </View>
            {hasName ? (
              <Text style={styles.displayName}>{displayName}</Text>
            ) : (
              <Pressable onPress={() => setShowEditModal(true)} style={styles.addNameBtn}>
                <Ionicons name="person-add-outline" size={14} color={colors.green} />
                <Text style={styles.addNameText}>Ajouter mon prénom et nom</Text>
              </Pressable>
            )}
            <Text style={styles.email}>{user?.email}</Text>

            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{pets.length}</Text>
                <Text style={styles.statLabel}>{pets.length !== 1 ? 'Animaux' : 'Animal'}</Text>
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

      {/* Modal modifier profil */}
      <BottomModal
        visible={showEditModal}
        title="Modifier mon profil"
        onClose={() => setShowEditModal(false)}
        onConfirm={handleSave}
        saving={saving}
        confirmLabel="Enregistrer"
      >
        <Input
          label="Prénom"
          value={form.firstName}
          onChangeText={(v) => setForm((f) => ({ ...f, firstName: v }))}
          placeholder="Jean"
          autoCapitalize="words"
          leftIcon={<Ionicons name="person-outline" size={18} color={colors.gray[400]} />}
        />
        <Input
          label="Nom"
          value={form.lastName}
          onChangeText={(v) => setForm((f) => ({ ...f, lastName: v }))}
          placeholder="Dupont"
          autoCapitalize="words"
          leftIcon={<Ionicons name="person-outline" size={18} color={colors.gray[400]} />}
        />
        <Input
          label="Téléphone"
          value={form.phone}
          onChangeText={(v) => setForm((f) => ({ ...f, phone: v }))}
          placeholder="+33 6 00 00 00 00"
          keyboardType="phone-pad"
          leftIcon={<Ionicons name="call-outline" size={18} color={colors.gray[400]} />}
        />

        <View style={styles.emailDivider}>
          <View style={styles.emailDividerLine} />
          <Text style={styles.emailDividerText}>Changer l'email</Text>
          <View style={styles.emailDividerLine} />
        </View>
        <Text style={styles.emailCurrent}>Email actuel : {user?.email}</Text>
        <Input
          label="Nouvel email"
          value={form.newEmail}
          onChangeText={(v) => setForm((f) => ({ ...f, newEmail: v }))}
          placeholder="nouveau@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          leftIcon={<Ionicons name="mail-outline" size={18} color={colors.gray[400]} />}
        />
        {form.newEmail.length > 0 && (
          <Input
            label="Mot de passe actuel (requis)"
            value={form.emailPassword}
            onChangeText={(v) => setForm((f) => ({ ...f, emailPassword: v }))}
            secureTextEntry
            placeholder="••••••••"
            leftIcon={<Ionicons name="lock-closed-outline" size={18} color={colors.gray[400]} />}
          />
        )}
      </BottomModal>

      {/* Modal notifications */}
      <BottomModal
        visible={showNotifModal}
        title="Notifications"
        onClose={() => setShowNotifModal(false)}
        onConfirm={() => setShowNotifModal(false)}
        confirmLabel="Fermer"
      >
        {([
          { key: 'appointments', label: 'Rendez-vous',         sub: 'Alertes avant chaque RDV vétérinaire',     icon: 'calendar-outline' },
          { key: 'reminders',    label: 'Rappels personnalisés', sub: 'Vos rappels créés manuellement',          icon: 'notifications-outline' },
          { key: 'vaccines',     label: 'Vaccins',              sub: 'Rappels de renouvellement vaccinal',       icon: 'shield-checkmark-outline' },
          { key: 'treatments',   label: 'Traitements',          sub: 'Antiparasitaires et vermifuges',           icon: 'medkit-outline' },
        ] as { key: keyof NotifPrefs; label: string; sub: string; icon: React.ComponentProps<typeof Ionicons>['name'] }[]).map((item) => (
          <View key={item.key} style={styles.notifRow}>
            <View style={[styles.notifIcon, { backgroundColor: notifPrefs[item.key] ? colors.orangeLight : colors.gray[100] }]}>
              <Ionicons name={item.icon} size={20} color={notifPrefs[item.key] ? colors.orange : colors.gray[400]} />
            </View>
            <View style={styles.notifText}>
              <Text style={styles.notifLabel}>{item.label}</Text>
              <Text style={styles.notifSub}>{item.sub}</Text>
            </View>
            <Switch
              value={notifPrefs[item.key]}
              onValueChange={() => toggleNotif(item.key)}
              trackColor={{ false: colors.gray[200], true: colors.green }}
              thumbColor={colors.white}
            />
          </View>
        ))}

        <Pressable
          onPress={handleTestNotification}
          disabled={testingNotif}
          style={({ pressed }) => [styles.testNotifBtn, pressed && { opacity: 0.75 }]}
        >
          <Ionicons name="notifications" size={18} color={colors.white} />
          <Text style={styles.testNotifText}>
            {testingNotif ? 'Envoi en cours…' : 'Tester une notification'}
          </Text>
        </Pressable>
      </BottomModal>

      {/* Modal changement de mot de passe */}
      <BottomModal
        visible={showPwdModal}
        title="Changer le mot de passe"
        onClose={() => { setShowPwdModal(false); setPwdForm({ current: '', next: '', confirm: '' }) }}
        onConfirm={handleChangePassword}
        saving={pwdSaving}
        confirmLabel="Mettre à jour"
      >
        <Input
          label="Mot de passe actuel"
          value={pwdForm.current}
          onChangeText={(v) => setPwdForm((f) => ({ ...f, current: v }))}
          secureTextEntry
          placeholder="••••••••"
          leftIcon={<Ionicons name="lock-closed-outline" size={18} color={colors.gray[400]} />}
        />
        <Input
          label="Nouveau mot de passe"
          value={pwdForm.next}
          onChangeText={(v) => setPwdForm((f) => ({ ...f, next: v }))}
          secureTextEntry
          placeholder="Minimum 8 caractères"
          leftIcon={<Ionicons name="lock-open-outline" size={18} color={colors.gray[400]} />}
        />
        <Input
          label="Confirmer le mot de passe"
          value={pwdForm.confirm}
          onChangeText={(v) => setPwdForm((f) => ({ ...f, confirm: v }))}
          secureTextEntry
          placeholder="Répétez le nouveau mot de passe"
          leftIcon={<Ionicons name="checkmark-circle-outline" size={18} color={colors.gray[400]} />}
        />
      </BottomModal>
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
  displayName: { fontSize: 22, fontWeight: '800', color: colors.white },
  email:       { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4 },
  addNameBtn:  { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(126,177,63,0.15)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.full, borderWidth: 1, borderColor: 'rgba(126,177,63,0.3)' },
  addNameText: { fontSize: 13, fontWeight: '600', color: colors.green },

  statsRow: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: 20, backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.xl, paddingVertical: 14, paddingHorizontal: 20,
  },
  stat:         { flex: 1, alignItems: 'center' },
  statValue:    { fontSize: 22, fontWeight: '800', color: colors.white },
  statLabel:    { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2, fontWeight: '600' },
  statDivider:  { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.12)' },

  menuItem:        { flexDirection: 'row', alignItems: 'center', paddingVertical: 13 },
  menuItemPressed: { opacity: 0.6 },
  menuIconWrap:    { width: 40, height: 40, borderRadius: radius.xl, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  menuText:        { flex: 1 },
  menuLabel:       { fontSize: 15, fontWeight: '600', color: colors.dark },
  menuLabelDanger: { color: colors.red },
  menuSub:         { fontSize: 12, color: colors.gray[400], marginTop: 2 },
  divider:         { height: 1, backgroundColor: colors.gray[100], marginLeft: 54 },

  version: { textAlign: 'center', fontSize: 11, color: colors.gray[400], paddingTop: 4 },

  emailDivider:     { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  emailDividerLine: { flex: 1, height: 1, backgroundColor: colors.gray[200] },
  emailDividerText: { fontSize: 12, fontWeight: '700', color: colors.gray[400], textTransform: 'uppercase', letterSpacing: 0.5 },
  emailCurrent:     { fontSize: 12, color: colors.gray[400], marginTop: -4 },

  testNotifBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, backgroundColor: colors.dark,
    borderRadius: radius.xl, paddingVertical: 14, marginTop: 8,
  },
  testNotifText: { fontSize: 15, fontWeight: '700', color: colors.white },

  notifRow:   { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 4 },
  notifIcon:  { width: 44, height: 44, borderRadius: radius.xl, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  notifText:  { flex: 1 },
  notifLabel: { fontSize: 15, fontWeight: '600', color: colors.dark },
  notifSub:   { fontSize: 12, color: colors.gray[400], marginTop: 2 },
})
