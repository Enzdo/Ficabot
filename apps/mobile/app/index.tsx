import { useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { Redirect } from 'expo-router'
import type { Href } from 'expo-router'
import { useAuthStore } from '@/stores/auth'
import { api, secureStorage } from '@/services/api'
import { colors } from '@/constants/theme'
import type { Pet } from '@/types'

export default function Index() {
  const isLoading = useAuthStore((s) => s.isLoading)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const onboardingDone = useAuthStore((s) => s.onboardingDone)
  const userId = useAuthStore((s) => s.user?.id)

  // Un compte sans aucun animal passe par l'onboarding conversationnel,
  // sauf s'il l'a déjà terminé ou explicitement passé sur cet appareil.
  const [needsPetSetup, setNeedsPetSetup] = useState<boolean | null>(null)

  useEffect(() => {
    if (isLoading || !isAuthenticated || !userId) return
    let cancelled = false

    ;(async () => {
      const [alreadyDone, response] = await Promise.all([
        secureStorage.getPetSetup(userId),
        api.get<Pet[]>('/pets'),
      ])
      if (cancelled) return
      // En cas d'échec réseau on n'impose pas le parcours : l'app s'ouvre normalement.
      setNeedsPetSetup(alreadyDone !== 'true' && response.success && (response.data?.length ?? 0) === 0)
    })()

    return () => { cancelled = true }
  }, [isLoading, isAuthenticated, userId])

  if (isLoading) return null

  if (!onboardingDone) return <Redirect href={'/onboarding' as Href} />
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />

  if (needsPetSetup === null) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={colors.green} />
      </View>
    )
  }

  return <Redirect href={(needsPetSetup ? '/pet-setup' : '/(tabs)') as Href} />
}

const styles = StyleSheet.create({
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.beigePale },
})
