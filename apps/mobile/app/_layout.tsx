import { useEffect } from 'react'
import { Stack, usePathname } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useAuthStore } from '@/stores/auth'
import { requestNotificationPermission } from '@/services/notifications'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { trace } from '@/services/crashLog'

SplashScreen.preventAutoHideAsync()

/** Note chaque écran traversé, pour situer un plantage qui n'a rien dit. */
function RouteTrail() {
  const pathname = usePathname()
  useEffect(() => { trace(`écran ${pathname}`) }, [pathname])
  return null
}

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
        <RouteTrail />
        <Stack screenOptions={{ headerShown: false }} />
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </ErrorBoundary>
  )
}
