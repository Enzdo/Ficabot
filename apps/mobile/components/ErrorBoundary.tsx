import { Component, type ReactNode } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { colors } from '@/constants/theme'

/**
 * Filet de sécurité global.
 *
 * Sans lui, une erreur de rendu ferme l'application sans le moindre message :
 * l'utilisateur voit l'app disparaître, et si l'erreur se reproduit au
 * démarrage il ne peut plus jamais l'ouvrir. On préfère afficher l'erreur,
 * quitte à ce qu'elle soit technique, et laisser une porte de sortie.
 */
interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
  stack: string | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, stack: null }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error }
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    this.setState({ error, stack: info.componentStack ?? null })
    console.error('[ErrorBoundary]', error?.message, error?.stack, info.componentStack)
  }

  reset = () => this.setState({ error: null, stack: null })

  render() {
    const { error, stack } = this.state
    if (!error) return this.props.children

    return (
      <View style={s.root}>
        <ScrollView contentContainerStyle={s.content}>
          <Text style={s.emoji}>🐾</Text>
          <Text style={s.title}>Quelque chose s'est mal passé</Text>
          <Text style={s.intro}>
            L'application a rencontré une erreur inattendue. Le détail ci-dessous nous aide à la corriger.
          </Text>

          <View style={s.card}>
            <Text style={s.label}>Erreur</Text>
            <Text style={s.mono} selectable>
              {error.message || String(error)}
            </Text>
          </View>

          {error.stack ? (
            <View style={s.card}>
              <Text style={s.label}>Pile d'appels</Text>
              <Text style={s.monoSmall} selectable>
                {error.stack.split('\n').slice(0, 12).join('\n')}
              </Text>
            </View>
          ) : null}

          {stack ? (
            <View style={s.card}>
              <Text style={s.label}>Composants</Text>
              <Text style={s.monoSmall} selectable>
                {stack.split('\n').filter(Boolean).slice(0, 10).join('\n')}
              </Text>
            </View>
          ) : null}

          <Pressable style={({ pressed }) => [s.btn, pressed && s.pressed]} onPress={this.reset}>
            <Text style={s.btnText}>Réessayer</Text>
          </Pressable>
        </ScrollView>
      </View>
    )
  }
}

const s = StyleSheet.create({
  root:      { flex: 1, backgroundColor: colors.beigePale },
  content:   { padding: 24, paddingTop: 72, gap: 12 },
  emoji:     { fontSize: 40, textAlign: 'center' },
  title:     { fontSize: 22, fontWeight: '800', color: colors.dark, textAlign: 'center' },
  intro:     { fontSize: 14, lineHeight: 21, color: colors.gray[600], textAlign: 'center', marginBottom: 8 },
  card:      { backgroundColor: colors.white, borderRadius: 14, padding: 14, gap: 6 },
  label:     { fontSize: 11, fontWeight: '700', color: colors.gray[500], textTransform: 'uppercase', letterSpacing: 0.5 },
  mono:      { fontSize: 13, lineHeight: 19, color: colors.red, fontFamily: 'monospace' },
  monoSmall: { fontSize: 11, lineHeight: 16, color: colors.gray[700], fontFamily: 'monospace' },
  btn:       { backgroundColor: colors.dark, borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 8 },
  btnText:   { color: colors.white, fontSize: 15, fontWeight: '700' },
  pressed:   { opacity: 0.85 },
})
