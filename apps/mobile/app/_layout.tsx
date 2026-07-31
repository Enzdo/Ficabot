import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useAuthStore } from '@/stores/auth'
import { requestNotificationPermission } from '@/services/notifications'
import { ErrorBoundary } from '@/components/ErrorBoundary'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const loadFromStorage = useAuthStore((s) => s.loadFromStorage)

  useEffect(() => {
    // Le splash doit disparaître même si la restauration de session échoue :
    // sans ce filet, une lecture de stockage en erreur laissait l'app figée
    // sur l'écran de démarrage, sans aucun message.
    loadFromStorage()
      .catch((e) => console.error('[startup] loadFromStorage', e))
      .finally(() => {
        SplashScreen.hideAsync().catch(() => {})
        requestNotificationPermission().catch((e) =>
          console.error('[startup] notifications', e)
        )
      })
  }, [loadFromStorage])

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }} />
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </ErrorBoundary>
  )
}
