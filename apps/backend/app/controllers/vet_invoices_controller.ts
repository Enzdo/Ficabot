import type { HttpContext } from '@adonisjs/core/http'
import VetInvoice from '#models/vet_invoice'
import Veterinarian from '#models/veterinarian'
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

    const paidInvoices = invoices.filter(i => i.status === 'paid')
    // Mêmes règles que la liste, pour que les compteurs correspondent à ce que
    // les onglets affichent : en retard = en attente et échéance dépassée.
    const overdueInvoices = invoices.filter(
      i => i.status === 'pending' && String(i.dueDate ?? '') < today
    )
    const pendingInvoices = invoices.filter(
      i => i.status === 'pending' && String(i.dueDate ?? '') >= today
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
        paid: sum(paidInvoices),
        paidCount: paidInvoices.filter(vivante).length,
        pending: sum(pendingInvoices),
        pendingCount: pendingInvoices.filter(vivante).length,
        overdue: sum(overdueInvoices),
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

    return response.ok({ success: true, data: invoice })
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

    invoice.status = status
    if (status === 'paid') {
      invoice.paidAt = DateTime.now()
    }
    await invoice.save()

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
