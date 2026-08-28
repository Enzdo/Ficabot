import * as SecureStore from 'expo-secure-store'
import { AppState } from 'react-native'

/**
 * Boîte noire.
 *
 * L'ErrorBoundary ne voit que les erreurs de rendu. Une exception dans un
 * `onPress`, un rejet de promesse ou un crash natif ferment l'application sans
 * rien afficher — l'utilisateur voit l'écran disparaître, et il ne reste
 * aucune trace de ce qui se passait juste avant.
 *
 * On enregistre donc chaque étape et chaque erreur *de façon synchrone* :
 * un crash natif tue le processus sans exécuter la moindre continuation
 * asynchrone, donc un `setItemAsync()` n'aurait jamais le temps d'écrire.
 * `SecureStore.setItem()` est la seule écriture bloquante à disposition.
 *
 * Tout est relu au démarrage suivant, ce qui permet de lire la cause d'un
 * plantage sur un téléphone qui n'est branché à aucun câble.
 */

const REPORT_KEY = 'crash_report'
const TRAIL_KEY = 'crash_trail'
const FOREGROUND_KEY = 'crash_foreground'
const MAX_STEPS = 40

export type CrashKind = 'js' | 'native'

export interface CrashReport {
  kind: CrashKind
  message: string
  stack: string | null
  at: string
  trail: string[]
}

let trail: string[] = []
let installed = false
let consumed: { report: CrashReport | null } | null = null

function write(key: string, value: string) {
  try {
    SecureStore.setItem(key, value)
  } catch {
    // Une boîte noire qui plante en enregistrant le plantage n'aide personne.
  }
}

function read(key: string): string | null {
  try {
    return SecureStore.getItem(key)
  } catch {
    return null
  }
}

function stamp(): string {
  return new Date().toISOString().slice(11, 23)
}

/** Note une étape franchie. Visible dans le rapport si l'app meurt ensuite. */
export function trace(step: string) {
  trail.push(`${stamp()}  ${step}`)
  if (trail.length > MAX_STEPS) trail.shift()
  write(TRAIL_KEY, trail.join('\n'))
}

function capture(kind: CrashKind, error: unknown) {
  const e = error as { message?: string; stack?: string } | null
  const report: CrashReport = {
    kind,
    message: e?.message || String(error),
    stack: e?.stack ?? null,
    at: new Date().toISOString(),
    trail: [...trail],
  }
  write(REPORT_KEY, JSON.stringify(report))
  return report
}

/**
 * Détourne le handler global de React Native. En build release, celui d'origine
 * termine le processus : on ne l'appelle donc pas, pour afficher l'erreur au
 * lieu de la faire disparaître avec l'application.
 */
export function installCrashTrap(onCrash: (report: CrashReport) => void) {
  if (installed) return
  installed = true

  const g = globalThis as unknown as {
    ErrorUtils?: {
      getGlobalHandler?: () => (e: unknown, isFatal?: boolean) => void
      setGlobalHandler?: (h: (e: unknown, isFatal?: boolean) => void) => void
    }
  }
  const previous = g.ErrorUtils?.getGlobalHandler?.()

  g.ErrorUtils?.setGlobalHandler?.((error, isFatal) => {
    const report = capture('js', error)
    try {
      onCrash(report)
    } catch {
      // Rien à faire de plus : le rapport est déjà sur le disque.
    }
    // En développement on laisse la redbox faire son travail par-dessus.
    if (__DEV__ && previous) previous(error, isFatal)
  })

  // Les rejets de promesse ne sont que des `console.warn` en production : ils ne
  // ferment pas l'app, mais ils précèdent souvent ce qui la ferme. On les garde
  // dans la trace sans interrompre l'utilisateur.
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const tracking = require('promise/setimmediate/rejection-tracking')
    tracking.enable({
      allRejections: true,
      onUnhandled: (_id: number, error: unknown) => {
        const e = error as { message?: string } | null
        trace(`⚠ rejet non géré — ${e?.message || String(error)}`)
      },
      onHandled: () => {},
    })
  } catch {
    // Module interne de React Native : absent, on s'en passe.
  }

  // Marqueur de premier plan. S'il est encore posé au démarrage suivant, la
  // session précédente s'est terminée alors que l'app était à l'écran — donc
  // pas par un retour à l'accueil suivi d'une fermeture volontaire.
  write(FOREGROUND_KEY, 'yes')
  AppState.addEventListener('change', (state) => {
    write(FOREGROUND_KEY, state === 'active' ? 'yes' : '')
  })
}

/**
 * Lit le rapport laissé par la session précédente, puis fait table rase.
 * Renvoie `null` si la session s'est terminée normalement.
 */
export function consumePreviousReport(): CrashReport | null {
  // Idempotent : le premier appel vide le stockage, les suivants doivent
  // rendre le même verdict plutôt que « rien à signaler ».
  if (consumed) return consumed.report

  const raw = read(REPORT_KEY)
  const savedTrail = read(TRAIL_KEY)
  const wasForeground = read(FOREGROUND_KEY) === 'yes'

  write(REPORT_KEY, '')
  write(TRAIL_KEY, '')
  trail = []

  if (raw) {
    try {
      consumed = { report: JSON.parse(raw) as CrashReport }
      return consumed.report
    } catch {
      // Rapport illisible : on retombe sur la trace brute ci-dessous.
    }
  }

  // Aucune erreur JavaScript enregistrée, mais l'app est morte au premier
  // plan : le plantage vient de la couche native, hors de portée du JS. La
  // trace dit alors quelle étape a été franchie en dernier.
  if (wasForeground && savedTrail) {
    consumed = { report: {
      kind: 'native',
      message:
        "L'application s'est fermée sans erreur JavaScript, alors qu'elle était " +
        'à l’écran. Le plantage vient de la couche native : la dernière étape ' +
        'franchie ci-dessous indique où.',
      stack: null,
      at: new Date().toISOString(),
      trail: savedTrail.split('\n').filter(Boolean),
    } }
    return consumed.report
  }

  consumed = { report: null }
  return null
}
