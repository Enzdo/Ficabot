import { createHmac } from 'node:crypto'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import { appKey } from '#config/app'
import type Veterinarian from '#models/veterinarian'

/**
 * Le journal inaltérable, et sa chaîne de signatures.
 *
 * Chaque événement comptable y est ajouté, jamais modifié. Sa signature couvre
 * son propre contenu et celle de l'événement précédent : altérer une ligne
 * invalide toutes celles qui la suivent, et la rupture se voit en reparcourant
 * la chaîne. C'est l'inaltérabilité au sens de l'article 286-I-3°bis du CGI.
 *
 * Limite assumée, et qu'il faut connaître avant de signer quoi que ce soit : la
 * signature est un HMAC calculé avec la clé de l'application. Qui détient à la
 * fois la base *et* cette clé peut reforger une chaîne cohérente. S'en prémunir
 * demanderait une clé privée tenue hors du serveur — un cran au-dessus, qui a
 * sa place le jour d'une certification, pas pour l'attestation d'éditeur.
 */

export type EventType =
  | 'opening'
  | 'invoice'
  | 'credit_note'
  | 'payment'
  | 'payment_void'
  | 'closure'

/** Le maillon zéro. Rien ne le précède, et c'est ce que dit cette valeur. */
const GENESIS = '0'.repeat(64)

export const TYPE_LABELS: Record<EventType, string> = {
  opening: 'Ouverture du journal',
  invoice: 'Facture émise',
  credit_note: 'Avoir établi',
  payment: 'Règlement encaissé',
  payment_void: 'Règlement retiré',
  closure: 'Clôture de période',
}

/**
 * Sérialisation déterministe.
 *
 * `JSON.stringify` suit l'ordre d'insertion des clés : deux objets portant les
 * mêmes données donneraient deux chaînes différentes, donc deux signatures, et
 * la vérification échouerait sur des écritures pourtant intactes. On trie donc
 * les clés, récursivement.
 */
export function canonicalise(valeur: unknown): string {
  const normaliser = (v: any): any => {
    if (v === null || v === undefined) return null
    if (Array.isArray(v)) return v.map(normaliser)
    if (v instanceof Date) return v.toISOString()
    if (typeof v === 'object') {
      return Object.keys(v)
        .sort()
        .reduce((acc: Record<string, any>, k) => {
          acc[k] = normaliser(v[k])
          return acc
        }, {})
    }
    // Les montants transitent parfois en chaîne depuis Postgres : on les fige
    // au centime pour qu'un même montant donne toujours la même signature.
    if (typeof v === 'number') return Number(v.toFixed(2))
    return v
  }

  return JSON.stringify(normaliser(valeur))
}

/** La signature d'un maillon : son contenu, et celle du maillon précédent. */
export function signer(
  veterinarianId: number,
  sequence: number,
  type: EventType,
  payloadCanonique: string,
  recordedAt: string,
  previousSignature: string
): string {
  const message = [
    veterinarianId,
    sequence,
    type,
    recordedAt,
    payloadCanonique,
    previousSignature,
  ].join('\u001f')

  return createHmac('sha256', appKey.release()).update(message, 'utf8').digest('hex')
}

interface LigneJournal {
  id: number
  veterinarian_id: number
  sequence: number
  type: EventType
  reference: string | null
  payload: string
  previous_signature: string
  signature: string
  recorded_at: Date | string
}

/**
 * Ajoute un événement au journal.
 *
 * Tout se fait dans une transaction tenue par un verrou propre au cabinet :
 * sans lui, deux factures émises au même instant liraient le même dernier rang
 * et la chaîne bifurquerait. La contrainte d'unicité le rattraperait en
 * refusant l'une des deux — mais au prix d'une facture perdue.
 */
export async function enregistrer(
  veterinarianId: number,
  type: EventType,
  reference: string | null,
  data: Record<string, unknown>
): Promise<{ sequence: number; signature: string }> {
  return db.transaction(async (trx) => {
    // Verrou consultatif, relâché à la fin de la transaction. La seconde clé
    // identifie le cabinet : deux cabinets n'attendent pas l'un sur l'autre.
    await trx.rawQuery('SELECT pg_advisory_xact_lock(?, ?)', [862_014, veterinarianId])

    const dernier = await trx
      .from('vet_accounting_events')
      .where('veterinarian_id', veterinarianId)
      .orderBy('sequence', 'desc')
      .first()

    const sequence = dernier ? Number(dernier.sequence) + 1 : 1
    const previousSignature = dernier ? String(dernier.signature) : GENESIS
    const recordedAt = DateTime.now().toISO()!
    const payload = canonicalise(data)
    const signature = signer(veterinarianId, sequence, type, payload, recordedAt, previousSignature)

    await trx.table('vet_accounting_events').insert({
      veterinarian_id: veterinarianId,
      sequence,
      type,
      reference,
      payload,
      previous_signature: previousSignature,
      signature,
      recorded_at: recordedAt,
    })

    return { sequence, signature }
  })
}

/**
 * Ouvre la chaîne d'un cabinet en y inscrivant son état de départ.
 *
 * Une chaîne ne dit rien de ce qui la précède. Si le cabinet facturait déjà,
 * son premier maillon fige donc ce qui existait à cet instant — nombre de
 * pièces et total — plutôt que de laisser croire que le journal couvre tout
 * depuis l'origine.
 */
