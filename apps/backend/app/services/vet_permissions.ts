/**
 * Qui a le droit de quoi, dans un cabinet.
 *
 * Un cabinet a un titulaire — le compte `Veterinarian`, celui qui paie
 * l'abonnement — et des employés, qui peuvent recevoir un accès au logiciel.
 * Le titulaire peut tout. Les employés voient les données du cabinet, mais pas
 * toutes : un toiletteur n'ouvre pas un dossier médical, une secrétaire tient
 * l'agenda sans lire les comptes rendus.
 *
 * Cette grille est la seule source de vérité. Dispersée dans les contrôleurs,
 * elle deviendrait fausse au premier oubli ; ici, elle se lit d'un regard.
 */

/**
 * Les domaines du logiciel, nommés d'après les écrans — de façon que la grille
 * se relise en regardant le menu, sans traduction mentale.
 */
export const CAPABILITIES = [
  'dashboard',
  'agenda',
  'clients',
  'messages',
  'patients',
  'records',
  'consultation',
  'prescriptions',
  'templates',
  'hospitalization',
  'prediagnoses',
  'assistant',
  'reminders',
  'stock',
  'billing',
  'analytics',
  'settings',
  'team',
  'subscription',
] as const

export type Capability = (typeof CAPABILITIES)[number]

export type EmployeeRole = 'vet' | 'assistant' | 'receptionist' | 'groomer' | 'other'

/**
 * Domaines réservés au titulaire, quel que soit le rôle de l'employé : le
 * chiffre d'affaires, les réglages du cabinet, la gestion de l'équipe et
 * l'abonnement. Un employé, même vétérinaire salarié, n'y touche pas.
 */
export const OWNER_ONLY: Capability[] = ['analytics', 'settings', 'team', 'subscription']

const EVERYONE: Capability[] = ['dashboard', 'agenda']

/**
 * La grille par défaut. Elle décrit un cabinet ordinaire ; le titulaire peut
 * l'ajuster employé par employé (voir `resolveCapabilities`).
 */
export const ROLE_CAPABILITIES: Record<EmployeeRole, Capability[]> = {
  /** Vétérinaire salarié : tout le soin, rien de la gestion. */
  vet: [
    ...EVERYONE,
    'clients',
    'messages',
    'patients',
    'records',
    'consultation',
    'prescriptions',
    'templates',
    'hospitalization',
    'prediagnoses',
    'assistant',
    'reminders',
    'stock',
    'billing',
  ],

  /** ASV : assiste le soin, ne rédige pas et ne facture pas. */
  assistant: [
    ...EVERYONE,
    'clients',
    'patients',
    'records',
    'hospitalization',
    'prediagnoses',
    'reminders',
    'stock',
  ],

  /** Secrétaire : l'accueil et l'argent, pas le médical. */
  receptionist: [...EVERYONE, 'clients', 'messages', 'reminders', 'billing'],

  /** Toiletteur : son planning, et les coordonnées de qui il reçoit. */
  groomer: [...EVERYONE, 'clients'],

  /** Rôle indéterminé : le strict minimum pour travailler. */
  other: [...EVERYONE],
}

/**
 * Droits effectifs d'un employé.
 *
 * `overrides` permet au titulaire de s'écarter de la grille pour une personne :
 * une secrétaire de confiance à qui l'on ouvre les dossiers, un ASV que l'on
 * prive du stock. Une valeur absente laisse le rôle décider — ainsi, faire
 * évoluer la grille par défaut profite aux employés qu'on n'a jamais réglés à
 * la main.
 */
export function resolveCapabilities(
  role: EmployeeRole,
  overrides?: Partial<Record<Capability, boolean>> | null
): Capability[] {
  const base = new Set<Capability>(ROLE_CAPABILITIES[role] ?? ROLE_CAPABILITIES.other)

  if (overrides) {
    for (const capability of CAPABILITIES) {
      const override = overrides[capability]
      if (override === true) base.add(capability)
      else if (override === false) base.delete(capability)
    }
  }

  // Les domaines du titulaire ne s'ouvrent pas par dérogation : sans cela, une
  // case cochée par erreur dans l'écran d'équipe donnerait à un employé le
  // pouvoir de gérer les accès — donc de se donner tous les droits.
  for (const reserved of OWNER_ONLY) base.delete(reserved)

  return CAPABILITIES.filter((capability) => base.has(capability))
}

/** Le titulaire peut tout, sans exception. */
export function ownerCapabilities(): Capability[] {
  return [...CAPABILITIES]
}
