import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { registerValidator, loginValidator } from '#validators/auth'

export default class AuthController {
  async register({ request, response }: HttpContext) {
    const data = await request.validateUsing(registerValidator)

    const existingUser = await User.findBy('email', data.email)
    if (existingUser) {
      return response.conflict({
        success: false,
        message: 'Cet email est déjà utilisé',
      })
    }

    const user = await User.create(data)
    const token = await User.accessTokens.create(user)

    return response.created({
      success: true,
      data: {
        user: { id: user.id, email: user.email },
        token: { token: token.value!.release(), type: 'bearer' },
      },
    })
  }

  async login({ request, response }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)

    const user = await User.verifyCredentials(email, password)
    const token = await User.accessTokens.create(user)

    return response.ok({
      success: true,
      data: {
        user: { id: user.id, email: user.email },
        token: { token: token.value!.release(), type: 'bearer' },
      },
    })
  }

  async me({ auth, response }: HttpContext) {
    const user = auth.user!
    return response.ok({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
        phone: user.phone,
        createdAt: user.createdAt,
      },
    })
  }

  async updateProfile({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const data = request.only(['firstName', 'lastName', 'phone', 'avatarUrl'])

    if (data.firstName !== undefined) user.firstName = data.firstName
    if (data.lastName !== undefined) user.lastName = data.lastName
    if (data.phone !== undefined) user.phone = data.phone
    if (data.avatarUrl !== undefined) user.avatarUrl = data.avatarUrl

    await user.save()

    return response.ok({
      success: true,
      message: 'Profil mis à jour',
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
        phone: user.phone,
      },
    })
  }

  async updateEmail({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const { email, password } = request.only(['email', 'password'])

    // Verify current password
    try {
      await User.verifyCredentials(user.email, password)
    } catch {
      return response.unauthorized({
        success: false,
        message: 'Mot de passe incorrect',
      })
    }

    // Check if email is already taken
    const existingUser = await User.findBy('email', email)
    if (existingUser && existingUser.id !== user.id) {
      return response.conflict({
        success: false,
        message: 'Cet email est déjà utilisé',
      })
    }

    user.email = email
    await user.save()

    return response.ok({
      success: true,
      message: 'Email mis à jour',
      data: { email: user.email },
    })
  }

  async updatePassword({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const { currentPassword, newPassword } = request.only(['currentPassword', 'newPassword'])

    // Verify current password
    try {
      await User.verifyCredentials(user.email, currentPassword)
    } catch {
      return response.unauthorized({
        success: false,
        message: 'Mot de passe actuel incorrect',
      })
    }

    user.password = newPassword
    await user.save()

    return response.ok({
      success: true,
      message: 'Mot de passe mis à jour',
    })
  }

  async logout({ auth, response }: HttpContext) {
    const user = auth.user!
    await User.accessTokens.delete(user, user.currentAccessToken.identifier)

    return response.ok({
      success: true,
      message: 'Déconnexion réussie',
    })
  }
}