export async function ouvrirSiNecessaire(vet: Veterinarian): Promise<boolean> {
  const existe = await db
    .from('vet_accounting_events')
    .where('veterinarian_id', vet.id)
    .first()

  if (existe) return false

  const [pieces] = await db
    .from('vet_invoices')
    .where('veterinarian_id', vet.id)
    .whereNot('status', 'draft')
    .count('* as total')
    .sum('total as montant')

  const [reglements] = await db
    .from('vet_payments')
    .where('veterinarian_id', vet.id)
    .count('* as total')
    .sum('amount as montant')

  await enregistrer(vet.id, 'opening', null, {
    ouvertLe: DateTime.now().toISODate(),
    piecesAnterieures: Number(pieces?.total ?? 0),
    totalAnterieur: Number(pieces?.montant ?? 0),
    reglementsAnterieurs: Number(reglements?.total ?? 0),
    totalReglementsAnterieur: Number(reglements?.montant ?? 0),
    // Dit en toutes lettres ce que la chaîne couvre, pour qui la relira.
    portee:
      'La chaîne garantit les événements enregistrés à partir de cette date. ' +
      'Les pièces antérieures sont dénombrées ici, non chaînées.',
  })

  return true
}

export interface Verification {
  evenements: number
  premierRang: number | null
  dernierRang: number | null
  intacte: boolean
  /** Rang du premier maillon en défaut, quand il y en a un. */
  rompueAu: number | null
  motif: string | null
  derniereEcritureLe: string | null
}

/**
 * Reparcourt la chaîne et dit si elle tient.
 *
 * Trois défauts sont cherchés : une signature qui ne correspond plus à son
 * contenu, un maillon qui ne pointe pas sur le précédent, et un rang manquant —
 * une suppression laisse ce trou même si tout le reste est cohérent.
 */
export async function verifier(veterinarianId: number): Promise<Verification> {
  const lignes = (await db
    .from('vet_accounting_events')
    .where('veterinarian_id', veterinarianId)
    .orderBy('sequence', 'asc')) as LigneJournal[]

  if (lignes.length === 0) {
    return {
      evenements: 0,
      premierRang: null,
      dernierRang: null,
      intacte: true,
      rompueAu: null,
      motif: null,
      derniereEcritureLe: null,
    }
  }

  let attendu = GENESIS

  for (const [index, ligne] of lignes.entries()) {
    const rang = Number(ligne.sequence)

    if (rang !== index + 1) {
      return {
        evenements: lignes.length,
        premierRang: Number(lignes[0].sequence),
        dernierRang: Number(lignes[lignes.length - 1].sequence),
        intacte: false,
        rompueAu: rang,
        motif: `Le rang ${index + 1} est absent du journal : un événement a été retiré.`,
        derniereEcritureLe: null,
      }
    }

    if (ligne.previous_signature !== attendu) {
      return {
        evenements: lignes.length,
        premierRang: Number(lignes[0].sequence),
        dernierRang: Number(lignes[lignes.length - 1].sequence),
        intacte: false,
        rompueAu: rang,
        motif: `L'événement ${rang} ne se rattache pas au précédent.`,
        derniereEcritureLe: null,
      }
    }

    const recordedAt =
      ligne.recorded_at instanceof Date
        ? DateTime.fromJSDate(ligne.recorded_at).toISO()!
        : String(ligne.recorded_at)

    const recalculee = signer(
      Number(ligne.veterinarian_id),
      rang,
      ligne.type,
      ligne.payload,
      recordedAt,
      ligne.previous_signature
    )

    if (recalculee !== ligne.signature) {
      return {
        evenements: lignes.length,
        premierRang: Number(lignes[0].sequence),
        dernierRang: Number(lignes[lignes.length - 1].sequence),
        intacte: false,
        rompueAu: rang,
        motif: `Le contenu de l'événement ${rang} ne correspond plus à sa signature.`,
        derniereEcritureLe: null,
      }
    }

    attendu = ligne.signature
  }

  const derniere = lignes[lignes.length - 1]

  return {
    evenements: lignes.length,
    premierRang: Number(lignes[0].sequence),
    dernierRang: Number(derniere.sequence),
    intacte: true,
    rompueAu: null,
    motif: null,
    derniereEcritureLe:
      derniere.recorded_at instanceof Date
        ? DateTime.fromJSDate(derniere.recorded_at).toISO()
        : String(derniere.recorded_at),
  }
}

/**
 * Les totaux cumulés d'une clôture.
 *
 * Le grand total perpétuel est celui que la loi attend : il ne se remet jamais
 * à zéro, d'un exercice à l'autre, et c'est sa continuité qui rend une
 * suppression visible.
 */
export async function totauxCumules(veterinarianId: number) {
  const [ventes] = await db
    .from('vet_invoices')
    .where('veterinarian_id', veterinarianId)
    .whereNot('status', 'draft')
    .select(
      db.raw(
        `COALESCE(SUM(CASE WHEN type = 'credit_note' THEN -total ELSE total END), 0) as net`
      ),
      db.raw('COUNT(*) as pieces')
    )

  const [encaisse] = await db
    .from('vet_payments')
    .where('veterinarian_id', veterinarianId)
    .sum('amount as total')
    .count('* as nombre')

  return {
    grandTotalPerpetuel: Number(ventes?.net ?? 0),
    piecesEmises: Number(ventes?.pieces ?? 0),
    encaissementsCumules: Number(encaisse?.total ?? 0),
    nombreReglements: Number(encaisse?.nombre ?? 0),
  }
}
