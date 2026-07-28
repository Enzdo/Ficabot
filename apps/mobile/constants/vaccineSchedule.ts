/**
 * Calendrier vaccinal indicatif, croisé avec ce que le carnet contient déjà.
 *
 * Protocoles usuels en France. Ils varient selon le vaccin employé, la région
 * et le mode de vie de l'animal : ces repères servent à ne rien oublier et à
 * préparer la consultation, jamais à remplacer l'avis du vétérinaire.
 * Toute l'interface doit le rappeler.
 */

import { ageInMonths, resolveKind, type PetKind } from './petProfiles'
import type { Species } from '@/types'

export interface VaccineDefinition {
  id: string
  /** Nom affiché. */
  name: string
  /** Ce que le vaccin protège, en une phrase compréhensible. */
  protects: string
  /** Pourquoi il compte pour cette espèce. */
  why: string
  /** Mots-clés permettant de reconnaître une saisie existante dans le carnet. */
  aliases: string[]
  /** Âge minimum de la première injection, en mois. */
  fromMonths: number
  /** Nombre d'injections de la primovaccination. */
  primaryDoses: number
  /** Intervalle entre injections de primovaccination, en semaines. */
  primaryIntervalWeeks: number
  /** Intervalle entre deux rappels, en mois. */
  boosterMonths: number
  importance: 'essentiel' | 'recommandé' | 'selon mode de vie'
  /** Précision utile : obligation légale, condition de voyage, etc. */
  note?: string
}

const DOG: VaccineDefinition[] = [
  {
    id: 'chp',
    name: 'CHP — Carré, hépatite, parvovirose',
    protects: 'Les trois maladies virales qui tuent le plus de chiots.',
    why: 'La parvovirose résiste des mois dans l\'environnement et se transmet sans contact direct avec un autre chien. Le taux de mortalité chez le chiot non vacciné dépasse 80 % sans hospitalisation.',
    aliases: ['chp', 'chpl', 'chppi', 'chppil', 'carré', 'carre', 'parvo', 'hépatite', 'hepatite', 'primo'],
    fromMonths: 2, primaryDoses: 3, primaryIntervalWeeks: 4, boosterMonths: 12,
    importance: 'essentiel',
    note: 'Après le rappel du premier an, l\'espacement passe souvent à 3 ans selon le vaccin.',
  },
  {
    id: 'lepto',
    name: 'Leptospirose',
    protects: 'Une bactérie transmise par l\'urine des rongeurs, présente dans les eaux stagnantes.',
    why: 'Elle attaque le foie et les reins, et se transmet à l\'humain. Un chien qui boit dans une flaque ou se baigne en rivière y est exposé, même en ville.',
    aliases: ['lepto', 'leptospirose', 'l4', 'chpl', 'chppil'],
    fromMonths: 2, primaryDoses: 2, primaryIntervalWeeks: 4, boosterMonths: 12,
    importance: 'essentiel',
    note: 'Rappel annuel, parfois semestriel en zone très exposée.',
  },
  {
    id: 'rage',
    name: 'Rage',
    protects: 'Une maladie mortelle, sans traitement une fois déclarée.',
    why: 'Obligatoire pour voyager dans l\'Union européenne, pour les chiens de catégorie 1 et 2, et souvent exigée en pension ou en camping.',
    aliases: ['rage', 'rabique', 'rabies'],
    fromMonths: 3, primaryDoses: 1, primaryIntervalWeeks: 0, boosterMonths: 12,
    importance: 'selon mode de vie',
    note: 'Exige une identification préalable. Validité de 1 à 3 ans selon le vaccin.',
  },
  {
    id: 'toux',
    name: 'Toux du chenil',
    protects: 'Bordetella et parainfluenza, très contagieux entre chiens.',
    why: 'Se transmet par l\'air dès que des chiens se côtoient : pension, concours, cours d\'éducation, parc à chiens.',
    aliases: ['chenil', 'bordetella', 'parainfluenza', 'kc', 'toux'],
    fromMonths: 2, primaryDoses: 1, primaryIntervalWeeks: 0, boosterMonths: 12,
    importance: 'selon mode de vie',
  },
]

