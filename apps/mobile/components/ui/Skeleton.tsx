import { useEffect, useRef } from 'react'
import { Animated, StyleSheet, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { colors, radius } from '@/constants/theme'

interface SkeletonProps {
  width?: number | string
  height?: number
  borderRadius?: number
  style?: object
}

export function Skeleton({ width = '100%', height = 16, borderRadius = radius.md, style }: SkeletonProps) {
  const shimmerX = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(shimmerX, { toValue: 1, duration: 1100, useNativeDriver: true })
    )
    anim.start()
    return () => anim.stop()
  }, [shimmerX])

  const translateX = shimmerX.interpolate({ inputRange: [0, 1], outputRange: [-280, 280] })

  return (
    <View
      style={[{ width: width as any, height, borderRadius, backgroundColor: colors.gray[200], overflow: 'hidden' }, style]}
    >
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateX }] }]}>
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.55)', 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ width: 200, height: '100%', alignSelf: 'center' }}
        />
      </Animated.View>
    </View>
  )
}

export function PetCardSkeleton() {
  return (
    <View style={sk.card}>
      <Skeleton width={60} height={60} borderRadius={radius.lg} />
      <View style={sk.info}>
        <Skeleton width="60%" height={16} style={sk.mb8} />
        <Skeleton width="40%" height={12} />
      </View>
    </View>
  )
}

export function MedicalRecordSkeleton() {
  return (
    <View style={sk.card}>
      <Skeleton width={44} height={44} borderRadius={radius.lg} />
      <View style={sk.info}>
        <Skeleton width="70%" height={14} style={sk.mb8} />
        <Skeleton width="50%" height={12} style={sk.mb8} />
        <Skeleton width="35%" height={11} />
      </View>
    </View>
  )
}

export function ConversationSkeleton() {
  return (
    <View style={sk.convRow}>
      <Skeleton width={40} height={40} borderRadius={20} />
      <View style={sk.info}>
        <Skeleton width="55%" height={13} style={sk.mb8} />
        <Skeleton width="80%" height={11} />
      </View>
    </View>
  )
}

const sk = StyleSheet.create({
  card:    { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, borderRadius: radius['2xl'], padding: 16, borderWidth: 1, borderColor: colors.gray[200], marginBottom: 10 },
  info:    { flex: 1 },
  mb8:     { marginBottom: 8 },
  convRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderBottomWidth: 1, borderBottomColor: colors.gray[100] },
})
