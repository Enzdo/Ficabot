import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Ficana',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'default',
    })
  }

  const { status: existing } = await Notifications.getPermissionsAsync()
  if (existing === 'granted') return true

  const { status } = await Notifications.requestPermissionsAsync()
  return status === 'granted'
}

export async function scheduleTestNotification(): Promise<boolean> {
  const granted = await requestNotificationPermission()
  if (!granted) return false

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🐾 Ficana — Test de notification',
      body: 'Les notifications fonctionnent correctement sur votre appareil !',
      sound: true,
    },
    trigger: { seconds: 3 },
  })
  return true
}

export async function scheduleReminderNotification(title: string, body: string, date: Date): Promise<void> {
  const granted = await requestNotificationPermission()
  if (!granted) return

  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: { date },
  })
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync()
}
