import { Redirect } from 'expo-router'
import type { Href } from 'expo-router'
import { useAuthStore } from '@/stores/auth'

export default function Index() {
  const isLoading = useAuthStore((s) => s.isLoading)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const onboardingDone = useAuthStore((s) => s.onboardingDone)

  if (isLoading) return null

  if (!onboardingDone) return <Redirect href={'/onboarding' as Href} />
  return <Redirect href={isAuthenticated ? '/(tabs)' : '/(auth)/login'} />
}
