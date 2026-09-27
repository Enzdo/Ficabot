/**
 * Les domaines du logiciel, et l'écran auquel chacun donne accès.
 *
 * Miroir de la grille du serveur, qui seul décide : ce fichier ne protège rien.
 * Il sert à ne pas montrer de portes fermées — un menu qui propose la
 * facturation à un toiletteur, pour lui répondre « accès refusé » d'un clic, est
 * une impolitesse et une perte de temps.
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

export const ROLE_LABELS: Record<string, string> = {
  vet: 'Vétérinaire',
  assistant: 'Assistant·e vétérinaire',
  receptionist: 'Secrétaire',
  groomer: 'Toiletteur·euse',
  other: 'Employé·e',
}

/** Intitulés des domaines, pour l'écran de réglage des droits. */
export const CAPABILITY_LABELS: Record<Capability, string> = {
  dashboard: 'Tableau de bord',
  agenda: 'Agenda et calendrier',
  clients: 'Clients',
  messages: 'Messages',
  patients: 'Patients',
  records: 'Dossiers médicaux',
  consultation: 'Dictée et comptes rendus',
  prescriptions: 'Ordonnances',
  templates: 'Modèles',
  hospitalization: 'Hospitalisation',
  prediagnoses: 'Pré-diagnostics',
  assistant: 'Assistant IA',
  reminders: 'Rappels',
  stock: 'Stock',
  billing: 'Facturation',
  analytics: 'Statistiques',
  settings: 'Réglages du cabinet',
  team: 'Équipe et accès',
  subscription: 'Abonnement',
}

/** Domaines que le titulaire ne délègue pas. Le serveur refuse de les ouvrir. */
export const OWNER_ONLY: Capability[] = ['analytics', 'settings', 'team', 'subscription']

/**
 * Préfixe d'URL → domaine requis. Les chemins sont comparés par préfixe, pour
 * que `/patients/abc123` suive `/patients`.
 */
const ROUTE_CAPABILITIES: [string, Capability][] = [
  ['/dashboard', 'dashboard'],
  ['/assistant', 'assistant'],
  ['/consultation', 'consultation'],
  ['/patients', 'patients'],
  ['/records', 'records'],
  ['/modeles', 'templates'],
  ['/prescriptions', 'prescriptions'],
  ['/hospitalization', 'hospitalization'],
  ['/pre-diagnoses', 'prediagnoses'],
  ['/appointments', 'agenda'],
  ['/calendar', 'agenda'],
  ['/reminders', 'reminders'],
  ['/clients', 'clients'],
  ['/chat', 'messages'],
  ['/inventory', 'stock'],
  ['/invoices', 'billing'],
  ['/analytics', 'analytics'],
]

/**
 * Écrans ouverts à tous : les réglages, parce qu'ils contiennent l'onglet « mon
 * compte » où chacun change son mot de passe — les onglets du cabinet, eux, sont
 * masqués à l'intérieur.
 */
const OPEN_PATHS = ['/settings', '/abonnement', '/bienvenue']

export function capabilityForPath(path: string): Capability | null {
  if (OPEN_PATHS.some((open) => path === open || path.startsWith(`${open}/`))) return null

  for (const [prefix, capability] of ROUTE_CAPABILITIES) {
    if (path === prefix || path.startsWith(`${prefix}/`)) return capability
  }

  return null
}

/**
 * Premier écran qu'une personne peut ouvrir, pour la rediriger utilement quand
 * elle arrive sur un écran interdit — plutôt que de la renvoyer au tableau de
 * bord, que son rôle pourrait lui aussi interdire un jour.
 */
export function firstAllowedPath(capabilities: Capability[]): string {
  for (const [prefix, capability] of ROUTE_CAPABILITIES) {
    if (capabilities.includes(capability)) return prefix
  }
  return '/settings'
}
