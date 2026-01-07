import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { registerValidator, loginValidator } from '#validators/auth'
import logger from '@adonisjs/core/services/logger'
import hash from '@adonisjs/core/services/hash'

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
    try {
      logger.info('Login attempt - Raw request body: ' + JSON.stringify(request.body()))
      
      const { email, password } = await request.validateUsing(loginValidator)
      logger.info('Login validation passed for email: ' + email)

      // Manual verification to bypass verifyCredentials issue
      const user = await User.findBy('email', email)
      logger.info('User found: ' + (user ? user.id : 'null'))
      
      if (!user) {
        logger.error('User not found for email: ' + email)
        return response.badRequest({
          success: false,
          message: 'Email ou mot de passe incorrect',
        })
      }

      // Verify password - try bcrypt first since most existing passwords use it
      let isValid = false
      
      try {
        isValid = await hash.use('bcrypt').verify(user.password, password)
        logger.info('Bcrypt verification result: ' + isValid)
      } catch (bcryptError) {
        logger.info('Bcrypt verification failed: ' + bcryptError.message)
      }
      
      // If bcrypt fails, try scrypt
      if (!isValid) {
        try {
          isValid = await hash.use('scrypt').verify(user.password, password)
          logger.info('Scrypt verification result: ' + isValid)
        } catch (scryptError) {
          logger.info('Scrypt verification failed: ' + scryptError.message)
        }
      }
      
      logger.info('Final verification result: ' + isValid)
      
      if (!isValid) {
        logger.error('Invalid password for user: ' + user.id)
        return response.badRequest({
          success: false,
          message: 'Email ou mot de passe incorrect',
        })
      }

      logger.info('User verified successfully: ' + user.id)
      
      const token = await User.accessTokens.create(user)
      logger.info('Token created successfully')

      return response.ok({
        success: true,
        data: {
          user: { id: user.id, email: user.email },
          token: { token: token.value!.release(), type: 'bearer' },
        },
      })
    } catch (error) {
      logger.error('Login error: ' + JSON.stringify(error, null, 2))
      
      if (error.messages) {
        return response.badRequest({
          success: false,
          message: 'Validation failed',
          errors: error.messages,
        })
      }
      
      return response.badRequest({
        success: false,
        message: 'Email ou mot de passe incorrect',
      })
    }
  }

  async me({ auth, response }: HttpContext) {
    const user = auth.user as User
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
        language: user.language,
      },
    })
  }

  async updateProfile({ auth, request, response }: HttpContext) {
    const user = auth.user as User
    const data = request.only(['firstName', 'lastName', 'phone', 'avatarUrl', 'language'])

    if (data.firstName !== undefined) user.firstName = data.firstName
    if (data.lastName !== undefined) user.lastName = data.lastName
    if (data.phone !== undefined) user.phone = data.phone
    if (data.avatarUrl !== undefined) user.avatarUrl = data.avatarUrl
    if (data.language !== undefined) user.language = data.language

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
        language: user.language,
      },
    })
  }

  async updateEmail({ auth, request, response }: HttpContext) {
    const user = auth.user as User
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
    const user = auth.user as User
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
    const user = auth.user as User
    await User.accessTokens.delete(user, auth.user!.currentAccessToken.identifier)

    return response.ok({
      success: true,
      message: 'Déconnexion réussie',
    })
  }
}
