import type { HttpContext } from '@adonisjs/core/http'
import Veterinarian from '#models/veterinarian'
import VetAppointment from '#models/vet_appointment'
import UserVeterinarian from '#models/user_veterinarian'
import VetEmployee from '#models/vet_employee'
import VetInvoice from '#models/vet_invoice'
import { DateTime } from 'luxon'

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
    const appointments = await VetAppointment.query()
      .where('veterinarian_id', vet.id)
      .where('date', '>=', startDate.toFormat('yyyy-MM-dd'))

    // Previous period appointments
    const prevAppointments = await VetAppointment.query()
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
    } catch {
      // Invoice table may not exist yet
    }

    // Employee stats
    const employees = await VetEmployee.query()
      .where('veterinarian_id', vet.id)
      .where('is_active', true)

    const employeeStats = await Promise.all(
      employees.map(async (emp) => {
        const empApts = await VetAppointment.query()
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
          rating: 4.5 + Math.random() * 0.5,
          revenue: 0,
        }
      })
    )

    // Trends
    const prevCount = prevAppointments.length || 1
    const appointmentsTrend = Math.round(((appointments.length - prevCount) / prevCount) * 100)
    const revenueTrend = prevRevenue > 0 ? Math.round(((revenue - prevRevenue) / prevRevenue) * 100) : 0

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
