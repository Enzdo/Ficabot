import type { HttpContext } from '@adonisjs/core/http'
import Veterinarian from '#models/veterinarian'
import VetInventoryItem from '#models/vet_inventory_item'
import VetReminder from '#models/vet_reminder'
import UserVeterinarian from '#models/user_veterinarian'
import VetExternalClient from '#models/vet_external_client'
import db from '@adonisjs/lucid/services/db'

/**
 * Échappe une valeur pour le CSV. Les colonnes étaient simplement entourées de
 * guillemets : un nom contenant lui-même un guillemet, ou une note contenant un
 * retour à la ligne, cassait le fichier à partir de cette ligne.
 */
function csvCell(value: unknown): string {
  return `"${String(value ?? '').replace(/"/g, '""')}"`
}

export default class VetExportsController {
  /**
   * Export des clients.
   *
   * La requête d'origine joignait une table `vet_accesses` qui n'existe pas —
   * aucune migration ne la crée, seule `vet_access_tokens` existe et c'est la
   * table des jetons d'authentification. L'export partait donc en erreur SQL à
   * chaque appel, et la page, qui ne vérifiait pas le statut HTTP, téléchargeait
   * le corps de l'erreur sous le nom `clients-<date>.csv`.
   *
   * On lit désormais les deux mêmes sources que la page Clients : les comptes
   * liés par `user_veterinarians` accepté, et les clients externes.
   */
  async clients({ response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian

    const links = await UserVeterinarian.query()
      .where('veterinarian_id', vet.id)
      .where('status', 'accepted')
      .preload('user')

    const external = await VetExternalClient.query()
      .where('veterinarian_id', vet.id)
      .orderBy('last_name', 'asc')

    const rows = [
      ...links.map((link) => ({
        lastName: link.user?.lastName,
        firstName: link.user?.firstName,
        email: link.user?.email,
        phone: link.user?.phone,
        type: 'Compte lié',
      })),
      ...external.map((client) => ({
        lastName: client.lastName,
        firstName: client.firstName,
        email: client.email,
        phone: client.phone,
        type: client.inviteSentAt ? 'Invitation envoyée' : 'Client externe',
      })),
    ].sort((a, b) => String(a.lastName || '').localeCompare(String(b.lastName || ''), 'fr'))

    let csv = 'Nom,Prénom,Email,Téléphone,Type\n'
    for (const row of rows) {
      csv += [row.lastName, row.firstName, row.email, row.phone, row.type].map(csvCell).join(',') + '\n'
    }

    response.header('Content-Type', 'text/csv; charset=utf-8')
    response.header('Content-Disposition', 'attachment; filename="clients.csv"')
    return response.send(csv)
  }

  async invoices({ response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian

    const invoices = await db.rawQuery(
      `SELECT number, client_name, date, due_date, subtotal, tax, total, status
       FROM vet_invoices
       WHERE veterinarian_id = ?
       ORDER BY date DESC`,
      [vet.id]
    )

    const rows = invoices.rows || invoices
    let csv = 'Numéro,Client,Date,Échéance,Sous-total,TVA,Total,Statut\n'
    for (const i of rows) {
      csv += `"${i.number}","${i.client_name}","${i.date}","${i.due_date}",${i.subtotal},${i.tax},${i.total},"${i.status}"\n`
    }

    response.header('Content-Type', 'text/csv; charset=utf-8')
    response.header('Content-Disposition', 'attachment; filename="factures.csv"')
    return response.send(csv)
  }

  async inventory({ response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian

    const items = await VetInventoryItem.query()
      .where('veterinarian_id', vet.id)
      .where('is_active', true)
      .orderBy('name', 'asc')

    let csv = 'Nom,Catégorie,Quantité,Unité,Stock min,Prix,Fournisseur,Expiration\n'
    for (const i of items) {
      csv += `"${i.name}","${i.category}",${i.quantity},"${i.unit}",${i.minStock},${i.price},"${i.supplier || ''}","${i.expiryDate || ''}"\n`
    }

    response.header('Content-Type', 'text/csv; charset=utf-8')
    response.header('Content-Disposition', 'attachment; filename="inventaire.csv"')
    return response.send(csv)
  }

  async reminders({ response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian

    const reminders = await VetReminder.query()
      .where('veterinarian_id', vet.id)
      .orderBy('due_date', 'asc')

    let csv = 'Titre,Type,Animal,Client,Date échéance,Statut\n'
    for (const r of reminders) {
      csv += `"${r.title}","${r.type}","${r.petName || ''}","${r.clientName || ''}","${r.dueDate}","${r.status}"\n`
    }

    response.header('Content-Type', 'text/csv; charset=utf-8')
    response.header('Content-Disposition', 'attachment; filename="rappels.csv"')
    return response.send(csv)
  }
}
