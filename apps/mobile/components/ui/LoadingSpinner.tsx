import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { colors } from '@/constants/theme'

interface LoadingSpinnerProps {
  size?: 'small' | 'large'
  color?: string
  fullScreen?: boolean
}

export function LoadingSpinner({
  size = 'large',
  color = colors.green,
  fullScreen = false,
}: LoadingSpinnerProps) {
  return (
    <View style={fullScreen ? styles.fullScreen : styles.centered}>
      <ActivityIndicator size={size} color={color} />
    </View>
  )
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.beigePale,
  },
  centered: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
