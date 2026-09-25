import type Veterinarian from '#models/veterinarian'

/**
 * L'abonnement ouvre-t-il l'accès au logiciel ?
 *
 * Un seul endroit en décide : le middleware du navigateur, l'API et tout écran
 * futur doivent répondre pareil, sinon le péage se contourne par une page
 * oubliée.
 *
 * `past_due` reste ouvert à dessein : un prélèvement qui échoue mérite une
 * relance, pas une porte claquée au milieu d'une consultation.
 */
export const OPEN_STATUSES = ['active', 'trialing', 'past_due']

export function hasActiveAccess(vet: Veterinarian): boolean {
  if (vet.subscriptionExempt) return true
  if (!vet.subscriptionStatus) return false
  if (!OPEN_STATUSES.includes(vet.subscriptionStatus)) return false

  // Résilié mais pas encore échu : l'accès déjà réglé court jusqu'au terme.
  if (vet.subscriptionEndsAt && vet.subscriptionEndsAt.toMillis() < Date.now()) return false

  return true
}
