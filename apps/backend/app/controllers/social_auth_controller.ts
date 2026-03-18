import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import env from '#start/env'
import logger from '@adonisjs/core/services/logger'

export default class SocialAuthController {
  /**
   * Redirect user to Google OAuth
   * GET /auth/google
   */
  async redirectToGoogle({ ally, response }: HttpContext) {
    try {
      return ally.use('google').redirect()
    } catch (error) {
      logger.error('[GoogleAuth] Redirect error:', error)
      return response.internalServerError({ success: false, message: error.message })
    }
  }

  /**
   * Handle Google OAuth callback
   * GET /auth/google/callback
   */
  async handleGoogleCallback({ ally, response }: HttpContext) {
    const google = ally.use('google')
    const frontendUrl = env.get('FRONTEND_URL', 'http://localhost:3000')

    if (google.accessDenied()) {
      return response.redirect(`${frontendUrl}/login?error=access_denied`)
    }

    if (google.stateMisMatch()) {
      return response.redirect(`${frontendUrl}/login?error=state_mismatch`)
    }

    if (google.hasError()) {
      return response.redirect(`${frontendUrl}/login?error=oauth_error`)
    }

    try {
      const googleUser = await google.user()

      if (!googleUser.email) {
        return response.redirect(`${frontendUrl}/login?error=no_email`)
      }

      // Find existing user by google_id or email
      let user = await User.query()
        .where('googleId', googleUser.id)
        .orWhere('email', googleUser.email)
        .first()

      if (user) {
        // Update google_id and avatar if not set
        if (!user.googleId) user.googleId = googleUser.id
        if (!user.avatarUrl && googleUser.avatarUrl) user.avatarUrl = googleUser.avatarUrl
        if (!user.emailVerified) {
          user.emailVerified = true
        }
        await user.save()
      } else {
        // Create new user
        user = await User.create({
          email: googleUser.email,
          googleId: googleUser.id,
          firstName: googleUser.name?.split(' ')[0] || null,
          lastName: googleUser.name?.split(' ').slice(1).join(' ') || null,
          avatarUrl: googleUser.avatarUrl || null,
          emailVerified: true,
          language: 'fr',
        })
      }

      const token = await User.accessTokens.create(user)

      logger.info(`[GoogleAuth] User ${user.email} authenticated via Google`)

      // Redirect to frontend with token
      const tokenValue = token.value!.release()
      return response.redirect(
        `${frontendUrl}/auth/callback?token=${tokenValue}&userId=${user.id}`
      )
    } catch (error) {
      logger.error('[GoogleAuth] Callback error:', error)
      return response.redirect(`${frontendUrl}/login?error=server_error`)
    }
  }
}
