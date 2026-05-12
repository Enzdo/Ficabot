import { useEffect, useRef } from 'react'
import { Redirect, Tabs } from 'expo-router'
import { useAuthStore } from '@/stores/auth'
import { Ionicons } from '@expo/vector-icons'
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, radius } from '@/constants/theme'

type IoniconName = React.ComponentProps<typeof Ionicons>['name']

const TABS: { name: string; title: string; icon: IoniconName }[] = [
  { name: 'index',        title: 'Accueil',   icon: 'home'        },
  { name: 'pets',         title: 'Animaux',   icon: 'paw'         },
  { name: 'chat',         title: 'Assistant', icon: 'chatbubbles' },
  { name: 'appointments', title: 'RDV',       icon: 'calendar'    },
  { name: 'profile',      title: 'Profil',    icon: 'person'      },
]

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets()
  const scaleValues = useRef(state.routes.map(() => new Animated.Value(1))).current

  useEffect(() => {
    scaleValues.forEach((sv: Animated.Value, i: number) => {
      Animated.spring(sv, {
        toValue: state.index === i ? 1.18 : 1,
        useNativeDriver: true,
        tension: 130,
        friction: 8,
      }).start()
    })
  }, [state.index])

  return (
    <View style={[tabStyles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {(state.routes as any[]).filter((route: any) => TABS.some((t) => route.name.startsWith(t.name))).map((route: any) => {
        const routeIndex = state.routes.indexOf(route)
        const tab = TABS.find((t) => route.name.startsWith(t.name))!
        const isFocused = state.index === routeIndex
        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true })
          if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name as never)
        }
        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={({ pressed }) => [tabStyles.tab, pressed && tabStyles.tabPressed]}
            accessibilityRole="button"
            accessibilityState={{ selected: isFocused }}
          >
            <Animated.View
              style={[
                tabStyles.iconWrap,
                isFocused && tabStyles.iconWrapActive,
                { transform: [{ scale: scaleValues[routeIndex] }] },
              ]}
            >
              <Ionicons
                name={isFocused ? tab.icon : (`${tab.icon}-outline` as IoniconName)}
                size={22}
                color={isFocused ? colors.green : colors.gray[400]}
              />
            </Animated.View>
            <Text style={[tabStyles.label, isFocused && tabStyles.labelActive]}>
              {tab.title}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const tabStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    paddingTop: 10,
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingBottom: Platform.OS === 'android' ? 4 : 0,
  },
  tabPressed: { opacity: 0.65 },
  iconWrap: {
    width: 48, height: 32,
    borderRadius: radius.xl,
    alignItems: 'center', justifyContent: 'center',
  },
  iconWrapActive: { backgroundColor: colors.greenLight },
  label: { fontSize: 10, fontWeight: '600', color: colors.gray[400] },
  labelActive: { color: colors.green },
})

export default function TabsLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="pets" />
      <Tabs.Screen name="chat" />
      <Tabs.Screen name="appointments" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="expenses" options={{ href: null }} />
    </Tabs>
  )
}
