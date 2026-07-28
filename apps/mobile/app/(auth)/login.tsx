import { useState } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Link, router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { colors, radius, shadow } from '@/constants/theme'

export default function LoginScreen() {
  const login = useAuthStore((s) => s.login)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    if (!email || !password) { setError('Veuillez remplir tous les champs'); return }
    setLoading(true); setError('')
    const result = await login(email, password)
    setLoading(false)
    // Passe par la racine : elle oriente vers l'onboarding « premier animal » si besoin.
    if (result.success) router.replace('/')
    else setError(result.message ?? 'Identifiants invalides')
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
            <Text style={styles.appTagline}>L'assistant santé pour vos animaux</Text>
          </View>

          <View style={[styles.card, shadow.sm]}>
            <Text style={styles.title}>Connexion</Text>
            <Text style={styles.subtitle}>Bienvenue ! Connectez-vous à votre compte.</Text>

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color={colors.red} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.fields}>
              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                placeholder="votre@email.com"
                leftIcon={<Ionicons name="mail-outline" size={18} color={colors.gray[400]} />}
              />
              <Input
                label="Mot de passe"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholder="••••••••"
                autoComplete="password"
                leftIcon={<Ionicons name="lock-closed-outline" size={18} color={colors.gray[400]} />}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.showPassBtn}>
                <Text style={styles.showPassText}>{showPassword ? 'Masquer' : 'Afficher'} le mot de passe</Text>
              </Pressable>
            </View>

            <Button title="Se connecter" onPress={handleLogin} loading={loading} style={styles.btn} />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Pas encore de compte ? </Text>
            <Link href="/(auth)/register" asChild>
              <Pressable><Text style={styles.link}>S'inscrire</Text></Pressable>
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

  logoSection: { alignItems: 'center', marginBottom: 36, marginTop: 24 },
  logoBox: {
    width: 88, height: 88, borderRadius: radius['3xl'],
    backgroundColor: colors.dark,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  logoEmoji:   { fontSize: 44 },
  appName:     { fontSize: 32, fontWeight: '800', color: colors.dark },
  appTagline:  { fontSize: 14, color: colors.gray[500], marginTop: 6 },

  card: { backgroundColor: colors.white, borderRadius: radius['3xl'], padding: 24, borderWidth: 1, borderColor: colors.gray[200] },
  title:    { fontSize: 24, fontWeight: '800', color: colors.dark, marginBottom: 4 },
  subtitle: { fontSize: 14, color: colors.gray[500], marginBottom: 24 },

  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.redLight, borderWidth: 1, borderColor: colors.red, borderRadius: radius.lg, padding: 12, marginBottom: 16 },
  errorText: { color: colors.red, fontSize: 13, flex: 1 },

  fields:       { gap: 16 },
  showPassBtn:  { alignSelf: 'flex-end', marginTop: -4 },
  showPassText: { fontSize: 12, color: colors.green, fontWeight: '600' },
  btn:          { marginTop: 24 },

  footer:      { flexDirection: 'row', justifyContent: 'center', marginTop: 28 },
  footerText:  { color: colors.gray[500], fontSize: 14 },
  link:        { color: colors.green, fontWeight: '700', fontSize: 14 },
})
