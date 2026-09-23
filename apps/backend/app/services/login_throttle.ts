/**
 * Garde-fou contre le bourrage d'identifiants.
 *
 * `RateLimiterService` ne pouvait pas servir ici : il compte des lignes
 * `pre_diagnoses` et ne sait rien faire d'autre. Aucune table ne trace les
 * tentatives de connexion, et l'authentification n'avait donc aucune limite —
 * ni sur la connexion, ni sur « mot de passe oublié », dont chaque appel
 * réécrit le jeton de réinitialisation et déclenche un envoi de courriel.
 *
 * LIMITE ASSUMÉE : le compteur vit en mémoire du processus. Il se remet à zéro
 * au redéploiement et n'est pas partagé entre instances. C'est suffisant contre
 * un bourrage depuis une poignée d'adresses, et insuffisant contre une attaque
 * distribuée. La réponse durable est un limiteur adossé à Redis ; ceci tient le
 * terrain en attendant, plutôt que de laisser la porte sans serrure.
 */

interface Attempt {
  count: number
  resetAt: number
}

const attempts = new Map<string, Attempt>()

/** Au-delà, la table est purgée de ses entrées périmées avant d'insérer. */
const PRUNE_THRESHOLD = 5_000

function prune(now: number) {
  for (const [key, attempt] of attempts) {
    if (attempt.resetAt <= now) attempts.delete(key)
  }
}

export interface ThrottleVerdict {
  allowed: boolean
  /** Secondes avant la prochaine tentative autorisée. */
  retryAfter: number
}

/**
 * Enregistre une tentative et dit si elle est permise.
 * La fenêtre ne glisse pas : elle démarre à la première tentative et expire
 * `windowMs` plus tard, ce qui suffit à casser la cadence d'un automate.
 */
export function hit(key: string, limit: number, windowMs: number): ThrottleVerdict {
  const now = Date.now()

  if (attempts.size > PRUNE_THRESHOLD) prune(now)

  const current = attempts.get(key)

  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, retryAfter: 0 }
  }

  current.count += 1

  if (current.count > limit) {
    return { allowed: false, retryAfter: Math.ceil((current.resetAt - now) / 1000) }
  }

  return { allowed: true, retryAfter: 0 }
}

/** Efface le compteur : appelé après une réussite, pour ne pas pénaliser. */
export function clear(key: string) {
  attempts.delete(key)
}
