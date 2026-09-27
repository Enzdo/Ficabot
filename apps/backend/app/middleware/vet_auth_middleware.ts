import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import logger from '@adonisjs/core/services/logger'
import Veterinarian from '#models/veterinarian'
import VetEmployee from '#models/vet_employee'
import { employeeIdFromAbilities } from '#services/vet_actor'
import { ownerCapabilities, resolveCapabilities } from '#services/vet_permissions'

/**
 * Authentifie une requête du logiciel vétérinaire, et détermine qui agit.
 *
 * Le jeton désigne toujours un cabinet ; il peut en outre porter le nom d'un
 * employé. Ce middleware est le seul endroit où cette distinction est établie,
 * et il s'exécute sur toutes les routes du logiciel : les contrôleurs peuvent
 * donc compter sur `ctx.vetActor`.
 */
export default class VetAuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    try {
      await ctx.auth.authenticateUsing(['vet'])
    } catch {
      return ctx.response.unauthorized({
        success: false,
        message: 'Authentification vétérinaire requise',
      })
    }

    const vet = ctx.auth.user as Veterinarian
    const employeeId = employeeIdFromAbilities(vet.currentAccessToken?.abilities)

    if (employeeId === null) {
      ctx.vetActor = {
        veterinarian: vet,
        employee: null,
        capabilities: ownerCapabilities(),
        isOwner: true,
      }
      return next()
    }

    // Rattaché au cabinet du jeton, et pas seulement à son identifiant : un
    // employé transféré ailleurs ne doit pas continuer d'ouvrir les données de
    // son ancien employeur avec une session restée ouverte.
    const employee = await VetEmployee.query()
      .where('id', employeeId)
      .where('veterinarian_id', vet.id)
      .first()

    if (!employee || !employee.hasAccess) {
      // L'accès a été retiré depuis l'ouverture de la session. Le jeton tombe
      // ici : sans cela, le retrait d'accès ne prendrait effet qu'à l'expiration
      // — un mois pendant lequel l'ancien employé garderait la main.
      const identifier = vet.currentAccessToken?.identifier
      if (identifier !== undefined) {
        await Veterinarian.accessTokens.delete(vet, identifier).catch((error) => {
          logger.error({ err: error, vetId: vet.id, employeeId }, 'Échec de révocation du jeton d’un employé sans accès')
        })
      }

      return ctx.response.unauthorized({
        success: false,
        message: 'Votre accès à ce cabinet a été retiré.',
        code: 'ACCESS_REVOKED',
      })
    }

    ctx.vetActor = {
      veterinarian: vet,
      employee,
      capabilities: resolveCapabilities(employee.role, employee.capabilities),
      isOwner: false,
    }

    return next()
  }
}
