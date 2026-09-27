import logger from '@adonisjs/core/services/logger'
import Veterinarian from '#models/veterinarian'
import { employeeIdFromAbilities } from '#services/vet_actor'

/**
 * Fermeture des sessions ouvertes sur un cabinet.
 *
 * Les jetons du titulaire et ceux de ses employés vivent dans la même table —
 * une session d'employé est un jeton du cabinet marqué de son nom. Les révoquer
 * demande donc de savoir lesquels viser ; ces fonctions nomment chaque intention
 * plutôt que de laisser l'appelant filtrer à la main et se tromper un jour.
 */
async function revokeWhere(
  vet: Veterinarian,
  keep: (employeeId: number | null, identifier: string) => boolean
) {
  const tokens = await Veterinarian.accessTokens.all(vet)

  for (const token of tokens) {
    const identifier = String(token.identifier)
    if (keep(employeeIdFromAbilities(token.abilities), identifier)) continue

    try {
      await Veterinarian.accessTokens.delete(vet, token.identifier)
    } catch (error) {
      // Jamais silencieux : mieux vaut un journal qui alerte qu'une session
      // qu'on croit fermée et qui ne l'est pas.
      logger.error({ err: error, vetId: vet.id }, 'Échec de révocation d’un jeton vétérinaire')
    }
  }
}

/** Toutes les sessions du cabinet tombent, employés compris. */
export function revokeAllSessions(vet: Veterinarian) {
  return revokeWhere(vet, () => false)
}

/**
 * Les autres sessions du titulaire tombent, celles des employés restent.
 *
 * Appelé quand le titulaire change son mot de passe : la manœuvre visant son
 * propre compte, déconnecter toute l'équipe au passage serait une surprise
 * désagréable en pleine journée de consultation.
 */
export function revokeOwnerSessions(vet: Veterinarian, keepIdentifier?: string | number | BigInt) {
  const keep = keepIdentifier === undefined ? null : String(keepIdentifier)
  return revokeWhere(vet, (employeeId, identifier) => employeeId !== null || identifier === keep)
}

/** Les sessions d'un employé donné tombent. */
export function revokeEmployeeSessions(
  vet: Veterinarian,
  employeeId: number,
  keepIdentifier?: string | number | BigInt
) {
  const keep = keepIdentifier === undefined ? null : String(keepIdentifier)
  return revokeWhere(
    vet,
    (tokenEmployeeId, identifier) => tokenEmployeeId !== employeeId || identifier === keep
  )
}
