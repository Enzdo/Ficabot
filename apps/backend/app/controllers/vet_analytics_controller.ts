import type { HttpContext } from '@adonisjs/core/http'
import Veterinarian from '#models/veterinarian'
// Même table que VetAppointment, mais ClinicAppointment déclare les colonnes
// vétérinaires (type, status, employee_id). Avec l'autre modèle, `apt.type`
// valait undefined et le graphique « Répartition par type » affichait une barre
// unique libellée « undefined » à 100 %.
import ClinicAppointment from '#models/clinic_appointment'
import UserVeterinarian from '#models/user_veterinarian'
import VetEmployee from '#models/vet_employee'
import VetInvoice from '#models/vet_invoice'
import { DateTime } from 'luxon'
import logger from '@adonisjs/core/services/logger'

export default class VetAnalyticsController {
  async index({ request, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    const period = request.input('period', 'month')

    const now = DateTime.now()
    let startDate: DateTime
    let prevStartDate: DateTime
    let prevEndDate: DateTime

    switch (period) {
      case 'week':
        startDate = now.startOf('week')
        prevStartDate = startDate.minus({ weeks: 1 })
        prevEndDate = startDate
        break
      case 'quarter':
        startDate = now.startOf('quarter')
        prevStartDate = startDate.minus({ quarters: 1 })
        prevEndDate = startDate
        break
      case 'year':
        startDate = now.startOf('year')
        prevStartDate = startDate.minus({ years: 1 })
        prevEndDate = startDate
        break
      default:
        startDate = now.startOf('month')
        prevStartDate = startDate.minus({ months: 1 })
        prevEndDate = startDate
    }

    // Current period appointments
    const appointments = await ClinicAppointment.query()
      .where('veterinarian_id', vet.id)
      .where('date', '>=', startDate.toFormat('yyyy-MM-dd'))

    // Previous period appointments
    const prevAppointments = await ClinicAppointment.query()
      .where('veterinarian_id', vet.id)
      .where('date', '>=', prevStartDate.toFormat('yyyy-MM-dd'))
      .where('date', '<', prevEndDate.toFormat('yyyy-MM-dd'))

    // Clients
    const clients = await UserVeterinarian.query()
      .where('veterinarian_id', vet.id)
      .where('status', 'accepted')

    const newClients = await UserVeterinarian.query()
      .where('veterinarian_id', vet.id)
      .where('status', 'accepted')
      .where('created_at', '>=', startDate.toSQL()!)

    // Appointment types
    const typeMap: Record<string, number> = {}
    for (const apt of appointments) {
      typeMap[apt.type] = (typeMap[apt.type] || 0) + 1
    }
    const totalApts = appointments.length || 1
    const typeLabels: Record<string, string> = {
      consultation: 'Consultation',
      vaccination: 'Vaccination',
      surgery: 'Chirurgie',
      emergency: 'Urgence',
      checkup: 'Bilan',
      grooming: 'Toilettage',
      followup: 'Suivi',
      other: 'Autre',
    }
    const typeColors: Record<string, string> = {
      consultation: '#0d9488',
      vaccination: '#8b5cf6',
      surgery: '#f59e0b',
      emergency: '#ef4444',
      checkup: '#3b82f6',
      grooming: '#ec4899',
      followup: '#06b6d4',
      other: '#6b7280',
    }
    const appointmentTypes = Object.entries(typeMap)
      .map(([type, count]) => ({
        name: typeLabels[type] || type,
        count,
        percentage: Math.round((count / totalApts) * 100),
        color: typeColors[type] || '#6b7280',
      }))
      .sort((a, b) => b.count - a.count)

    // Revenue from invoices
    let revenue = 0
    let prevRevenue = 0
    try {
      const invoices = await VetInvoice.query()
        .where('veterinarian_id', vet.id)
        .where('status', 'paid')
        .where('date', '>=', startDate.toFormat('yyyy-MM-dd'))
      revenue = invoices.reduce((sum, inv) => sum + Number(inv.total), 0)

      const prevInvoices = await VetInvoice.query()
        .where('veterinarian_id', vet.id)
        .where('status', 'paid')
        .where('date', '>=', prevStartDate.toFormat('yyyy-MM-dd'))
        .where('date', '<', prevEndDate.toFormat('yyyy-MM-dd'))
      prevRevenue = prevInvoices.reduce((sum, inv) => sum + Number(inv.total), 0)
    } catch (error) {
      // Le catch muet d'origine faisait passer un chiffre d'affaires réel pour
      // zéro sans le moindre indice. La table existe désormais : si la requête
      // échoue, c'est un incident, et il doit laisser une trace.
      logger.error({ err: error, vetId: vet.id }, 'Lecture du chiffre d’affaires impossible')
    }

    // Employee stats
    const employees = await VetEmployee.query()
      .where('veterinarian_id', vet.id)
      .where('is_active', true)

    const employeeStats = await Promise.all(
      employees.map(async (emp) => {
        const empApts = await ClinicAppointment.query()
          .where('employee_id', emp.id)
          .where('date', '>=', startDate.toFormat('yyyy-MM-dd'))

        const completed = empApts.filter(a => a.status === 'completed').length
        const total = empApts.length || 1

        return {
          id: emp.id,
          name: `${emp.firstName} ${emp.lastName}`,
          initials: `${emp.firstName[0]}${emp.lastName[0]}`,
          role: emp.role === 'vet' ? 'Vétérinaire' : emp.role === 'assistant' ? 'Assistant(e)' : emp.role,
          color: emp.color || '#0d9488',
          appointments: empApts.length,
          completionRate: Math.round((completed / total) * 100),
          // `rating` valait 4.5 + Math.random() * 0.5 et changeait à chaque
          // rechargement ; `revenue` était figé à zéro. Aucune note n'est
          // recueillie nulle part, et rien ne relie une facture à un employé.
          // Les deux colonnes sont retirées plutôt qu'inventées.
        }
      })
    )

    // Une comparaison n'a de sens que si la période précédente porte quelque
    // chose. Le `|| 1` d'origine transformait « 0 rendez-vous le mois dernier,
    // 40 ce mois-ci » en « +3900 % ». `null` dit « pas de comparaison possible »
    // et l'écran affiche un tiret.
    const appointmentsTrend =
      prevAppointments.length > 0
        ? Math.round(((appointments.length - prevAppointments.length) / prevAppointments.length) * 100)
        : null
    const revenueTrend =
      prevRevenue > 0 ? Math.round(((revenue - prevRevenue) / prevRevenue) * 100) : null

    return response.ok({
      success: true,
      data: {
        totalAppointments: appointments.length,
        appointmentsTrend,
        totalClients: clients.length,
        newClients: newClients.length,
        revenue,
        revenueTrend,
        appointmentTypes,
        employeeStats,
      },
    })
  }
}
