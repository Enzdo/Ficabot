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

/** Les taux de TVA en vigueur en France, plus l'exonération. */
export const VAT_RATES = [20, 10, 5.5, 2.1, 0] as const

/**
 * Ventile une facture par taux de TVA.
 *
 * C'est la seule lecture juste dès qu'une facture mêle plusieurs taux : ni le
 * total, ni un taux unique ne la décrivent. Elle sert au calcul des totaux, à
 * la mention obligatoire sur le document remis au client, au récapitulatif de
 * TVA et aux écritures — d'où sa place ici plutôt que dans un contrôleur.
 */
export interface VentilationTva {
  rate: number
  base: number
  tva: number
}

export function ventilerParTaux(
  lignes: { total: number | string; taxRate?: number | string | null }[],
  tauxParDefaut = 0
): VentilationTva[] {
  const parTaux = new Map<number, { base: number; tva: number }>()

  for (const l of lignes) {
    const taux = l.taxRate === null || l.taxRate === undefined ? tauxParDefaut : Number(l.taxRate)
    const base = Number(l.total)
    if (!Number.isFinite(base)) continue

    const courant = parTaux.get(taux) ?? { base: 0, tva: 0 }
    courant.base = round2(courant.base + base)
    // La TVA est arrondie sur le cumul du taux, non ligne à ligne : arrondir
    // chaque ligne puis sommer dérive d'un centime par ligne.
    parTaux.set(taux, courant)
  }

  return [...parTaux.entries()]
    .map(([rate, v]) => ({ rate, base: v.base, tva: round2((v.base * rate) / 100) }))
    .sort((a, b) => b.rate - a.rate)
}

/** Les totaux d'une facture, déduits de sa ventilation. */
export function totauxDepuisVentilation(ventilation: VentilationTva[]) {
  const ht = round2(ventilation.reduce((s, v) => s + v.base, 0))
  const tva = round2(ventilation.reduce((s, v) => s + v.tva, 0))
  return {
    subtotal: ht,
    tax: tva,
    total: round2(ht + tva),
    // Un taux unique se résume par lui-même ; plusieurs ne se résument pas.
    taxRate: ventilation.length === 1 ? ventilation[0].rate : null,
  }
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
 * des prestations et la TVA au crédit de son compte — ventilés par taux. Un
 * avoir inverse le sens.
 */
export function ecrituresVente(
  vet: Veterinarian,
  invoice: VetInvoice,
  numero: string,
  ventilation: VentilationTva[]
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
  ]

  /**
   * Une ligne de produit et une ligne de TVA par taux.
   *
   * Le comptable rapproche base et TVA taux par taux : une base globale en
   * face d'une TVA globale ne se vérifie pas dès que la facture en mêle
   * plusieurs. C'est aussi ce que la ventilation de TVA attend à la clôture.
   */
  for (const part of ventilation) {
    if (part.base !== 0) {
      lignes.push({
        ...base,
        compteNum: vet.accountSales,
        compteLib: `Prestations de services${ventilation.length > 1 ? ` — TVA ${part.rate} %` : ''}`,
        debit: avoir ? part.base : 0,
        credit: avoir ? 0 : part.base,
      })
    }

    // Pas de ligne de TVA à zéro : en franchise en base elle n'a pas lieu
    // d'être, et un import la rejetterait comme écriture vide.
    if (part.tva !== 0) {
      lignes.push({
        ...base,
        compteNum: vet.accountVat,
        compteLib: `TVA collectée ${part.rate} %`,
        debit: avoir ? part.tva : 0,
        credit: avoir ? 0 : part.tva,
      })
    }
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
