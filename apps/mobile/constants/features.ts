/**
 * Interrupteurs de fonctionnalités côté app.
 *
 * `PAYWALL_VISIBLE = false` masque toute mention de Premium dans l'interface :
 * écran de souscription, entrée du profil, cadenas et libellés « Premium ».
 * À garder à false pendant la phase de test, puis repasser à true en même temps
 * que `PREMIUM_ENFORCED=true` côté backend.
 */
export const PAYWALL_VISIBLE = false