const CAT: VaccineDefinition[] = [
  {
    id: 'typhus',
    name: 'Typhus — panleucopénie',
    protects: 'Un virus digestif foudroyant chez le chaton.',
    why: 'Il résiste plus d\'un an dans le milieu extérieur : vous pouvez le rapporter sous vos chaussures sans avoir croisé le moindre chat.',
    aliases: ['typhus', 'panleucopénie', 'panleucopenie', 'trt', 'tcl', 'rcp'],
    fromMonths: 2, primaryDoses: 2, primaryIntervalWeeks: 4, boosterMonths: 12,
    importance: 'essentiel',
  },
  {
    id: 'coryza',
    name: 'Coryza',
    protects: 'Herpèsvirus et calicivirus, responsables du « rhume du chat ».',
    why: 'Le virus reste à vie dans l\'organisme et ressort à chaque baisse de forme. La vaccination n\'empêche pas toujours l\'infection mais réduit fortement la gravité des crises.',
    aliases: ['coryza', 'herpès', 'herpes', 'calicivirus', 'rcp', 'tcl'],
    fromMonths: 2, primaryDoses: 2, primaryIntervalWeeks: 4, boosterMonths: 12,
    importance: 'essentiel',
  },
  {
    id: 'leucose',
    name: 'Leucose féline (FeLV)',
    protects: 'Un virus qui détruit progressivement les défenses immunitaires.',
    why: 'Il se transmet par la salive, donc par les bagarres et le toilettage mutuel. Indispensable pour un chat qui sort, inutile pour un chat strictement d\'intérieur et seul.',
    aliases: ['leucose', 'felv', 'leucémie', 'leucemie'],
    fromMonths: 2, primaryDoses: 2, primaryIntervalWeeks: 4, boosterMonths: 12,
    importance: 'selon mode de vie',
    note: 'Un test de dépistage est recommandé avant la première injection.',
  },
  {
    id: 'rage-cat',
    name: 'Rage',
    protects: 'Une maladie mortelle, sans traitement une fois déclarée.',
    why: 'Obligatoire pour voyager dans l\'Union européenne et pour les chats identifiés voyageant hors de France.',
    aliases: ['rage', 'rabique', 'rabies'],
    fromMonths: 3, primaryDoses: 1, primaryIntervalWeeks: 0, boosterMonths: 12,
    importance: 'selon mode de vie',
  },
]

const RABBIT: VaccineDefinition[] = [
  {
    id: 'myxo-vhd',
    name: 'Myxomatose et VHD',
    protects: 'Les deux maladies virales qui tuent les lapins domestiques.',
    why: 'Elles se transmettent par les moustiques et les puces, qui entrent par une fenêtre ouverte. La VHD tue en 24 à 48 h et n\'a aucun traitement — un lapin d\'intérieur est concerné.',
    aliases: ['myxo', 'myxomatose', 'vhd', 'rhd', 'hémorragique', 'hemorragique'],
    fromMonths: 1, primaryDoses: 1, primaryIntervalWeeks: 0, boosterMonths: 12,
    importance: 'essentiel',
    note: 'Vaccin combiné, possible dès 5 semaines, rappel annuel.',
  },
]

const FERRET: VaccineDefinition[] = [
  {
    id: 'carre-ferret',
    name: 'Maladie de Carré',
    protects: 'Un virus mortel dans la quasi-totalité des cas chez le furet.',
    why: 'La létalité approche 100 % chez cette espèce, contre environ 50 % chez le chien. Le virus voyage dans l\'air et sur les vêtements : un furet d\'intérieur reste exposé.',
    aliases: ['carré', 'carre', 'distemper', 'chp'],
    fromMonths: 2, primaryDoses: 2, primaryIntervalWeeks: 4, boosterMonths: 12,
    importance: 'essentiel',
  },
  {
    id: 'rage-ferret',
    name: 'Rage',
    protects: 'Une maladie mortelle, sans traitement une fois déclarée.',
    why: 'Exigée pour voyager avec un furet dans l\'Union européenne.',
    aliases: ['rage', 'rabique'],
    fromMonths: 3, primaryDoses: 1, primaryIntervalWeeks: 0, boosterMonths: 12,
    importance: 'selon mode de vie',
  },
]

const SCHEDULES: Partial<Record<PetKind, VaccineDefinition[]>> = {
  dog: DOG,
  cat: CAT,
  rabbit: RABBIT,
  ferret: FERRET,
}

