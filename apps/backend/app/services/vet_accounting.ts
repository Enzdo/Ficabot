import VetInvoice from '#models/vet_invoice'
import VetPayment from '#models/vet_payment'
import Veterinarian from '#models/veterinarian'

/**
 * Ce qu'il faut pour nourrir un comptable.
 *
 * Le logiciel ne tient pas de comptabilité : il produit les pièces et les
 * écritures qu'un comptable reprend dans son outil. La frontière est voulue —
 * bilan, compte de résultat et rapprochement bancaire relèvent d'un métier, et
 * d'un logiciel, que celui-ci n'a pas vocation à remplacer.
 */

export type PaymentMethod = 'cash' | 'card' | 'check' | 'transfer' | 'other'

export const PAYMENT_METHODS: PaymentMethod[] = ['cash', 'card', 'check', 'transfer', 'other']

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Espèces',
  card: 'Carte bancaire',
  check: 'Chèque',
  transfer: 'Virement',
  other: 'Autre',
}

/** Arrondi au centime. Les sommes de décimaux dérivent sans cela. */
export function round2(value: number): number {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100
}

/**
 * Reste dû sur une facture, règlements déduits.
 *
 * Un avoir ne se règle pas : il annule. Son solde est donc nul par nature,
 * quelle que soit la somme encaissée sur la facture d'origine.
 */
export function balanceOf(invoice: VetInvoice, payments: VetPayment[]): number {
  if (invoice.type === 'credit_note') return 0
  const encaisse = payments.reduce((sum, p) => sum + Number(p.amount), 0)
  return round2(Number(invoice.total) - encaisse)
}

/**
 * Le mois d'une date, au format AAAA-MM — la granularité de la clôture.
 */
export function monthOf(date: string | null | undefined): string {
  return String(date ?? '').slice(0, 7)
}

/**
 * Une période est-elle close ?
 *
 * La comparaison de chaînes AAAA-MM suffit et se trie correctement, là où un
 * calcul de dates introduirait des fuseaux là où il n'y a que des mois.
 */
export function isClosed(vet: Veterinarian, date: string | null | undefined): boolean {
  const limite = vet.accountingClosedThrough
  if (!limite) return false
  const mois = monthOf(date)
  return mois !== '' && mois <= limite
}

/** Une ligne d'écriture comptable, avant mise au format FEC. */
export interface LigneEcriture {
  journalCode: string
  journalLib: string
  ecritureNum: string
  ecritureDate: string
  compteNum: string
  compteLib: string
  compAuxNum: string
  compAuxLib: string
  pieceRef: string
  pieceDate: string
  ecritureLib: string
  debit: number
  credit: number
}

/**
 * Compte auxiliaire d'un client.
 *
 * Il doit être stable dans le temps : le comptable rapproche les écritures d'un
 * exercice à l'autre dessus. On le dérive de l'identifiant, et non du nom —
 * qu'un mariage ou une faute de frappe ferait changer.
 */
export function compteAuxiliaire(invoice: VetInvoice): { num: string; lib: string } {
  if (invoice.userId) return { num: `C${String(invoice.userId).padStart(6, '0')}`, lib: invoice.clientName || '' }
  if (invoice.externalClientId) {
    return { num: `E${String(invoice.externalClientId).padStart(6, '0')}`, lib: invoice.clientName || '' }
  }
  // Facture sans client au fichier : regroupée sur un compte collectif plutôt
  // que laissée sans auxiliaire, ce qu'un import refuserait.
  return { num: 'DIVERS', lib: invoice.clientName || 'Client de passage' }
}

/**
 * Écritures de vente d'une facture : le TTC au débit du client, le HT au crédit
 * des prestations, la TVA au crédit de son compte. Un avoir inverse le sens.
 */
