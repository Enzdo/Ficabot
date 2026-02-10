import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import Veterinarian from '#models/veterinarian'
import VetNotification from '#models/vet_notification'

test.group('Notifications Controller', (group) => {
  let vet: Veterinarian
  let authToken: string

  group.each.setup(async () => {
    await testUtils.db().truncate()
  })

  group.setup(async () => {
    // Create a test veterinarian
    vet = await Veterinarian.create({
      email: 'vet@example.com',
      password: 'password123',
      name: 'Dr. Smith',
      phone: '+1234567890',
      clinicName: 'Test Clinic',
      address: '123 Test St',
      specializations: ['general'],
    })

    const token = await Veterinarian.accessTokens.create(vet)
    authToken = token.value!.release()
  })

  test('should get unread notification count', async ({ client, assert }) => {
    // Create some unread notifications
    await VetNotification.create({
      veterinarianId: vet.id,
      type: 'new_pre_diagnosis',
      title: 'New case',
      message: 'Test notification 1',
      isRead: false,
    })

    await VetNotification.create({
      veterinarianId: vet.id,
      type: 'new_pre_diagnosis',
      title: 'New case 2',
      message: 'Test notification 2',
      isRead: false,
    })

    // Create a read notification (should not be counted)
    await VetNotification.create({
      veterinarianId: vet.id,
      type: 'new_pre_diagnosis',
      title: 'Old case',
      message: 'Test notification 3',
      isRead: true,
    })

    const response = await client
      .get('/notifications/unread-count')
      .header('Authorization', `Bearer ${authToken}`)

    response.assertStatus(200)
    response.assertBodyContains({
      success: true,
    })

    const { data } = response.body()
    assert.equal(data.count, 2)
  })

  test('should list notifications', async ({ client, assert }) => {
    await VetNotification.create({
      veterinarianId: vet.id,
      type: 'urgent_case',
      title: 'Urgent case',
      message: 'Urgent notification',
      isRead: false,
    })

    await VetNotification.create({
      veterinarianId: vet.id,
      type: 'new_pre_diagnosis',
      title: 'Regular case',
      message: 'Regular notification',
      isRead: false,
    })

    const response = await client
      .get('/notifications')
      .header('Authorization', `Bearer ${authToken}`)

    response.assertStatus(200)
    response.assertBodyContains({
      success: true,
    })

    const { data } = response.body()
    assert.isAtLeast(data.data.length, 2)
  })

  test('should mark notification as read', async ({ client, assert }) => {
    const notification = await VetNotification.create({
      veterinarianId: vet.id,
      type: 'new_pre_diagnosis',
      title: 'Test',
      message: 'Test message',
      isRead: false,
    })

    const response = await client
      .put(`/notifications/${notification.id}/read`)
      .header('Authorization', `Bearer ${authToken}`)
      .json({})

    response.assertStatus(200)
    response.assertBodyContains({
      success: true,
    })

    // Verify notification was marked as read
    await notification.refresh()
    assert.isTrue(notification.isRead)
    assert.exists(notification.readAt)
  })

  test('should mark all notifications as read', async ({ client, assert }) => {
    await VetNotification.create({
      veterinarianId: vet.id,
      type: 'new_pre_diagnosis',
      title: 'Test 1',
      message: 'Message 1',
      isRead: false,
    })

    await VetNotification.create({
      veterinarianId: vet.id,
      type: 'new_pre_diagnosis',
      title: 'Test 2',
      message: 'Message 2',
      isRead: false,
    })

    const response = await client
      .put('/notifications/mark-all-read')
      .header('Authorization', `Bearer ${authToken}`)
      .json({})

    response.assertStatus(200)
    response.assertBodyContains({
      success: true,
    })

    // Verify all notifications were marked as read
    const unreadCount = await VetNotification.query()
      .where('veterinarianId', vet.id)
      .where('isRead', false)
      .count('* as total')

    assert.equal(parseInt(unreadCount[0].$extras.total), 0)
  })

  test('should delete notification', async ({ client, assert }) => {
    const notification = await VetNotification.create({
      veterinarianId: vet.id,
      type: 'new_pre_diagnosis',
      title: 'To delete',
      message: 'Delete me',
      isRead: false,
    })

    const response = await client
      .delete(`/notifications/${notification.id}`)
      .header('Authorization', `Bearer ${authToken}`)

    response.assertStatus(200)
    response.assertBodyContains({
      success: true,
    })

    // Verify notification was deleted
    const deletedNotification = await VetNotification.find(notification.id)
    assert.isNull(deletedNotification)
  })

  test('should not allow access to other vets notifications', async ({ client }) => {
    // Create another vet
    const otherVet = await Veterinarian.create({
      email: 'other-vet@example.com',
      password: 'password123',
      name: 'Dr. Jones',
      phone: '+9876543210',
      clinicName: 'Other Clinic',
      address: '456 Other St',
      specializations: ['general'],
    })

    // Create notification for other vet
    const otherNotification = await VetNotification.create({
      veterinarianId: otherVet.id,
      type: 'new_pre_diagnosis',
      title: 'Private',
      message: 'Private message',
      isRead: false,
    })

    // Try to mark as read with first vet's token
    const response = await client
      .put(`/notifications/${otherNotification.id}/read`)
      .header('Authorization', `Bearer ${authToken}`)
      .json({})

    response.assertStatus(403)
  })

  test('should not allow deleting other vets notifications', async ({ client }) => {
    // Create another vet
    const otherVet = await Veterinarian.create({
      email: 'other-vet2@example.com',
      password: 'password123',
      name: 'Dr. Brown',
      phone: '+1122334455',
      clinicName: 'Another Clinic',
      address: '789 Another St',
      specializations: ['general'],
    })

    // Create notification for other vet
    const otherNotification = await VetNotification.create({
      veterinarianId: otherVet.id,
      type: 'new_pre_diagnosis',
      title: 'Private',
      message: 'Private message',
      isRead: false,
    })

    // Try to delete with first vet's token
    const response = await client
      .delete(`/notifications/${otherNotification.id}`)
      .header('Authorization', `Bearer ${authToken}`)

    response.assertStatus(403)
  })

  test('should require authentication for all endpoints', async ({ client }) => {
    const endpoints = [
      { method: 'get', path: '/notifications/unread-count' },
      { method: 'get', path: '/notifications' },
      { method: 'put', path: '/notifications/1/read' },
      { method: 'put', path: '/notifications/mark-all-read' },
      { method: 'delete', path: '/notifications/1' },
    ]

    for (const endpoint of endpoints) {
      const response =
        endpoint.method === 'get'
          ? await client.get(endpoint.path)
          : endpoint.method === 'put'
            ? await client.put(endpoint.path).json({})
            : await client.delete(endpoint.path)

      response.assertStatus(401)
    }
  })
})
