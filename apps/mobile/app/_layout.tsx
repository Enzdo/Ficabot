import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useAuthStore } from '@/stores/auth'
import { requestNotificationPermission } from '@/services/notifications'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const loadFromStorage = useAuthStore((s) => s.loadFromStorage)

  useEffect(() => {
    loadFromStorage().then(() => {
      SplashScreen.hideAsync()
      requestNotificationPermission()
    })
  }, [loadFromStorage])

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  )
}