export type VaccineState =
  /** Aucune trace au carnet, et l'animal a l'âge : à faire. */
  | 'a_prevoir'
  /** Aucune trace, mais l'animal est trop jeune. */
  | 'trop_jeune'
  /** Saisi au carnet, rappel encore valable. */
  | 'a_jour'
  /** Saisi, mais le rappel est dépassé. */
  | 'rappel_du'
  /** Saisi, rappel proche (moins de 30 jours). */
  | 'rappel_proche'

export interface VaccineStatus {
  definition: VaccineDefinition
  state: VaccineState
  /** Dernière injection trouvée au carnet. */
  lastDate: string | null
  /** Prochaine échéance estimée. */
  nextDue: string | null
  /** Jours restants avant échéance, négatif si dépassée. */
  daysLeft: number | null
  /** Âge à partir duquel la première injection est possible, si trop jeune. */
  eligibleInMonths: number | null
}

export interface RecordedVaccine {
  name: string
  date: string
  nextDueDate?: string
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

/** Retrouve les saisies du carnet correspondant à un vaccin du calendrier. */
function findRecorded(def: VaccineDefinition, recorded: RecordedVaccine[]): RecordedVaccine | null {
  const matches = recorded.filter((r) => {
    const name = normalize(r.name)
    return def.aliases.some((alias) => name.includes(normalize(alias)))
  })
  if (matches.length === 0) return null

  // La plus récente fait foi.
  return matches.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
}

function daysBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / 86400000)
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date)
  d.setMonth(d.getMonth() + months)
  return d
}

export function getVaccineSchedule(pet: {
  species: Species | string
  breed?: string | null
  birthDate?: string | null
}): VaccineDefinition[] {
  return SCHEDULES[resolveKind(pet)] ?? []
}

/**
 * Croise le calendrier de l'espèce avec le carnet de santé.
 * Sans date de naissance, l'âge est inconnu : rien n'est présenté comme
 * « trop jeune », on se contente de signaler ce qui manque.
 */
export function getVaccineStatuses(
  pet: { species: Species | string; breed?: string | null; birthDate?: string | null },
  recorded: RecordedVaccine[]
): VaccineStatus[] {
  const definitions = getVaccineSchedule(pet)
  if (definitions.length === 0) return []

  const months = ageInMonths(pet.birthDate)
  const today = new Date()

  return definitions.map((definition) => {
    const match = findRecorded(definition, recorded)

    if (!match) {
      const tooYoung = months !== null && months < definition.fromMonths
      return {
        definition,
        state: tooYoung ? 'trop_jeune' : 'a_prevoir',
        lastDate: null,
        nextDue: null,
        daysLeft: null,
        eligibleInMonths: tooYoung ? definition.fromMonths - months! : null,
      }
    }

    // Le rappel saisi par l'utilisateur prime sur notre estimation.
    const last = new Date(match.date)
    const due = match.nextDueDate ? new Date(match.nextDueDate) : addMonths(last, definition.boosterMonths)
    const daysLeft = daysBetween(today, due)

    return {
      definition,
      state: daysLeft < 0 ? 'rappel_du' : daysLeft <= 30 ? 'rappel_proche' : 'a_jour',
      lastDate: match.date,
      nextDue: due.toISOString().slice(0, 10),
      daysLeft,
      eligibleInMonths: null,
    }
  })
}

/** Ce qui réclame une action : à prévoir, rappel dû ou rappel proche. */
export function getVaccineAlerts(
  pet: { species: Species | string; breed?: string | null; birthDate?: string | null },
  recorded: RecordedVaccine[]
): VaccineStatus[] {
  const order: Record<VaccineState, number> = {
    rappel_du: 0, a_prevoir: 1, rappel_proche: 2, trop_jeune: 3, a_jour: 4,
  }
  return getVaccineStatuses(pet, recorded)
    .filter((s) => s.state === 'rappel_du' || s.state === 'a_prevoir' || s.state === 'rappel_proche')
    .sort((a, b) => order[a.state] - order[b.state])
}

export const STATE_LABELS: Record<VaccineState, { label: string; emoji: string }> = {
  a_jour:        { label: 'À jour',        emoji: '✅' },
  rappel_proche: { label: 'Rappel proche', emoji: '🔔' },
  rappel_du:     { label: 'Rappel dépassé', emoji: '⚠️' },
  a_prevoir:     { label: 'À prévoir',     emoji: '💉' },
  trop_jeune:    { label: 'Trop jeune',    emoji: '⏳' },
}
