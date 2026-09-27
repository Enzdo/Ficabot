import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { can } from '#services/vet_actor'
import type { Capability } from '#services/vet_permissions'

/**
 * Exige un domaine de la grille de droits. S'applique après `vetAuth`, qui a
 * posé l'acteur.
 *
 * Volontairement sans repli : si l'acteur est absent, c'est que ce middleware a
 * été monté sans `vetAuth` devant lui. Refuser plutôt que laisser passer — une
 * erreur d'assemblage ne doit pas se traduire par une route ouverte.
 */
export default class VetCapabilityMiddleware {
  async handle(ctx: HttpContext, next: NextFn, options: { capability: Capability }) {
    const actor = ctx.vetActor

    if (!actor) {
      return ctx.response.unauthorized({
        success: false,
        message: 'Authentification vétérinaire requise',
      })
    }

    if (!can(actor, options.capability)) {
      return ctx.response.forbidden({
        success: false,
        message: "Votre rôle ne donne pas accès à cette partie du logiciel.",
        code: 'CAPABILITY_REQUIRED',
        capability: options.capability,
      })
    }

    return next()
  }
}
