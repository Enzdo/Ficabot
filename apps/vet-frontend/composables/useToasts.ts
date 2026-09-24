/**
 * File de messages éphémères, partagée par toute l'application.
 *
 * Elle existe pour une raison précise : `useVetApi` ne lève jamais. Un refus du
 * serveur revient sous forme d'objet, si bien qu'un `if (response.success)` sans
 * `else` produisait un échec parfaitement silencieux — le praticien voyait une
 * modale se fermer, ou un champ se vider, et croyait son geste enregistré.
 *
 * L'état vit au niveau du module plutôt que dans `useState` : la file n'est
 * alimentée que côté navigateur, elle ne peut donc pas fuir d'une requête de
 * rendu serveur à l'autre.
 */

export interface Toast {
  id: number
  message: string
  kind: 'error' | 'success'
}

const toasts = ref<Toast[]>([])
let nextId = 0

/** Au-delà, les plus anciens cèdent la place : une pile qui déborde ne se lit plus. */
const MAX_VISIBLE = 3
const DEFAULT_DELAY = 6000

export const useToasts = () => {
  const dismiss = (id: number) => {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  const push = (message: string, kind: Toast['kind'] = 'error') => {
    // Rien pendant le rendu serveur : il n'y a personne pour lire.
    if (import.meta.server) return

    const trimmed = (message || '').trim()
    if (!trimmed) return

    // Deux échecs identiques coup sur coup ne méritent qu'un message : on
    // rafraîchit celui qui est déjà là plutôt que d'empiler un doublon.
    const existing = toasts.value.find((t) => t.message === trimmed && t.kind === kind)
    if (existing) {
      dismiss(existing.id)
    }

    const id = ++nextId
    toasts.value = [...toasts.value, { id, message: trimmed, kind }].slice(-MAX_VISIBLE)

    setTimeout(() => dismiss(id), DEFAULT_DELAY)
  }

  return { toasts, push, dismiss }
}
