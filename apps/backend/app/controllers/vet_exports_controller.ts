import type { HttpContext } from '@adonisjs/core/http'
import Veterinarian from '#models/veterinarian'
import VetInventoryItem from '#models/vet_inventory_item'
import VetReminder from '#models/vet_reminder'
import db from '@adonisjs/lucid/services/db'

export default class VetExportsController {
  async clients({ response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian

    const clients = await db.rawQuery(
      `SELECT DISTINCT u.id, u.first_name, u.last_name, u.email, u.phone
       FROM users u
       INNER JOIN pets p ON p.user_id = u.id
       INNER JOIN vet_accesses va ON va.pet_id = p.id
       WHERE va.veterinarian_id = ?
       ORDER BY u.last_name ASC`,
      [vet.id]
    )

    const rows = clients.rows || clients
    let csv = 'Nom,Prénom,Email,Téléphone\n'
    for (const c of rows) {
      csv += `"${c.last_name || ''}","${c.first_name || ''}","${c.email || ''}","${c.phone || ''}"\n`
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
