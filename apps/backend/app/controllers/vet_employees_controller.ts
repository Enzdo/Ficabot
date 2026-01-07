import type { HttpContext } from '@adonisjs/core/http'
import VetEmployee from '#models/vet_employee'
import Veterinarian from '#models/veterinarian'

export default class VetEmployeesController {
  /**
   * List all employees for the authenticated veterinarian
   */
  async index({ response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian

    const employees = await VetEmployee.query()
      .where('veterinarian_id', vet.id)
      .orderBy('first_name', 'asc')

    return response.ok({
      success: true,
      data: employees,
    })
  }

  /**
   * Create a new employee
   */
  async store({ request, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    const data = request.only([
      'firstName',
      'lastName',
      'email',
      'phone',
      'role',
      'specializations',
      'workingHours',
      'color',
    ])

    const employee = await VetEmployee.create({
      ...data,
      veterinarianId: vet.id,
      isActive: true,
    })

    return response.created({
      success: true,
      data: employee,
    })
  }

  /**
   * Get a single employee
   */
  async show({ params, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian

    const employee = await VetEmployee.query()
      .where('id', params.id)
      .where('veterinarian_id', vet.id)
      .first()

    if (!employee) {
      return response.notFound({
        success: false,
        message: 'Employé non trouvé',
      })
    }

    return response.ok({
      success: true,
      data: employee,
    })
  }

  /**
   * Update an employee
   */
  async update({ params, request, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian

    const employee = await VetEmployee.query()
      .where('id', params.id)
      .where('veterinarian_id', vet.id)
      .first()

    if (!employee) {
      return response.notFound({
        success: false,
        message: 'Employé non trouvé',
      })
    }

    const data = request.only([
      'firstName',
      'lastName',
      'email',
      'phone',
      'role',
      'specializations',
      'workingHours',
      'color',
      'isActive',
    ])

    employee.merge(data)
    await employee.save()

    return response.ok({
      success: true,
      data: employee,
    })
  }

  /**
   * Delete an employee
   */
  async destroy({ params, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian

    const employee = await VetEmployee.query()
      .where('id', params.id)
      .where('veterinarian_id', vet.id)
      .first()

    if (!employee) {
      return response.notFound({
        success: false,
        message: 'Employé non trouvé',
      })
    }

    await employee.delete()

    return response.ok({
      success: true,
      message: 'Employé supprimé',
    })
  }
}
