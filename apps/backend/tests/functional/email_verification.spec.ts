import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import { DateTime } from 'luxon'
import { randomBytes } from 'node:crypto'

test.group('Email Verification', (group) => {
  group.each.setup(async () => {
    await testUtils.db().truncate()
  })

  test('should verify email with valid token', async ({ client, assert }) => {
    const verificationToken = randomBytes(32).toString('hex')

    const user = await User.create({
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      language: 'fr',
      emailVerified: false,
      verificationToken,
      verificationTokenExpiresAt: DateTime.now().plus({ hours: 24 }),
    })

    const response = await client.get(`/auth/verify-email/${verificationToken}`)

    response.assertStatus(200)
    response.assertBodyContains({
      success: true,
      message: 'Email vérifié avec succès !',
    })

    // Verify user was updated
    await user.refresh()
    assert.isTrue(user.emailVerified)
    assert.exists(user.emailVerifiedAt)
    assert.isNull(user.verificationToken)
    assert.isNull(user.verificationTokenExpiresAt)
  })

  test('should fail verification with invalid token', async ({ client }) => {
    const response = await client.get('/auth/verify-email/invalid-token-123')

    response.assertStatus(400)
    response.assertBodyContains({
      success: false,
      message: 'Token de vérification invalide ou expiré',
    })
  })

  test('should fail verification with expired token', async ({ client }) => {
    const verificationToken = randomBytes(32).toString('hex')

    await User.create({
      email: 'expired@example.com',
      password: 'password123',
      language: 'fr',
      emailVerified: false,
      verificationToken,
      verificationTokenExpiresAt: DateTime.now().minus({ hours: 1 }), // Expired 1 hour ago
    })

    const response = await client.get(`/auth/verify-email/${verificationToken}`)

    response.assertStatus(400)
    response.assertBodyContains({
      success: false,
      message: 'Ce lien de vérification a expiré. Veuillez demander un nouveau lien.',
      code: 'TOKEN_EXPIRED',
    })
  })

  test('should not verify already verified email', async ({ client }) => {
    const verificationToken = randomBytes(32).toString('hex')

    await User.create({
      email: 'verified@example.com',
      password: 'password123',
      language: 'fr',
      emailVerified: true, // Already verified
      verificationToken,
      verificationTokenExpiresAt: DateTime.now().plus({ hours: 24 }),
    })

    const response = await client.get(`/auth/verify-email/${verificationToken}`)

    response.assertStatus(400)
    response.assertBodyContains({
      success: false,
    })
  })

  test('should resend verification email for unverified user', async ({ client, assert }) => {
    const user = await User.create({
      email: 'resend@example.com',
      password: 'password123',
      language: 'fr',
      emailVerified: false,
      verificationToken: randomBytes(32).toString('hex'),
      verificationTokenExpiresAt: DateTime.now().plus({ hours: 24 }),
    })

    const token = await User.accessTokens.create(user)
    const authToken = token.value!.release()

    const oldToken = user.verificationToken

    const response = await client
      .post('/auth/resend-verification')
      .header('Authorization', `Bearer ${authToken}`)

    response.assertStatus(200)
    response.assertBodyContains({
      success: true,
      message: 'Email de vérification renvoyé. Vérifiez votre boîte de réception.',
    })

    // Verify new token was generated
    await user.refresh()
    assert.notEqual(user.verificationToken, oldToken)
    assert.exists(user.verificationToken)
    assert.exists(user.verificationTokenExpiresAt)
  })

  test('should not resend verification for already verified user', async ({ client }) => {
    const user = await User.create({
      email: 'already-verified@example.com',
      password: 'password123',
      language: 'fr',
      emailVerified: true, // Already verified
    })

    const token = await User.accessTokens.create(user)
    const authToken = token.value!.release()

    const response = await client
      .post('/auth/resend-verification')
      .header('Authorization', `Bearer ${authToken}`)

    response.assertStatus(400)
    response.assertBodyContains({
      success: false,
      message: 'Votre email est déjà vérifié',
    })
  })

  test('should require authentication for resend verification', async ({ client }) => {
    const response = await client.post('/auth/resend-verification')

    response.assertStatus(401)
  })

  test('should create new user with emailVerified as false', async ({ client, assert }) => {
    const response = await client.post('/auth/register').json({
      email: 'newuser@example.com',
      password: 'password123',
      firstName: 'New',
      lastName: 'User',
      language: 'fr',
    })

    response.assertStatus(201)
    response.assertBodyContains({
      success: true,
    })

    const { data } = response.body()
    assert.isFalse(data.user.emailVerified)

    // Verify in database
    const user = await User.findByOrFail('email', 'newuser@example.com')
    assert.isFalse(user.emailVerified)
    assert.exists(user.verificationToken)
    assert.exists(user.verificationTokenExpiresAt)
  })
})
