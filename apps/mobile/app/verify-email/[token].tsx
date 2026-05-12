import { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button } from '@/components/ui/Button'
import { api } from '@/services/api'
import { colors, radius } from '@/constants/theme'

type Status = 'loading' | 'success' | 'error'

export default function VerifyEmailScreen() {
  const { token } = useLocalSearchParams<{ token: string }>()
  const [status, setStatus] = useState<Status>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) { setStatus('error'); setMessage('Lien invalide.'); return }

    api.get<{ emailVerified: boolean }>(`/auth/verify-email/${token}`)
      .then((res) => {
        if (res.success) {
          setStatus('success')
        } else {
          setStatus('error')
          setMessage(res.message ?? 'Lien invalide ou expiré.')
        }
      })
      .catch(() => {
        setStatus('error')
        setMessage('Erreur de connexion. Vérifiez votre réseau.')
      })
  }, [token])

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.card}>
        {status === 'loading' && (
          <>
            <Text style={s.emoji}>⏳</Text>
            <Text style={s.title}>Vérification en cours…</Text>
          </>
        )}

        {status === 'success' && (
          <>
            <Text style={s.emoji}>✅</Text>
            <Text style={s.title}>Email vérifié !</Text>
            <Text style={s.desc}>Votre compte est maintenant actif. Vous pouvez vous connecter.</Text>
            <Button title="Se connecter" onPress={() => router.replace('/(auth)/login')} style={s.btn} />
          </>
        )}

        {status === 'error' && (
          <>
            <Text style={s.emoji}>❌</Text>
            <Text style={s.title}>Lien invalide</Text>
            <Text style={s.desc}>{message}</Text>
            <Button title="Retour à l'accueil" onPress={() => router.replace('/(auth)/login')} variant="ghost" style={s.btn} />
          </>
        )}
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.beigePale, justifyContent: 'center', padding: 24 },
  card: { backgroundColor: colors.white, borderRadius: radius['2xl'], padding: 32, alignItems: 'center', gap: 14 },
  emoji: { fontSize: 52 },
  title: { fontSize: 22, fontWeight: '800', color: colors.dark, textAlign: 'center' },
  desc:  { fontSize: 14, color: colors.gray[500], textAlign: 'center', lineHeight: 22 },
  btn:   { width: '100%', marginTop: 8 },
})
