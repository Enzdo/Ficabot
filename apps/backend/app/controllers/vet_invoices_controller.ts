import type { HttpContext } from '@adonisjs/core/http'
import VetInvoice from '#models/vet_invoice'
import Veterinarian from '#models/veterinarian'
import VetPayment from '#models/vet_payment'
import { balanceOf, isClosed, monthOf, round2 } from '#services/vet_accounting'
import { enregistrer, ouvrirSiNecessaire } from '#services/vet_accounting_chain'
import UserVeterinarian from '#models/user_veterinarian'
import VetExternalClient from '#models/vet_external_client'
import { createInvoiceValidator, updateInvoiceStatusValidator } from '#validators/vet_invoice'
import { DateTime } from 'luxon'
import logger from '@adonisjs/core/services/logger'
import VetInventoryMovement from '#models/vet_inventory_movement'

export default class VetInvoicesController {
  async index({ request, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    const { status, search } = request.qs()

    let query = VetInvoice.query()
      .where('veterinarian_id', vet.id)
      .preload('items')
      .orderBy('created_at', 'desc')

    // « En retard » n'était jamais posé par personne : aucune tâche planifiée
    // n'existe, et rien ne comparait la date d'échéance. Le filtre restait donc
    // vide et le compteur à 0 € même avec des factures échues impayées.
    // Le retard se déduit à la lecture : une facture en attente dont l'échéance
    // est passée est en retard. Les deux états sont disjoints, pour que les
    // compteurs « En attente » et « En retard » ne comptent pas deux fois.
    const today = DateTime.now().toFormat('yyyy-MM-dd')

    if (status === 'overdue') {
      query = query.where('status', 'pending').where('due_date', '<', today)
    } else if (status === 'pending') {
      query = query.where('status', 'pending').where('due_date', '>=', today)
    } else if (status && status !== 'all') {
      query = query.where('status', status)
    }

    if (search) {
      query = query.where((q) => {
        q.whereILike('number', `%${search}%`)
          .orWhereILike('client_name', `%${search}%`)
          .orWhereILike('pet_name', `%${search}%`)
      })
    }

    const invoices = await query

    // Quelles factures ont été annulées par un avoir. Une seule requête pour
    // toute la page plutôt qu'une par ligne : la liste peut être longue.
    const avoirs = await VetInvoice.query()
      .where('veterinarian_id', vet.id)
      .where('type', 'credit_note')
      .whereNotNull('cancels_invoice_id')
      .select('number', 'cancels_invoice_id')

    const annuleePar = new Map<number, string>()
    for (const avoir of avoirs) {
      if (avoir.cancelsInvoiceId) annuleePar.set(avoir.cancelsInvoiceId, avoir.number)
    }

    // Ce qui a été encaissé sur chaque facture, en une requête groupée. Sans
    // cela, un paiement en deux fois est invisible : la facture reste « en
    // attente » sans dire qu'elle est à moitié réglée.
    const encaissements = await VetPayment.query()
      .where('veterinarian_id', vet.id)
      .select('invoice_id')
      .sum('amount as total')
      .groupBy('invoice_id')

    const regle = new Map<number, number>()
    for (const ligne of encaissements) {
      regle.set(Number(ligne.invoiceId), round2(Number((ligne as any).$extras.total ?? 0)))
    }

    // Le drapeau accompagne chaque ligne : l'écran peut signaler le retard sans
    // refaire le calcul, et sans se fier à un statut stocké qui ne bouge jamais.
    return response.ok({
      success: true,
      data: invoices.map((invoice) => ({
        ...invoice.serialize(),
        isOverdue:
          !annuleePar.has(invoice.id) &&
          invoice.status === 'pending' &&
          String(invoice.dueDate ?? '') < today,
        // Numéro de l'avoir qui l'annule, s'il existe. L'annulation ne se lit
        // pas dans le statut, qui dit où en est le règlement.
        cancelledBy: annuleePar.get(invoice.id) ?? null,
        // Encaissé et reste dû. Ni un avoir, ni une facture qu'un avoir a
        // annulée, n'attendent de règlement : afficher un reste dû sur elles
        // ferait croire à une somme à recouvrer.
        paid: regle.get(invoice.id) ?? 0,
        remaining:
          invoice.type === 'credit_note' || annuleePar.has(invoice.id)
            ? 0
            : round2(Number(invoice.total) - (regle.get(invoice.id) ?? 0)),
      })),
    })
  }

  async stats({ response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    const now = DateTime.now()
    const startOfMonth = now.startOf('month').toSQL()
    const endOfMonth = now.endOf('month').toSQL()

    const invoices = await VetInvoice.query()
      .where('veterinarian_id', vet.id)
      .whereBetween('date', [startOfMonth!, endOfMonth!])

    // Mois précédent, pour une comparaison réelle : l'écran affichait
    // « +0 % vs mois dernier » en permanence, la valeur étant forcée à zéro
    // côté page et jamais calculée côté serveur.
    const previousMonth = now.minus({ months: 1 })
    const previousInvoices = await VetInvoice.query()
      .where('veterinarian_id', vet.id)
      .whereBetween('date', [
        previousMonth.startOf('month').toSQL()!,
        previousMonth.endOf('month').toSQL()!,
      ])

    const today = now.toFormat('yyyy-MM-dd')
    /**
     * Un avoir se soustrait.
     *
     * Il porte les mêmes montants que la facture qu'il annule ; les additionner
     * ferait compter la recette deux fois au lieu de la neutraliser — le
     * chiffre d'affaires gonflerait à chaque annulation.
     */
    const sum = (list: VetInvoice[]) =>
      list.reduce(
        (acc, inv) => acc + (inv.type === 'credit_note' ? -Number(inv.total) : Number(inv.total)),
        0
      )

    // L'avoir entre dans le règlement : il annule une recette encaissée, donc
    // il pèse sur la même ligne, en négatif via `sum`.
    /**
     * Combien de factures attendent réellement un règlement.
     *
     * Les montants se compensent — une facture et son avoir font zéro — mais
     * les compter toutes deux affichait « 0,00 € / 2 factures », ce qui ne veut
     * rien dire. Le compte ne retient donc que les factures encore vivantes :
     * ni les avoirs, ni celles qu'un avoir a annulées.
     */
    const annulees = new Set(
      invoices.filter((i) => i.cancelsInvoiceId).map((i) => i.cancelsInvoiceId as number)
    )
    const vivante = (i: VetInvoice) => i.type === 'invoice' && !annulees.has(i.id)

    /**
     * Ce qui reste réellement à encaisser, et non le total facturé.
     *
     * Une facture à moitié réglée comptait pour son total entier dans « En
     * attente » : le praticien lisait 120 € à recouvrer là où 70 € manquaient.
     * Et une facture annulée par un avoir n'attend plus rien du tout.
     */
    const encaissements = await VetPayment.query()
      .where('veterinarian_id', vet.id)
      .select('invoice_id')
      .sum('amount as total')
      .groupBy('invoice_id')

    const regle = new Map<number, number>()
    for (const l of encaissements) {
      regle.set(Number(l.invoiceId), Number((l as any).$extras.total ?? 0))
    }

    const paidInvoices = invoices.filter(i => i.status === 'paid')
    // Mêmes règles que la liste, pour que les compteurs correspondent à ce que
    // les onglets affichent : en retard = en attente et échéance dépassée.
    const overdueInvoices = invoices.filter(
      i => i.status === 'pending' && String(i.dueDate ?? '') < today
    )
    const pendingInvoices = invoices.filter(
      i => i.status === 'pending' && String(i.dueDate ?? '') >= today
    )

    /** Reste à encaisser sur un lot : les annulées et les avoirs ne pèsent pas. */
    const resteDu = (list: VetInvoice[]) =>
      round2(
        list
          .filter(vivante)
          .reduce((acc, i) => acc + Math.max(0, Number(i.total) - (regle.get(i.id) ?? 0)), 0)
      )

    // Les brouillons ne sont pas du chiffre d'affaires : ils gonflaient le
    // total du mois alors qu'ils ne sont pas encore des factures.
    const monthTotal = sum(invoices.filter(i => i.status !== 'draft'))
    const previousTotal = sum(previousInvoices.filter(i => i.status !== 'draft'))

    // `null` quand le mois précédent est vide : une comparaison n'a alors pas
    // de sens, et un « +0 % » laisserait croire à une stagnation.
    const growth =
      previousTotal > 0 ? Math.round(((monthTotal - previousTotal) / previousTotal) * 100) : null

    return response.ok({
      success: true,
      data: {
        total: monthTotal,
        growth,
        paid: round2(
          invoices.filter(vivante).reduce((acc, i) => acc + (regle.get(i.id) ?? 0), 0)
        ),
        paidCount: paidInvoices.filter(vivante).length,
        pending: resteDu(pendingInvoices),
        pendingCount: pendingInvoices.filter(vivante).length,
        overdue: resteDu(overdueInvoices),
        overdueCount: overdueInvoices.filter(vivante).length,
      },
    })
  }

  /**
   * Prochain numéro de facture du praticien pour l'année en cours.
   *
   * Dérivé du plus grand rang déjà attribué, et non d'un `count()` : compter
   * faisait reculer la séquence après chaque suppression, et rejouait donc un
   * numéro déjà utilisé.
   */
  /**
   * À quel client rattacher une facture.
   *
   * L'identifiant explicite l'emporte, et il est vérifié : un client d'un autre
   * cabinet passé dans la requête rattacherait la facture hors du cloisonnement.
   * À défaut, l'adresse électronique sert de point d'accroche — le nom, jamais :
   * rattacher une facture au mauvais client est pire que ne pas la rattacher.
   */
  private async resolveClient(
    veterinarianId: number,
    data: { userId?: number; externalClientId?: number; clientEmail?: string }
  ): Promise<{ userId: number | null; externalClientId: number | null }> {
    if (data.userId) {
      const lien = await UserVeterinarian.query()
        .where('veterinarian_id', veterinarianId)
        .where('user_id', data.userId)
        .where('status', 'accepted')
        .first()
      if (lien) return { userId: data.userId, externalClientId: null }
    }

    if (data.externalClientId) {
      const client = await VetExternalClient.query()
        .where('id', data.externalClientId)
        .where('veterinarian_id', veterinarianId)
        .first()
      if (client) return { userId: null, externalClientId: client.id }
    }

    const email = String(data.clientEmail ?? '').trim().toLowerCase()
    if (!email) return { userId: null, externalClientId: null }

    const parUser = await UserVeterinarian.query()
      .where('veterinarian_id', veterinarianId)
      .where('status', 'accepted')
      .whereHas('user', (q) => q.whereRaw('lower(email) = ?', [email]))
      .preload('user')
      .first()
    if (parUser) return { userId: parUser.userId, externalClientId: null }

    const parExterne = await VetExternalClient.query()
      .where('veterinarian_id', veterinarianId)
      .whereRaw('lower(email) = ?', [email])
      .first()
    if (parExterne) return { userId: null, externalClientId: parExterne.id }

    return { userId: null, externalClientId: null }
  }

  private async nextInvoiceNumber(
    veterinarianId: number,
    kind: 'invoice' | 'credit_note' = 'invoice'
  ): Promise<string> {
    const year = DateTime.now().year
    // Deux séquences distinctes : mêler avoirs et factures dans la même suite
    // rendrait illisible la continuité de chacune.
    const prefix = kind === 'credit_note' ? `AV-${year}-` : `FAC-${year}-`

    const existing = await VetInvoice.query()
      .where('veterinarian_id', veterinarianId)
      .whereLike('number', `${prefix}%`)
      .select('number')

    const highest = existing.reduce((max, row) => {
      const rank = Number.parseInt(row.number.slice(prefix.length), 10)
      return Number.isFinite(rank) && rank > max ? rank : max
    }, 0)

    return `${prefix}${String(highest + 1).padStart(3, '0')}`
  }

  async store({ request, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    const data = await request.validateUsing(createInvoiceValidator)

    // Une facture datée d'une période transmise au comptable changerait un mois
    // déjà clos : on refuse avant d'attribuer un numéro, qu'il faudrait sinon
    // laisser trouer la séquence.
    if (isClosed(vet, data.date)) {
      return response.conflict({
        success: false,
        message: `La période ${monthOf(data.date)} est clôturée. Datez cette facture d'une période ouverte.`,
        code: 'PERIOD_CLOSED',
      })
    }

    // Rattachement au client. Fourni par l'écran quand le praticien l'a choisi
    // dans sa liste, retrouvé par l'adresse sinon — jamais par le nom, qu'une
    // homonymie suffirait à faire pointer vers le mauvais compte.
    const lien = await this.resolveClient(vet.id, data)

    const subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

    // Le taux vient du cabinet, et non d'une constante : 20 % est la règle pour
    // les actes vétérinaires, mais un praticien en franchise en base facture
    // sans TVA — la lui facturer serait une erreur, pas une approximation. Le
    // taux retenu est figé sur la facture : un changement de régime ne doit pas
    // réécrire le passé.
    const taxRate = vet.vatExempt ? 0 : Number(vet.vatRate ?? 20)
    const tax = subtotal * (taxRate / 100)
    const total = subtotal + tax

    // Deux créations simultanées peuvent viser le même rang : on retente sur
    // collision plutôt que de renvoyer une erreur 500 au praticien.
    let invoice: VetInvoice | null = null
    let lastError: unknown = null

    for (let attempt = 0; attempt < 5 && !invoice; attempt++) {
      try {
        invoice = await VetInvoice.create({
          veterinarianId: vet.id,
          number: await this.nextInvoiceNumber(vet.id),
          clientName: data.clientName,
          clientEmail: data.clientEmail || null,
          userId: lien.userId,
          externalClientId: lien.externalClientId,
          petName: data.petName || null,
          date: data.date,
          dueDate: data.dueDate,
          subtotal,
          taxRate,
          tax,
          total,
          status: data.status || 'pending',
          notes: data.notes || null,
        })
      } catch (error: any) {
        // 23505 = violation d'unicité côté Postgres. Toute autre erreur remonte.
        if (error?.code !== '23505') throw error
        lastError = error
      }
    }

    if (!invoice) {
      logger.error({ err: lastError }, 'Impossible d’attribuer un numéro de facture')
      return response.conflict({
        success: false,
        message: 'Le numéro de facture n’a pas pu être attribué. Réessayez.',
      })
    }

    // Le journal inaltérable reçoit la pièce. Un brouillon n'y entre pas : il
    // n'est pas encore une pièce, et il est encore modifiable.
    if (invoice.status !== 'draft') {
      await ouvrirSiNecessaire(vet)
      await enregistrer(vet.id, 'invoice', invoice.number, {
        numero: invoice.number,
        date: invoice.date,
        client: invoice.clientName,
        clientId: lien.userId ?? lien.externalClientId ?? null,
        ht: Number(invoice.subtotal),
        tauxTva: Number(invoice.taxRate),
        tva: Number(invoice.tax),
        ttc: Number(invoice.total),
        lignes: data.items.map((i) => ({
          description: i.description,
          quantite: i.quantity,
          prixUnitaire: i.unitPrice,
        })),
      })
    }

    // Les consommations reprises sont marquées facturées, pour qu'elles ne
    // soient pas reproposées sur la facture suivante. Fait après la création :
    // si l'insertion échoue, rien n'a été consommé côté marquage.
    //
    // Les identifiants viennent du client : on ne marque que les mouvements dont
    // l'article appartient à ce praticien. Sans ce cadrage, un compte pouvait
    // marquer « facturées » les consommations d'un confrère, qui ne les aurait
    // alors plus vues remonter sur ses propres factures.
    const requestedIds = (request.input('movementIds') || []) as unknown[]
    const candidateIds = Array.isArray(requestedIds)
      ? requestedIds.map(Number).filter(Number.isFinite)
      : []

    if (candidateIds.length > 0) {
      const owned = await VetInventoryMovement.query()
        .whereIn('id', candidateIds)
        .whereHas('item', (q) => q.where('veterinarian_id', vet.id))
        .select('id')

      if (owned.length > 0) {
        await VetInventoryMovement.query()
          .whereIn('id', owned.map((m) => m.id))
          .update({ billed: true })
      }

      if (owned.length !== candidateIds.length) {
        logger.warn(
          { vetId: vet.id, demandés: candidateIds.length, retenus: owned.length },
          'Mouvements de stock hors périmètre ignorés à la facturation'
        )
      }
    }

    for (const item of data.items) {
      await invoice.related('items').create({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.quantity * item.unitPrice,
      })
    }

    await invoice.load('items')

    return response.created({ success: true, data: invoice })
  }

  async show({ params, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    const invoice = await VetInvoice.query()
      .where('id', params.id)
      .where('veterinarian_id', vet.id)
      .preload('items')
      .first()

    if (!invoice) {
      return response.notFound({ success: false, message: 'Facture non trouvée' })
    }

    const payments = await VetPayment.query().where('invoice_id', invoice.id).orderBy('date', 'asc')

    return response.ok({
      success: true,
      data: {
        ...invoice.serialize(),
        paid: round2(payments.reduce((sum, p) => sum + Number(p.amount), 0)),
        remaining: balanceOf(invoice, payments),
        payments: payments.map((p) => ({
          id: p.id,
          date: p.date?.toISODate() ?? null,
          amount: Number(p.amount),
          method: p.method,
          reference: p.reference,
        })),
      },
    })
  }

  async updateStatus({ params, request, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    const { status } = await request.validateUsing(updateInvoiceStatusValidator)

    const invoice = await VetInvoice.query()
      .where('id', params.id)
      .where('veterinarian_id', vet.id)
      .first()

    if (!invoice) {
      return response.notFound({ success: false, message: 'Facture non trouvée' })
    }

    const payments = await VetPayment.query().where('invoice_id', invoice.id)
    const encaisse = round2(payments.reduce((sum, p) => sum + Number(p.amount), 0))

    // Le statut découle désormais du registre des règlements. Le poser à la
    // main sans encaissement correspondant ferait raconter deux histoires
    // différentes à la facture et au journal de banque — alors c'est le
    // registre qui est complété, pas le statut qui est forcé.
    const resteAEncaisser =
      status === 'paid' && invoice.type !== 'credit_note' ? balanceOf(invoice, payments) : 0

    if (resteAEncaisser > 0.009 && isClosed(vet, DateTime.now().toISODate())) {
      return response.conflict({
        success: false,
        message: 'La période en cours est clôturée : enregistrez le règlement à une date postérieure.',
        code: 'PERIOD_CLOSED',
      })
    }

    // À l'inverse, rouvrir une facture déjà encaissée demande de retirer le
    // règlement : c'est une pièce comptable, pas un drapeau d'affichage.
    if (status !== 'paid' && encaisse > 0.009) {
      return response.conflict({
        success: false,
        message: `Cette facture porte ${encaisse.toFixed(2)} € de règlements. Retirez-les avant de changer son statut.`,
        code: 'PAYMENTS_EXIST',
      })
    }

    // Un brouillon qui passe au statut émis devient une pièce : c'est à cet
    // instant qu'il entre au journal, et pas avant.
    const devientPiece = invoice.status === 'draft' && status !== 'draft'

    invoice.status = status
    invoice.paidAt = status === 'paid' ? (invoice.paidAt ?? DateTime.now()) : null
    await invoice.save()

    await ouvrirSiNecessaire(vet)

    if (devientPiece) {
      await invoice.load('items')
      await enregistrer(vet.id, 'invoice', invoice.number, {
        numero: invoice.number,
        date: invoice.date,
        client: invoice.clientName,
        clientId: invoice.userId ?? invoice.externalClientId ?? null,
        ht: Number(invoice.subtotal),
        tauxTva: Number(invoice.taxRate),
        tva: Number(invoice.tax),
        ttc: Number(invoice.total),
        lignes: invoice.items.map((i) => ({
          description: i.description,
          quantite: Number(i.quantity),
          prixUnitaire: Number(i.unitPrice),
        })),
      })
    }

    // Le règlement vient après la pièce, dans le journal comme dans la réalité :
    // on n'encaisse pas une facture qui n'a pas encore été émise.
    if (resteAEncaisser > 0.009) {
      const reglement = await VetPayment.create({
        invoiceId: invoice.id,
        veterinarianId: vet.id,
        date: DateTime.now(),
        amount: resteAEncaisser,
        method: 'other',
        note: 'Règlement enregistré depuis le statut de la facture',
      })

      await enregistrer(vet.id, 'payment', invoice.number, {
        reglementId: reglement.id,
        facture: invoice.number,
        date: reglement.date?.toISODate() ?? null,
        montant: Number(reglement.amount),
        moyen: reglement.method,
        origine: 'statut de la facture',
      })
    }

    return response.ok({ success: true, data: invoice })
  }

  /**
   * Établit un avoir annulant une facture émise.
   *
   * C'est la seule correction possible : une facture ne se réécrit pas — aucune
   * route ne le permet — et ne se supprime pas. L'avoir reprend les montants de
   * la facture d'origine et porte sa propre numérotation ; la facture annulée
   * change de statut mais reste en place, avec son numéro.
   */
  async createCreditNote({ params, request, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian

    const invoice = await VetInvoice.query()
      .where('id', params.id)
      .where('veterinarian_id', vet.id)
      .preload('items')
      .first()

    if (!invoice) {
      return response.notFound({ success: false, message: 'Facture non trouvée' })
    }

    if (invoice.type !== 'invoice') {
      return response.badRequest({
        success: false,
        message: "Un avoir ne s'annule pas par un autre avoir.",
      })
    }

    // L'annulation se lit à l'existence de l'avoir, et non dans le statut de la
    // facture — qui, lui, dit où en est le règlement.
    const dejaAnnulee = await VetInvoice.query()
      .where('veterinarian_id', vet.id)
      .where('cancels_invoice_id', invoice.id)
      .first()

    if (dejaAnnulee) {
      return response.conflict({
        success: false,
        message: `Cette facture est déjà annulée par l'avoir ${dejaAnnulee.number}.`,
        code: 'ALREADY_CANCELLED',
      })
    }

    if (invoice.status === 'draft') {
      return response.badRequest({
        success: false,
        message: "Un brouillon n'a pas été émis : supprimez-le plutôt que de l'annuler.",
      })
    }

    // L'avoir est daté du jour, non de la facture : il n'a pas à rouvrir le mois
    // où celle-ci a été émise. En revanche, le mois courant doit être ouvert.
    const aujourdhui = DateTime.now().toISODate()!
    if (isClosed(vet, aujourdhui)) {
      return response.conflict({
        success: false,
        message: `La période ${monthOf(aujourdhui)} est clôturée : l'avoir ne peut pas y être enregistré.`,
        code: 'PERIOD_CLOSED',
      })
    }

    const reason = String(request.input('reason') ?? '').trim()

    let creditNote: VetInvoice | null = null
    let lastError: unknown = null

    // Même garde que pour les factures : deux créations simultanées peuvent
    // viser le même rang, on retente plutôt que de renvoyer une erreur brute.
    for (let attempt = 0; attempt < 5 && !creditNote; attempt++) {
      try {
        creditNote = await VetInvoice.create({
          veterinarianId: vet.id,
          number: await this.nextInvoiceNumber(vet.id, 'credit_note'),
          type: 'credit_note',
          cancelsInvoiceId: invoice.id,
          creditReason: reason || null,
          clientName: invoice.clientName,
          clientEmail: invoice.clientEmail,
          // Même compte auxiliaire que la facture : sans cela l'annulation
          // n'apparaîtrait pas sur le compte du client qu'elle concerne.
          userId: invoice.userId,
          externalClientId: invoice.externalClientId,
          petName: invoice.petName,
          date: DateTime.now().toISODate()!,
          dueDate: DateTime.now().toISODate()!,
          // Les montants sont repris tels quels : un avoir se lit comme la
          // facture qu'il annule, et c'est la comptabilité qui les soustrait.
          subtotal: invoice.subtotal,
          taxRate: invoice.taxRate,
          tax: invoice.tax,
          total: invoice.total,
          // L'avoir hérite du statut de règlement de la facture. Les deux
          // pièces tombent ainsi dans le même compteur, où elles s'annulent :
          // une facture encaissée puis remboursée pèse zéro, une facture en
          // attente puis annulée aussi.
          status: invoice.status,
          notes: `Avoir sur facture ${invoice.number}`,
        })
      } catch (error) {
        lastError = error
        if ((error as { code?: string })?.code !== '23505') throw error
      }
    }

    if (!creditNote) throw lastError

    // Les lignes sont recopiées : l'avoir doit pouvoir être relu seul, sans
    // dépendre de la facture d'origine.
    for (const item of invoice.items) {
      await creditNote.related('items').create({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
      })
    }

    // Le statut de la facture n'est pas touché : il dit où en est le
    // règlement, pas si la pièce a été annulée. L'annulation se lit à
    // l'existence de l'avoir qui la vise — et c'est cette existence qui la
    // neutralise dans les compteurs.

    await creditNote.load('items')

    // L'annulation est elle aussi un événement : c'est la seule trace qu'une
    // facture a été neutralisée, et elle doit être aussi inaltérable que la
    // facture qu'elle vise.
    await ouvrirSiNecessaire(vet)
    await enregistrer(vet.id, 'credit_note', creditNote.number, {
      numero: creditNote.number,
      date: creditNote.date,
      annuleLaFacture: invoice.number,
      motif: reason || null,
      client: creditNote.clientName,
      ht: Number(creditNote.subtotal),
      tauxTva: Number(creditNote.taxRate),
      tva: Number(creditNote.tax),
      ttc: Number(creditNote.total),
    })

    return response.created({
      success: true,
      message: `Avoir ${creditNote.number} établi. La facture ${invoice.number} est annulée.`,
      data: creditNote,
    })
  }

  async destroy({ params, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    const invoice = await VetInvoice.query()
      .where('id', params.id)
      .where('veterinarian_id', vet.id)
      .first()

    if (!invoice) {
      return response.notFound({ success: false, message: 'Facture non trouvée' })
    }

    /**
     * Seul un brouillon s'efface.
     *
     * Une facture émise ne se supprime pas : elle s'annule par un avoir. La
     * supprimer laisserait un trou dans la séquence — ce qu'un contrôle
     * regarde en premier — et ferait disparaître une pièce que le client
     * détient peut-être déjà.
     */
    if (invoice.status !== 'draft') {
      return response.conflict({
        success: false,
        message:
          "Une facture émise ne se supprime pas. Établissez un avoir pour l'annuler.",
        code: 'INVOICE_ISSUED',
      })
    }

    await invoice.delete()
    return response.ok({ success: true, message: 'Brouillon supprimé' })
  }
}
