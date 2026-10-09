import type { Capability } from '~/utils/capabilities'

/**
 * Les briques du tableau de bord.
 *
 * Chacune porte ce qu'il faut pour la proposer, la placer et la cacher : son
 * intitulé, le domaine qu'elle exige, les tailles qui lui vont. Le rendu, lui,
 * vit dans la page — c'est elle qui détient les données, et les lui passer une
 * à une coûterait plus cher que le gain.
 *
 * Ajouter un module tient en deux gestes : une entrée ici, un bloc dans la
 * page. Rien d'autre à toucher, le serveur ne connaissant que des clés.
 */

export type TailleModule = 'petit' | 'moyen' | 'grand'

export interface ModuleTableauBord {
  key: string
  label: string
  /** Ce que le module montre, affiché dans le sélecteur. */
  description: string
  /** Domaine requis ; `null` quand il est ouvert à tous. */
  capability: Capability | null
  /** Réservé aux comptes qui évaluent les écrans en essai. */
  beta?: boolean
  tailles: TailleModule[]
  tailleParDefaut: TailleModule
  /** Groupe du sélecteur, pour s'y retrouver. */
  famille: 'Chiffres' | 'Journée' | 'Suivi' | 'Raccourcis'
}

export const MODULES: ModuleTableauBord[] = [
  /* ─────────────── Chiffres ─────────────── */
  {
    key: 'chiffre_rdv',
    label: 'Rendez-vous du jour',
    description: 'Combien de rendez-vous aujourd’hui, annulations exclues.',
    capability: 'agenda',
    tailles: ['petit', 'moyen'],
    tailleParDefaut: 'petit',
    famille: 'Chiffres',
  },
  {
    key: 'chiffre_patients',
    label: 'Patients',
    description: 'Nombre de dossiers suivis par le cabinet.',
    capability: 'patients',
    tailles: ['petit', 'moyen'],
    tailleParDefaut: 'petit',
    famille: 'Chiffres',
  },
  {
    key: 'chiffre_rappels',
    label: 'Rappels à venir',
    description: 'Rappels de soins sur les sept prochains jours.',
    capability: 'reminders',
    tailles: ['petit', 'moyen'],
    tailleParDefaut: 'petit',
    famille: 'Chiffres',
  },
  {
    key: 'chiffre_hospitalisations',
    label: 'Hospitalisations',
    description: 'Animaux actuellement pris en charge.',
    capability: 'hospitalization',
    tailles: ['petit', 'moyen'],
    tailleParDefaut: 'petit',
    famille: 'Chiffres',
  },
  {
    key: 'chiffre_recettes',
    label: 'Recettes du mois',
    description: 'Chiffre d’affaires facturé depuis le 1er du mois.',
    capability: 'billing',
    beta: true,
    tailles: ['petit', 'moyen'],
    tailleParDefaut: 'petit',
    famille: 'Chiffres',
  },
  {
    key: 'chiffre_impayes',
    label: 'Reste à encaisser',
    description: 'Ce que les clients doivent encore, retards compris.',
    capability: 'billing',
    beta: true,
    tailles: ['petit', 'moyen'],
    tailleParDefaut: 'petit',
    famille: 'Chiffres',
  },

  /* ─────────────── Journée ─────────────── */
  {
    key: 'journee',
    label: 'Votre journée',
    description: 'Les rendez-vous du jour, heure par heure.',
    capability: 'agenda',
    tailles: ['moyen', 'grand'],
    tailleParDefaut: 'grand',
    famille: 'Journée',
  },
  {
    key: 'prochain_rdv',
    label: 'Prochain rendez-vous',
    description: 'Le suivant, avec de quoi ouvrir la consultation.',
    capability: 'agenda',
    tailles: ['moyen', 'grand'],
    tailleParDefaut: 'grand',
    famille: 'Journée',
  },

  /* ─────────────── Suivi ─────────────── */
  {
    key: 'priorites',
    label: 'Priorités de la clinique',
    description: 'Rappels en retard, alertes de stock, hospitalisations.',
    capability: null,
    tailles: ['moyen', 'grand'],
    tailleParDefaut: 'moyen',
    famille: 'Suivi',
  },
  {
    key: 'mes_patients',
    label: 'Vos patients',
    description: 'Les dossiers récents, pour y entrer d’un clic.',
    capability: 'patients',
    tailles: ['moyen', 'grand'],
    tailleParDefaut: 'grand',
    famille: 'Suivi',
  },
  {
    key: 'rappels_liste',
    label: 'Prochains rappels',
    description: 'Le détail des rappels à venir, pas seulement le compte.',
    capability: 'reminders',
    tailles: ['moyen', 'grand'],
    tailleParDefaut: 'moyen',
    famille: 'Suivi',
  },
  {
    key: 'stock_alertes',
    label: 'Stock à surveiller',
    description: 'Les articles passés sous leur seuil.',
    capability: 'stock',
    beta: true,
    tailles: ['moyen', 'grand'],
    tailleParDefaut: 'moyen',
    famille: 'Suivi',
  },

  /* ─────────────── Raccourcis ─────────────── */
  {
    key: 'acces_rapide',
    label: 'Passer à l’action',
    description: 'Retrouver un patient, ouvrir la dictée, les messages.',
    capability: null,
    tailles: ['petit', 'moyen'],
    tailleParDefaut: 'moyen',
    famille: 'Raccourcis',
  },
]

