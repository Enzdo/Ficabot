import env from '#start/env'

/**
 * Interrupteur global du paywall.
 *
 * Par défaut le paywall n'est PAS appliqué : toutes les fonctionnalités (chat IA,
 * pré-diagnostic, scan de carnet, analyse photo) sont ouvertes, y compris aux
 * comptes gratuits. Pour le réactiver, définir `PREMIUM_ENFORCED=true` dans
 * l'environnement — c'est le seul changement nécessaire, côté serveur comme client.
 */
export function isPremiumEnforced(): boolean {
  return env.get('PREMIUM_ENFORCED', false) === true
}
