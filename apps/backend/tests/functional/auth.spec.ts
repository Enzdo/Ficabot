import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('Auth - Register', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('should register a new user successfully', async ({ client, assert }) => {
    const response = await client.post('/auth/register').json({
      email: 'test@example.com',
      password: 'password123',
    })

    response.assertStatus(201)
    response.assertBodyContains({
      success: true,
    })
    assert.exists(response.body().data.token)
    assert.exists(response.body().data.user)
    assert.equal(response.body().data.user.email, 'test@example.com')
  })

  test('should not register with existing email', async ({ client, assert }) => {
    // First registration
    await client.post('/auth/register').json({
      email: 'duplicate@example.com',
      password: 'password123',
    })

    // Second registration with same email
    const response = await client.post('/auth/register').json({
      email: 'duplicate@example.com',
      password: 'password456',
    })

    response.assertStatus(409)
    assert.equal(response.body().success, false)
  })

  test('should validate email format', async ({ client, assert }) => {
    const response = await client.post('/auth/register').json({
      email: 'invalid-email',
      password: 'password123',
    })

    response.assertStatus(400)
    assert.equal(response.body().success, false)
  })

  test('should validate password length', async ({ client, assert }) => {
    const response = await client.post('/auth/register').json({
      email: 'test@example.com',
      password: '123', // Too short
    })

    response.assertStatus(400)
    assert.equal(response.body().success, false)
  })
})

test.group('Auth - Login', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('should login with correct credentials', async ({ client, assert }) => {
    // Register user
    await client.post('/auth/register').json({
      email: 'login@example.com',
      password: 'password123',
    })

    // Login
    const response = await client.post('/auth/login').json({
      email: 'login@example.com',
      password: 'password123',
    })

    response.assertStatus(200)
    assert.equal(response.body().success, true)
    assert.exists(response.body().data.token)
  })

  test('should not login with wrong password', async ({ client, assert }) => {
    // Register user
    await client.post('/auth/register').json({
      email: 'secure@example.com',
      password: 'correct-password',
    })

    // Try login with wrong password
    const response = await client.post('/auth/login').json({
      email: 'secure@example.com',
      password: 'wrong-password',
    })

    response.assertStatus(401)
    assert.equal(response.body().success, false)
  })

  test('should not login with non-existent email', async ({ client, assert }) => {
    const response = await client.post('/auth/login').json({
      email: 'nonexistent@example.com',
      password: 'password123',
    })

    response.assertStatus(401)
    assert.equal(response.body().success, false)
  })
})

test.group('Auth - Profile', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('should get user profile with valid token', async ({ client, assert }) => {
    // Register and get token
    const registerResponse = await client.post('/auth/register').json({
      email: 'profile@example.com',
      password: 'password123',
    })
    const token = registerResponse.body().data.token.token

    // Get profile
    const response = await client
      .get('/auth/me')
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    assert.equal(response.body().success, true)
    assert.equal(response.body().data.email, 'profile@example.com')
  })

  test('should not get profile without token', async ({ client, assert }) => {
    const response = await client.get('/auth/me')

    response.assertStatus(401)
  })
})
