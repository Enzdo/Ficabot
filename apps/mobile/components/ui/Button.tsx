import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { colors, radius } from '@/constants/theme'

interface ButtonProps {
  onPress: () => void
  title: string
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  loading?: boolean
  disabled?: boolean
  style?: StyleProp<ViewStyle>
}

export function Button({ onPress, title, variant = 'primary', loading = false, disabled = false, style }: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variant !== 'primary' && styles[variant],
        variant !== 'primary' && isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {variant === 'primary' && (
        <LinearGradient
          colors={isDisabled ? ['#A8C97A', '#A8C97A'] : ['#8EC347', '#7EB13F', '#5C8A2A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, styles.gradient]}
        />
      )}
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? colors.white : colors.green}
          style={styles.spinner}
        />
      )}
      <Text style={[styles.text, styles[`${variant}Text` as keyof typeof styles] as object]}>
        {title}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.xl,
    paddingHorizontal: 20,
    paddingVertical: 14,
    overflow: 'hidden',
    shadowColor: colors.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  gradient:  { borderRadius: radius.xl },
  secondary: { backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.gray[200], shadowColor: colors.dark, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1 },
  ghost:     { backgroundColor: 'transparent', shadowOpacity: 0, elevation: 0 },
  danger:    { backgroundColor: colors.red, shadowColor: colors.red, shadowOpacity: 0.25 },
  disabled:  { opacity: 0.55 },
  pressed:   { opacity: 0.82, transform: [{ scale: 0.98 }] },
  spinner:   { marginRight: 8 },
  text:      { fontSize: 15, fontWeight: '700' },
  primaryText:   { color: colors.white },
  secondaryText: { color: colors.dark },
  ghostText:     { color: colors.green },
  dangerText:    { color: colors.white },
})
