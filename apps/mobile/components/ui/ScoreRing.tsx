import { useEffect, useRef, useState } from 'react'
import { Animated, Easing, StyleSheet, Text, View } from 'react-native'
import { colors } from '@/constants/theme'

/**
 * Anneau de progression sans dépendance.
 *
 * Le projet n'embarque ni react-native-svg ni reanimated. Plutôt que d'ajouter
 * une dépendance native pour un seul écran, l'arc est obtenu par découpage :
 * chaque moitié du cercle est un conteneur `overflow: 'hidden'` dans lequel
 * tourne un demi-anneau. On découpe, on ne masque pas — l'anneau reste donc
 * correct par-dessus le dégradé de la carte, ce qu'un cache de couleur unie
 * n'aurait pas permis.
 *
 * Géométrie : un cercle dont seules les bordures haute et droite sont colorées
 * dessine un arc de 180°, centré à 45°. La rotation de base le ramène à midi ;
 * la rotation d'animation le fait ensuite balayer.
 */

interface ScoreRingProps {
  /** 0 → 100 */
  score: number
  size?: number
  stroke?: number
  /** Couleur explicite ; sinon déduite du score (rouge → orange → vert). */
  color?: string
  trackColor?: string
  /** Durée du balayage. 0 pour afficher directement la valeur finale. */
  duration?: number
  label?: string
}

export function scoreColor(score: number): string {
  if (score >= 65) return colors.green
  if (score >= 40) return colors.orange
  return colors.red
}

export function ScoreRing({
  score,
  size = 120,
  stroke = 9,
  color,
  trackColor = colors.gray[200],
  duration = 1100,
  label = '/ 100',
}: ScoreRingProps) {
  const target = Math.max(0, Math.min(100, Math.round(score)))
  const tint = color ?? scoreColor(target)

  // Deux valeurs distinctes : le balayage part sur le driver natif (transform),
  // le compteur reste en JS puisqu'il alimente un état React.
  const sweep = useRef(new Animated.Value(0)).current
  const counter = useRef(new Animated.Value(0)).current
  const [shown, setShown] = useState(duration === 0 ? target : 0)

  useEffect(() => {
    const ratio = target / 100

    if (duration === 0) {
      sweep.setValue(ratio)
      setShown(target)
      return
    }

    sweep.setValue(0)
    counter.setValue(0)
    setShown(0)

    const id = counter.addListener(({ value }) => setShown(Math.round(value)))

    Animated.parallel([
      Animated.timing(sweep, {
        toValue: ratio,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(counter, {
        toValue: target,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start()

    return () => counter.removeListener(id)
  }, [target, duration, sweep, counter])

  const half = size / 2

  const arcStyle = {
    position: 'absolute' as const,
    top: 0,
    width: size,
    height: size,
    borderRadius: half,
    borderWidth: stroke,
    borderTopColor: tint,
    borderRightColor: tint,
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  }

  // Moitié droite : l'arc balaie de 0° à 180°, puis reste plein au-delà.
  const rightRotate = sweep.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['-135deg', '45deg', '45deg'],
  })

  // Moitié gauche : rien avant 50 %, puis balayage de 180° à 360°.
  // Le -1° évite un liseré au point de bascule exact.
  const leftRotate = sweep.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['44deg', '44deg', '225deg'],
  })

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Piste */}
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: half,
          borderWidth: stroke,
          borderColor: trackColor,
        }}
      />

      {/* Moitié gauche (180° → 360°) */}
      <View style={[s.clip, { width: half, height: size, left: 0 }]}>
        <Animated.View style={[arcStyle, { left: 0, transform: [{ rotate: leftRotate }] }]} />
      </View>

      {/* Moitié droite (0° → 180°) */}
      <View style={[s.clip, { width: half, height: size, left: half }]}>
        <Animated.View style={[arcStyle, { left: -half, transform: [{ rotate: rightRotate }] }]} />
      </View>

      <View style={s.center}>
        <Text style={[s.value, { color: tint, fontSize: size * 0.32 }]}>{shown}</Text>
        {!!label && <Text style={s.label}>{label}</Text>}
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  clip: { position: 'absolute', top: 0, overflow: 'hidden' },
  center: { alignItems: 'center', justifyContent: 'center' },
  value: { fontWeight: '900' },
  label: { fontSize: 11, color: colors.gray[500], marginTop: -2 },
})
