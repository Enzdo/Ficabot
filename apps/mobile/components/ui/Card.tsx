import { Pressable, StyleSheet, View } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import { colors, radius, shadow } from '@/constants/theme'

interface CardProps {
  children: React.ReactNode
  onPress?: () => void
  style?: StyleProp<ViewStyle>
}

export function Card({ children, onPress, style }: CardProps) {
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.card, pressed && styles.pressed, style]}
      >
        {children}
      </Pressable>
    )
  }
  return <View style={[styles.card, style]}>{children}</View>
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius['2xl'],
    padding: 16,
    borderWidth: 1,
    borderColor: colors.gray[200],
    ...shadow.sm,
  },
  pressed: { opacity: 0.88, transform: [{ scale: 0.985 }] },
})