export function ecrituresVente(
  vet: Veterinarian,
  invoice: VetInvoice,
  numero: string
): LigneEcriture[] {
  const avoir = invoice.type === 'credit_note'
  const aux = compteAuxiliaire(invoice)
  const base = {
    journalCode: 'VE',
    journalLib: 'Ventes',
    ecritureNum: numero,
    ecritureDate: invoice.date,
    pieceRef: invoice.number,
    pieceDate: invoice.date,
    ecritureLib: `${avoir ? 'Avoir' : 'Facture'} ${invoice.number} — ${invoice.clientName || 'client'}`.slice(0, 200),
    compAuxNum: '',
    compAuxLib: '',
  }

  const ttc = round2(Number(invoice.total))
  const ht = round2(Number(invoice.subtotal))
  const tva = round2(Number(invoice.tax))

  const lignes: LigneEcriture[] = [
    {
      ...base,
      compteNum: vet.accountClients,
      compteLib: 'Clients',
      compAuxNum: aux.num,
      compAuxLib: aux.lib,
      debit: avoir ? 0 : ttc,
      credit: avoir ? ttc : 0,
    },
    {
      ...base,
      compteNum: vet.accountSales,
      compteLib: 'Prestations de services',
      debit: avoir ? ht : 0,
      credit: avoir ? 0 : ht,
    },
  ]

  // Pas de ligne de TVA à zéro : en franchise en base, elle n'a pas lieu d'être
  // et un import la rejetterait comme écriture vide.
  if (tva !== 0) {
    lignes.push({
      ...base,
      compteNum: vet.accountVat,
      compteLib: 'TVA collectée',
      debit: avoir ? tva : 0,
      credit: avoir ? 0 : tva,
    })
  }

  return lignes
}

/**
 * Écritures de règlement : l'encaissement au débit de la banque ou de la
 * caisse, et le compte client soldé d'autant.
 */
export function ecrituresReglement(
  vet: Veterinarian,
  invoice: VetInvoice,
  payment: VetPayment,
  numero: string
): LigneEcriture[] {
  const especes = payment.method === 'cash'
  const aux = compteAuxiliaire(invoice)
  const montant = round2(Number(payment.amount))
  const date = payment.date?.toISODate() ?? invoice.date

  const base = {
    journalCode: especes ? 'CA' : 'BQ',
    journalLib: especes ? 'Caisse' : 'Banque',
    ecritureNum: numero,
    ecritureDate: date,
    pieceRef: invoice.number,
    pieceDate: date,
    ecritureLib: `Règlement ${invoice.number} — ${PAYMENT_METHOD_LABELS[payment.method]}`.slice(0, 200),
    compAuxNum: '',
    compAuxLib: '',
  }

  return [
    {
      ...base,
      compteNum: especes ? vet.accountCash : vet.accountBank,
      compteLib: especes ? 'Caisse' : 'Banque',
      debit: montant,
      credit: 0,
    },
    {
      ...base,
      compteNum: vet.accountClients,
      compteLib: 'Clients',
      compAuxNum: aux.num,
      compAuxLib: aux.lib,
      debit: 0,
      credit: montant,
    },
  ]
}

/**
 * Met les écritures au format FEC — arrêté du 29 juillet 2013, dix-huit
 * colonnes séparées par des tabulations, montants à la française.
 *
 * Le séparateur est la tabulation plutôt que le point-virgule : les libellés
 * contiennent des noms de clients, et un point-virgule y romprait le fichier.
 */
export function versFec(lignes: LigneEcriture[]): string {
  const colonnes = [
    'JournalCode', 'JournalLib', 'EcritureNum', 'EcritureDate', 'CompteNum', 'CompteLib',
    'CompAuxNum', 'CompAuxLib', 'PieceRef', 'PieceDate', 'EcritureLib', 'Debit', 'Credit',
    'EcritureLet', 'DateLet', 'ValidDate', 'Montantdevise', 'Idevise',
  ]

  const jour = (iso: string) => String(iso ?? '').replace(/-/g, '').slice(0, 8)
  const montant = (v: number) => (v === 0 ? '0,00' : v.toFixed(2).replace('.', ','))
  const propre = (v: string) => String(v ?? '').replace(/[\t\r\n]/g, ' ').trim()

  const corps = lignes.map((l) =>
    [
      l.journalCode, l.journalLib, l.ecritureNum, jour(l.ecritureDate),
      l.compteNum, propre(l.compteLib), l.compAuxNum, propre(l.compAuxLib),
      propre(l.pieceRef), jour(l.pieceDate), propre(l.ecritureLib),
      montant(l.debit), montant(l.credit),
      '', '', jour(l.ecritureDate), '', '',
    ].join('\t')
  )

  return [colonnes.join('\t'), ...corps].join('\r\n') + '\r\n'
}
