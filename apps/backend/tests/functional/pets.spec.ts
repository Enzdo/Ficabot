import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import Pet from '#models/pet'

test.group('Pets Controller', (group) => {
  let user: User
  let authToken: string

  group.each.setup(async () => {
    await testUtils.db().truncate()
  })

  group.setup(async () => {
    // Create a test user
    user = await User.create({
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      language: 'fr',
      emailVerified: true,
    })

    const token = await User.accessTokens.create(user)
    authToken = token.value!.release()
  })

  test('should list pets for authenticated user', async ({ client, assert }) => {
    // Create test pets
    await Pet.create({
      userId: user.id,
      name: 'Rex',
      species: 'dog',
      breed: 'Labrador',
      age: 3,
    })

    await Pet.create({
      userId: user.id,
      name: 'Whiskers',
      species: 'cat',
      breed: 'Siamese',
      age: 2,
    })

    const response = await client
      .get('/pets')
      .header('Authorization', `Bearer ${authToken}`)

    response.assertStatus(200)
    response.assertBodyContains({
      success: true,
    })

    const { data } = response.body()
    assert.equal(data.length, 2)
    assert.equal(data[0].name, 'Rex')
    assert.equal(data[1].name, 'Whiskers')
  })

  test('should create a new pet', async ({ client, assert }) => {
    const petData = {
      name: 'Buddy',
      species: 'dog',
      breed: 'Golden Retriever',
      age: 1,
      weight: 25.5,
      gender: 'male',
    }

    const response = await client
      .post('/pets')
      .header('Authorization', `Bearer ${authToken}`)
      .json(petData)

    response.assertStatus(201)
    response.assertBodyContains({
      success: true,
    })

    const { data } = response.body()
    assert.equal(data.name, 'Buddy')
    assert.equal(data.species, 'dog')
    assert.equal(data.breed, 'Golden Retriever')
    assert.exists(data.id)

    // Verify pet was saved to database
    const savedPet = await Pet.find(data.id)
    assert.exists(savedPet)
    assert.equal(savedPet!.name, 'Buddy')
    assert.equal(savedPet!.userId, user.id)
  })

  test('should fail to create pet without authentication', async ({ client }) => {
    const petData = {
      name: 'Buddy',
      species: 'dog',
    }

    const response = await client.post('/pets').json(petData)

    response.assertStatus(401)
  })

  test('should fail to create pet with invalid data', async ({ client }) => {
    const petData = {
      name: '', // Empty name
      species: 'invalid', // Invalid species
    }

    const response = await client
      .post('/pets')
      .header('Authorization', `Bearer ${authToken}`)
      .json(petData)

    response.assertStatus(400)
    response.assertBodyContains({
      success: false,
    })
  })

  test('should get a specific pet', async ({ client, assert }) => {
    const pet = await Pet.create({
      userId: user.id,
      name: 'Max',
      species: 'dog',
      breed: 'Beagle',
      age: 4,
    })

    const response = await client
      .get(`/pets/${pet.id}`)
      .header('Authorization', `Bearer ${authToken}`)

    response.assertStatus(200)
    response.assertBodyContains({
      success: true,
    })

    const { data } = response.body()
    assert.equal(data.id, pet.id)
    assert.equal(data.name, 'Max')
  })

  test('should update a pet', async ({ client, assert }) => {
    const pet = await Pet.create({
      userId: user.id,
      name: 'Fluffy',
      species: 'cat',
      breed: 'Persian',
      age: 2,
    })

    const updateData = {
      name: 'Fluffy Updated',
      age: 3,
    }

    const response = await client
      .put(`/pets/${pet.id}`)
      .header('Authorization', `Bearer ${authToken}`)
      .json(updateData)

    response.assertStatus(200)
    response.assertBodyContains({
      success: true,
    })

    const { data } = response.body()
    assert.equal(data.name, 'Fluffy Updated')
    assert.equal(data.age, 3)

    // Verify update in database
    await pet.refresh()
    assert.equal(pet.name, 'Fluffy Updated')
    assert.equal(pet.age, 3)
  })

  test('should delete a pet', async ({ client, assert }) => {
    const pet = await Pet.create({
      userId: user.id,
      name: 'Temporary',
      species: 'dog',
    })

    const response = await client
      .delete(`/pets/${pet.id}`)
      .header('Authorization', `Bearer ${authToken}`)

    response.assertStatus(200)
    response.assertBodyContains({
      success: true,
    })

    // Verify pet was deleted
    const deletedPet = await Pet.find(pet.id)
    assert.isNull(deletedPet)
  })

  test('should not allow access to other users pets', async ({ client }) => {
    // Create another user
    const otherUser = await User.create({
      email: 'other@example.com',
      password: 'password123',
      language: 'fr',
      emailVerified: true,
    })

    // Create pet for other user
    const otherPet = await Pet.create({
      userId: otherUser.id,
      name: 'Others Pet',
      species: 'cat',
    })

    // Try to access with first user's token
    const response = await client
      .get(`/pets/${otherPet.id}`)
      .header('Authorization', `Bearer ${authToken}`)

    response.assertStatus(404)
  })

  test('should not allow updating other users pets', async ({ client }) => {
    // Create another user
    const otherUser = await User.create({
      email: 'other2@example.com',
      password: 'password123',
      language: 'fr',
      emailVerified: true,
    })

    // Create pet for other user
    const otherPet = await Pet.create({
      userId: otherUser.id,
      name: 'Others Pet',
      species: 'cat',
    })

    // Try to update with first user's token
    const response = await client
      .put(`/pets/${otherPet.id}`)
      .header('Authorization', `Bearer ${authToken}`)
      .json({ name: 'Hacked' })

    response.assertStatus(404)
  })

  test('should not allow deleting other users pets', async ({ client }) => {
    // Create another user
    const otherUser = await User.create({
      email: 'other3@example.com',
      password: 'password123',
      language: 'fr',
      emailVerified: true,
    })

    // Create pet for other user
    const otherPet = await Pet.create({
      userId: otherUser.id,
      name: 'Others Pet',
      species: 'cat',
    })

    // Try to delete with first user's token
    const response = await client
      .delete(`/pets/${otherPet.id}`)
      .header('Authorization', `Bearer ${authToken}`)

    response.assertStatus(404)
  })
})
