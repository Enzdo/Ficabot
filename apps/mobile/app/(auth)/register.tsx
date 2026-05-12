import { useState } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Link, router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { colors, radius, shadow } from '@/constants/theme'

export default function RegisterScreen() {
  const register = useAuthStore((s) => s.register)
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRegister = async () => {
    if (!form.email || !form.password) { setError('Email et mot de passe requis'); return }
    setLoading(true); setError('')
    const result = await register(form)
    setLoading(false)
    if (result.success) router.replace('/(tabs)')
    else setError(result.message ?? "Erreur lors de l'inscription")
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          <View style={styles.logoSection}>
            <View style={[styles.logoBox, shadow.dark]}>
              <Text style={styles.logoEmoji}>🐾</Text>
            </View>
            <Text style={styles.appName}>Ficana</Text>
            <Text style={styles.appTagline}>Créez votre compte</Text>
          </View>

          <View style={[styles.card, shadow.sm]}>
            <Text style={styles.title}>Inscription</Text>
            <Text style={styles.subtitle}>Rejoignez des milliers de propriétaires d'animaux.</Text>

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color={colors.red} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.fields}>
              <View style={styles.row}>
                <View style={styles.half}>
                  <Input label="Prénom" value={form.firstName} onChangeText={(v) => setForm((f) => ({ ...f, firstName: v }))} placeholder="Jean" autoCapitalize="words" />
                </View>
                <View style={styles.half}>
                  <Input label="Nom" value={form.lastName} onChangeText={(v) => setForm((f) => ({ ...f, lastName: v }))} placeholder="Dupont" autoCapitalize="words" />
                </View>
              </View>
              <Input
                label="Email"
                value={form.email}
                onChangeText={(v) => setForm((f) => ({ ...f, email: v }))}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="votre@email.com"
                leftIcon={<Ionicons name="mail-outline" size={18} color={colors.gray[400]} />}
              />
              <Input
                label="Mot de passe"
                value={form.password}
                onChangeText={(v) => setForm((f) => ({ ...f, password: v }))}
                secureTextEntry={!showPassword}
                placeholder="Minimum 8 caractères"
                leftIcon={<Ionicons name="lock-closed-outline" size={18} color={colors.gray[400]} />}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.showPassBtn}>
                <Text style={styles.showPassText}>{showPassword ? 'Masquer' : 'Afficher'} le mot de passe</Text>
              </Pressable>
            </View>

            <Button title="Créer mon compte" onPress={handleRegister} loading={loading} style={styles.btn} />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Déjà un compte ? </Text>
            <Link href="/(auth)/login" asChild>
              <Pressable><Text style={styles.link}>Se connecter</Text></Pressable>
            </Link>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.beigePale },
  flex:   { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 32, paddingBottom: 40 },

  logoSection: { alignItems: 'center', marginBottom: 32, marginTop: 24 },
  logoBox: {
    width: 88, height: 88, borderRadius: radius['3xl'],
    backgroundColor: colors.dark,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  logoEmoji:  { fontSize: 44 },
  appName:    { fontSize: 32, fontWeight: '800', color: colors.dark },
  appTagline: { fontSize: 14, color: colors.gray[500], marginTop: 6 },

  card:     { backgroundColor: colors.white, borderRadius: radius['3xl'], padding: 24, borderWidth: 1, borderColor: colors.gray[200] },
  title:    { fontSize: 24, fontWeight: '800', color: colors.dark, marginBottom: 4 },
  subtitle: { fontSize: 14, color: colors.gray[500], marginBottom: 24 },

  errorBox:  { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.redLight, borderWidth: 1, borderColor: colors.red, borderRadius: radius.lg, padding: 12, marginBottom: 16 },
  errorText: { color: colors.red, fontSize: 13, flex: 1 },

  fields:       { gap: 16 },
  row:          { flexDirection: 'row', gap: 12 },
  half:         { flex: 1 },
  showPassBtn:  { alignSelf: 'flex-end', marginTop: -4 },
  showPassText: { fontSize: 12, color: colors.green, fontWeight: '600' },
  btn:          { marginTop: 24 },

  footer:     { flexDirection: 'row', justifyContent: 'center', marginTop: 28 },
  footerText: { color: colors.gray[500], fontSize: 14 },
  link:       { color: colors.green, fontWeight: '700', fontSize: 14 },
})
