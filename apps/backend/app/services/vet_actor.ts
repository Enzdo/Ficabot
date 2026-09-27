import type Veterinarian from '#models/veterinarian'
import type VetEmployee from '#models/vet_employee'
import type { Capability } from '#services/vet_permissions'

/**
 * Qui agit dans la requête en cours.
 *
 * Le logiciel n'a qu'un seul locataire de données : le cabinet, représenté par
 * le compte du titulaire. Un employé connecté travaille dans ce même périmètre
 * — c'est tout l'intérêt : il voit l'agenda, les clients et les patients du
 * cabinet, pas un sous-ensemble à lui. Ce qui le distingue du titulaire n'est
 * pas ce qu'il voit, mais ce qu'il a le droit d'ouvrir.
 *
 * D'où cette forme : `veterinarian` sert au cloisonnement — les 117 requêtes
 * existantes filtrent déjà dessus et restent justes sans être touchées —, et
 * `employee` sert aux droits et à l'attribution des actes.
 */
export interface VetActor {
  /** Le cabinet. Toujours présent : c'est la clé de cloisonnement. */
  veterinarian: Veterinarian
  /** L'employé aux commandes, ou `null` si c'est le titulaire lui-même. */
  employee: VetEmployee | null
  capabilities: Capability[]
  isOwner: boolean
}

/**
 * Une session d'employé est un jeton posé sur le compte du cabinet, marqué du
 * nom de l'employé dans ses habilitations. Ce détour évite d'introduire un
 * second locataire de données et de réécrire chaque requête du logiciel.
 *
 * Le marquage tient dans les habilitations du jeton — et non dans une colonne
 * ajoutée — parce qu'elles voyagent déjà avec le jeton vérifié : aucune requête
 * supplémentaire à chaque appel, et aucun risque d'oublier de la lire.
 */
const EMPLOYEE_ABILITY_PREFIX = 'employee:'

export function employeeAbility(employeeId: number): string {
  return `${EMPLOYEE_ABILITY_PREFIX}${employeeId}`
}

/**
 * Identifiant de l'employé porté par un jeton, ou `null` s'il s'agit du jeton
 * du titulaire. Une valeur non numérique est traitée comme absente : mieux vaut
 * refuser de reconnaître un employé que de deviner lequel.
 */
export function employeeIdFromAbilities(abilities: string[] | undefined | null): number | null {
  if (!abilities) return null

  for (const ability of abilities) {
    if (!ability.startsWith(EMPLOYEE_ABILITY_PREFIX)) continue
    const id = Number.parseInt(ability.slice(EMPLOYEE_ABILITY_PREFIX.length), 10)
    if (Number.isInteger(id) && id > 0) return id
  }

  return null
}

export function can(actor: VetActor, capability: Capability): boolean {
  return actor.capabilities.includes(capability)
}

declare module '@adonisjs/core/http' {
  interface HttpContext {
    /**
     * Posé par le middleware d'authentification vétérinaire. Présent sur toute
     * route passée par ce middleware ; absent ailleurs.
     */
    vetActor?: VetActor
  }
}