export const moduleParCle = (key: string) => MODULES.find((m) => m.key === key) ?? null

/**
 * Largeur dans la grille.
 *
 * Deux colonnes sur téléphone, quatre à partir de `md`. Un petit bloc tient
 * donc la moitié de l'écran en mobile et non toute sa largeur : trois chiffres
 * empilés en pleine largeur demandaient de faire défiler pour voir le planning.
 *
 * Les classes sont écrites en entier : Tailwind lit les sources pour décider
 * quoi produire, et ne verrait pas une classe assemblée à l'exécution.
 */
export const CLASSES_TAILLE: Record<TailleModule, string> = {
  petit: 'col-span-1',
  moyen: 'col-span-2',
  grand: 'col-span-2 md:col-span-4',
}

export const LABELS_TAILLE: Record<TailleModule, string> = {
  petit: 'Petit',
  moyen: 'Moyen',
  grand: 'Large',
}

export interface ElementLayout {
  key: string
  size: TailleModule
}

/**
 * Dispositions toutes faites.
 *
 * Un praticien qui découvre l'écran ne sait pas encore ce qu'il veut y voir.
 * Partir d'un modèle proche de son exercice, puis retirer ce qui ne sert pas,
 * demande moins d'efforts que de composer depuis une page blanche — laquelle
 * reste possible pour qui sait.
 */
export interface ModeleTableauBord {
  key: string
  label: string
  description: string
  layout: ElementLayout[]
}

export const MODELES: ModeleTableauBord[] = [
  {
    key: 'praticien',
    label: 'Praticien',
    description: 'La journée et les dossiers. Rien sur l’argent.',
    layout: [
      { key: 'chiffre_rdv', size: 'petit' },
      { key: 'chiffre_rappels', size: 'petit' },
      { key: 'chiffre_hospitalisations', size: 'petit' },
      { key: 'chiffre_patients', size: 'petit' },
      { key: 'journee', size: 'grand' },
      { key: 'priorites', size: 'moyen' },
      { key: 'acces_rapide', size: 'moyen' },
      { key: 'mes_patients', size: 'grand' },
    ],
  },
  {
    key: 'gestion',
    label: 'Gestion',
    description: 'Recettes, impayés et stock en premier.',
    layout: [
      { key: 'chiffre_recettes', size: 'petit' },
      { key: 'chiffre_impayes', size: 'petit' },
      { key: 'chiffre_rdv', size: 'petit' },
      { key: 'chiffre_patients', size: 'petit' },
      { key: 'stock_alertes', size: 'moyen' },
      { key: 'priorites', size: 'moyen' },
      { key: 'journee', size: 'grand' },
    ],
  },
  {
    key: 'essentiel',
    label: 'Essentiel',
    description: 'Quatre blocs, pas un de plus.',
    layout: [
      { key: 'chiffre_rdv', size: 'petit' },
      { key: 'chiffre_rappels', size: 'petit' },
      { key: 'journee', size: 'grand' },
      { key: 'acces_rapide', size: 'moyen' },
    ],
  },
  {
    key: 'complet',
    label: 'Complet',
    description: 'Tout ce que le logiciel sait afficher.',
    layout: MODULES.map((m) => ({ key: m.key, size: m.tailleParDefaut })),
  },
]

/** La disposition servie tant que le praticien n'a rien choisi. */
export const LAYOUT_DEFAUT: ElementLayout[] = MODELES[0].layout
