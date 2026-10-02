import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Veterinarian from '#models/veterinarian'
import VetInvoice from '#models/vet_invoice'
import VetPayment from '#models/vet_payment'
import {
  PAYMENT_METHODS,
  balanceOf,
  ecrituresReglement,
  ecrituresVente,
  isClosed,
  monthOf,
  round2,
  versFec,
  type PaymentMethod,
} from '#services/vet_accounting'

/**
 * Ce que le cabinet transmet à son comptable.
 *
 * Le logiciel ne tient pas la comptabilité : il produit les pièces, les
 * règlements et les écritures que le comptable reprend. Bilan et compte de
 * résultat restent chez lui.
 */
export default class VetAccountingController {
  /** Bornes d'une période demandée, par défaut le mois en cours. */
  private periode(request: HttpContext['request']) {
    const from = String(request.input('from') ?? '').slice(0, 10)
    const to = String(request.input('to') ?? '').slice(0, 10)

    if (from && to) return { from, to }

    const now = DateTime.now()
    return {
      from: now.startOf('month').toISODate()!,
      to: now.endOf('month').toISODate()!,
    }
  }

  // ─────────────────────────── Règlements ───────────────────────────

  async listPayments({ request, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    const { from, to } = this.periode(request)

    const payments = await VetPayment.query()
      .where('veterinarian_id', vet.id)
      .whereBetween('date', [from, to])
      .preload('invoice')
      .orderBy('date', 'desc')

    return response.ok({
      success: true,
      data: payments.map((p) => ({
        id: p.id,
        invoiceId: p.invoiceId,
        invoiceNumber: p.invoice?.number ?? null,
        clientName: p.invoice?.clientName ?? null,
        date: p.date?.toISODate() ?? null,
        amount: Number(p.amount),
        method: p.method,
        reference: p.reference,
        note: p.note,
      })),
      total: round2(payments.reduce((sum, p) => sum + Number(p.amount), 0)),
    })
  }

  /**
   * Enregistre un encaissement.
   *
   * Le statut de la facture en découle : payée dès que la somme des règlements
   * atteint le total. On ne le saisit plus à la main — un statut et un registre
   * qui se contredisent sont pires que l'un des deux seul.
   */
  async addPayment({ params, request, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian

    const invoice = await VetInvoice.query()
      .where('id', params.id)
      .where('veterinarian_id', vet.id)
      .first()

    if (!invoice) {
      return response.notFound({ success: false, message: 'Facture non trouvée' })
    }

    if (invoice.type === 'credit_note') {
      return response.badRequest({
        success: false,
        message: "Un avoir ne s'encaisse pas : il annule une facture.",
      })
    }

    // Une facture annulée par un avoir n'attend plus de règlement : l'encaisser
    // laisserait un produit au crédit du client que rien ne solde.
    const avoir = await VetInvoice.query()
      .where('veterinarian_id', vet.id)
      .where('cancels_invoice_id', invoice.id)
      .first()

    if (avoir) {
      return response.conflict({
        success: false,
        message: `Cette facture est annulée par l'avoir ${avoir.number} : elle n'attend plus de règlement.`,
        code: 'INVOICE_CANCELLED',
      })
    }

    const amount = Number(request.input('amount'))
    const method = String(request.input('method') ?? 'card') as PaymentMethod
    const date = String(request.input('date') ?? DateTime.now().toISODate()).slice(0, 10)

    if (!Number.isFinite(amount) || amount <= 0) {
      return response.badRequest({ success: false, message: 'Montant invalide.' })
    }

    if (!PAYMENT_METHODS.includes(method)) {
      return response.badRequest({ success: false, message: 'Moyen de paiement inconnu.' })
    }

    // Une période close ne se rouvre pas par un encaissement rétroactif : le
    // comptable a déjà reçu ces écritures.
    if (isClosed(vet, date)) {
      return response.conflict({
        success: false,
        message: `La période ${monthOf(date)} est clôturée. Enregistrez ce règlement à une date postérieure.`,
        code: 'PERIOD_CLOSED',
      })
    }

    const existants = await VetPayment.query().where('invoice_id', invoice.id)
    const reste = balanceOf(invoice, existants)

    if (round2(amount) > reste + 0.009) {
      return response.badRequest({
        success: false,
        message: `Ce règlement dépasse le reste dû (${reste.toFixed(2)} €).`,
        code: 'OVERPAYMENT',
      })
    }

    const payment = await VetPayment.create({
      invoiceId: invoice.id,
      veterinarianId: vet.id,
      date: DateTime.fromISO(date),
      amount: round2(amount),
      method,
      reference: String(request.input('reference') ?? '').trim() || null,
      note: String(request.input('note') ?? '').trim() || null,
    })

    const apres = await VetPayment.query().where('invoice_id', invoice.id)
    const resteApres = balanceOf(invoice, apres)

    invoice.status = resteApres <= 0.009 ? 'paid' : 'pending'
    invoice.paidAt = resteApres <= 0.009 ? DateTime.fromISO(date) : null
    await invoice.save()

    return response.created({
      success: true,
      message: resteApres <= 0.009 ? 'Facture soldée.' : `Règlement enregistré. Reste ${resteApres.toFixed(2)} €.`,
      data: { id: payment.id, remaining: resteApres, status: invoice.status },
    })
  }

  async deletePayment({ params, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian

    const payment = await VetPayment.query()
      .where('id', params.id)
      .where('veterinarian_id', vet.id)
      .preload('invoice')
      .first()

    if (!payment) {
      return response.notFound({ success: false, message: 'Règlement non trouvé' })
    }

    if (isClosed(vet, payment.date?.toISODate())) {
      return response.conflict({
        success: false,
        message: `La période ${monthOf(payment.date?.toISODate())} est clôturée : ce règlement ne peut plus être retiré.`,
        code: 'PERIOD_CLOSED',
      })
    }

    const invoice = payment.invoice
    await payment.delete()

    if (invoice) {
      const restants = await VetPayment.query().where('invoice_id', invoice.id)
      const reste = balanceOf(invoice, restants)
      invoice.status = reste <= 0.009 ? 'paid' : 'pending'
      invoice.paidAt = reste <= 0.009 ? invoice.paidAt : null
      await invoice.save()
    }

    return response.ok({ success: true, message: 'Règlement retiré.' })
  }

  /** Les règlements d'une facture, et ce qu'il reste à encaisser. */
  async invoicePayments({ params, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian

    const invoice = await VetInvoice.query()
      .where('id', params.id)
      .where('veterinarian_id', vet.id)
      .first()

    if (!invoice) {
      return response.notFound({ success: false, message: 'Facture non trouvée' })
    }

    const payments = await VetPayment.query().where('invoice_id', invoice.id).orderBy('date', 'asc')

    return response.ok({
      success: true,
      data: {
        total: round2(Number(invoice.total)),
        paid: round2(payments.reduce((s, p) => s + Number(p.amount), 0)),
        remaining: balanceOf(invoice, payments),
        payments: payments.map((p) => ({
          id: p.id,
          date: p.date?.toISODate() ?? null,
          amount: Number(p.amount),
          method: p.method,
          reference: p.reference,
          note: p.note,
          locked: isClosed(vet, p.date?.toISODate()),
        })),
      },
    })
  }

  // ─────────────────────────── TVA ───────────────────────────

  /**
   * Récapitulatif de TVA, par taux, sur une période.
   *
   * Les avoirs se soustraient : ils annulent une vente, donc la TVA qu'elle
   * portait. Les brouillons sont exclus — ils ne sont pas des pièces.
   */
  async vatSummary({ request, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    const { from, to } = this.periode(request)

    const invoices = await VetInvoice.query()
      .where('veterinarian_id', vet.id)
      .whereNot('status', 'draft')
      .whereBetween('date', [from, to])

    const parTaux = new Map<number, { base: number; tva: number; pieces: number }>()

    for (const inv of invoices) {
      const taux = Number(inv.taxRate ?? 0)
      const signe = inv.type === 'credit_note' ? -1 : 1
      const ligne = parTaux.get(taux) ?? { base: 0, tva: 0, pieces: 0 }
      ligne.base = round2(ligne.base + signe * Number(inv.subtotal))
      ligne.tva = round2(ligne.tva + signe * Number(inv.tax))
      ligne.pieces += 1
      parTaux.set(taux, ligne)
    }

    const lignes = [...parTaux.entries()]
      .map(([rate, l]) => ({ rate, ...l }))
      .sort((a, b) => a.rate - b.rate)

    return response.ok({
      success: true,
      data: {
        from,
        to,
        lines: lignes,
        totalBase: round2(lignes.reduce((s, l) => s + l.base, 0)),
        totalVat: round2(lignes.reduce((s, l) => s + l.tva, 0)),
        vatExempt: !!vet.vatExempt,
      },
    })
  }

  // ─────────────────────────── Écritures ───────────────────────────

  /**
   * Construit les écritures d'une période : les ventes puis les règlements.
   *
   * La numérotation est séquentielle et stable dans l'ordre des dates, ce
   * qu'un import attend. Elle est propre à l'export : le logiciel ne tient pas
   * de registre d'écritures, il les dérive des pièces.
   */
  private async ecritures(vet: Veterinarian, from: string, to: string) {
    const invoices = await VetInvoice.query()
      .where('veterinarian_id', vet.id)
      .whereNot('status', 'draft')
      .whereBetween('date', [from, to])
      .orderBy('date', 'asc')
      .orderBy('id', 'asc')

    const payments = await VetPayment.query()
      .where('veterinarian_id', vet.id)
      .whereBetween('date', [from, to])
      .preload('invoice')
      .orderBy('date', 'asc')
      .orderBy('id', 'asc')

    const lignes = []
    let rang = 0

    for (const inv of invoices) {
      rang += 1
      lignes.push(...ecrituresVente(vet, inv, `VE${String(rang).padStart(6, '0')}`))
    }

    rang = 0
    for (const p of payments) {
      // Un règlement dont la facture a disparu n'a pas de contrepartie client :
      // on l'omet plutôt que de produire une écriture boiteuse.
      if (!p.invoice) continue
      rang += 1
      lignes.push(...ecrituresReglement(vet, p.invoice, p, `RG${String(rang).padStart(6, '0')}`))
    }

    return lignes
  }

  /**
   * Les mêmes écritures que l'export, mais lisibles à l'écran.
   *
   * On ne demande pas au cabinet de télécharger un fichier pour vérifier ce
   * qu'il contient : il le voit d'abord, et exporte ensuite.
   */
  async journal({ request, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    const { from, to } = this.periode(request)
    const lignes = await this.ecritures(vet, from, to)

    const debit = round2(lignes.reduce((sum, l) => sum + l.debit, 0))
    const credit = round2(lignes.reduce((sum, l) => sum + l.credit, 0))

    return response.ok({
      success: true,
      data: {
        from,
        to,
        entries: lignes,
        totalDebit: debit,
        totalCredit: credit,
        balanced: Math.abs(debit - credit) <= 0.009,
      },
    })
  }

  // ─────────────────────────── Export FEC ───────────────────────────

  /**
   * Fichier des Écritures Comptables, format de l'arrêté du 29 juillet 2013.
   *
   * C'est le livrable qui relie le logiciel au comptable : il l'importe dans
   * son outil sans ressaisie. Le fichier est vérifié avant d'être rendu — un
   * FEC déséquilibré est refusé à l'import, et mieux vaut le dire ici.
   */
  async fec({ request, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    const { from, to } = this.periode(request)
    const lignes = await this.ecritures(vet, from, to)

    const debit = round2(lignes.reduce((s, l) => s + l.debit, 0))
    const credit = round2(lignes.reduce((s, l) => s + l.credit, 0))

    // Un écart signalerait une erreur de construction : on refuse plutôt que de
    // livrer un fichier que le comptable découvrirait faux.
    if (Math.abs(debit - credit) > 0.009) {
      return response.internalServerError({
        success: false,
        message: `Écritures déséquilibrées (débit ${debit.toFixed(2)} € / crédit ${credit.toFixed(2)} €). L'export est interrompu.`,
        code: 'FEC_UNBALANCED',
      })
    }

    // Nom imposé : le SIREN — les neuf premiers chiffres du SIRET, non les
    // quatorze —, « FEC », puis la date de fin de période.
    const siren = (vet.siret || '').replace(/\D/g, '').slice(0, 9)
    const nom = `${siren || 'SANSSIREN'}FEC${String(to).replace(/-/g, '')}.txt`

    response.header('Content-Type', 'text/plain; charset=utf-8')
    response.header('Content-Disposition', `attachment; filename="${nom}"`)
    return response.send(versFec(lignes))
  }

  // ─────────────────────────── Clôture ───────────────────────────

  async closingStatus({ response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    return response.ok({
      success: true,
      data: { closedThrough: vet.accountingClosedThrough ?? null },
    })
  }

  /**
   * Clôture les périodes jusqu'au mois demandé.
   *
   * Une fois un mois transmis au comptable, ses écritures ne doivent plus
   * bouger : sans cela, l'export d'hier et celui de demain racontent deux
   * histoires différentes du même mois.
   */
  async close({ request, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    const through = String(request.input('through') ?? '').slice(0, 7)

    if (!/^\d{4}-\d{2}$/.test(through)) {
      return response.badRequest({
        success: false,
        message: 'Mois attendu au format AAAA-MM.',
      })
    }

    if (through > DateTime.now().toFormat('yyyy-MM')) {
      return response.badRequest({
        success: false,
        message: "On ne clôture pas un mois à venir.",
      })
    }

    // La clôture n'est pas réversible depuis le logiciel : reculer la limite
    // rouvrirait des écritures déjà transmises.
    if (vet.accountingClosedThrough && through < vet.accountingClosedThrough) {
      return response.conflict({
        success: false,
        message: `Les périodes sont déjà clôturées jusqu'à ${vet.accountingClosedThrough}. Une clôture ne se recule pas.`,
        code: 'ALREADY_CLOSED',
      })
    }

    // La vraie fin de mois, et non un « -31 » générique : septembre n'a pas de
    // 31, et Postgres rejette la date au lieu de filtrer.
    const finDeMois = DateTime.fromISO(`${through}-01`).endOf('month').toISODate()!

    // Les identifiants plutôt qu'un `count` : un agrégat passe par `$extras`,
    // dont l'absence se lit comme un zéro — la garde laissait alors clôturer
    // une période où des brouillons subsistaient.
    const brouillons = await VetInvoice.query()
      .where('veterinarian_id', vet.id)
      .where('status', 'draft')
      .where('date', '<=', finDeMois)
      .select('id')

    const restants = brouillons.length

    if (restants > 0) {
      return response.conflict({
        success: false,
        message: `${restants} brouillon(s) subsistent sur la période. Émettez-les ou supprimez-les avant de clôturer.`,
        code: 'DRAFTS_REMAIN',
      })
    }

    vet.accountingClosedThrough = through
    await vet.save()

    return response.ok({
      success: true,
      message: `Périodes clôturées jusqu'à ${through}.`,
      data: { closedThrough: through },
    })
  }
}
