import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import VetNotificationService from '#services/vet_notification_service'
import Veterinarian from '#models/veterinarian'
import Pet from '#models/pet'
import User from '#models/user'
import PreDiagnosis from '#models/pre_diagnosis'
import VetNotification from '#models/vet_notification'

test.group('VetNotificationService', (group) => {
  let service: VetNotificationService
  let vet: Veterinarian
  let user: User
  let pet: Pet

  group.each.setup(async () => {
    await testUtils.db().truncate()
    service = new VetNotificationService()
  })

  group.setup(async () => {
    // Create test data
    vet = await Veterinarian.create({
      email: 'vet@example.com',
      password: 'password123',
      name: 'Dr. Test',
      phone: '+1234567890',
      clinicName: 'Test Clinic',
      address: '123 Test St',
      specializations: ['general'],
    })

    user = await User.create({
      email: 'user@example.com',
      password: 'password123',
      language: 'fr',
      emailVerified: true,
    })

    pet = await Pet.create({
      userId: user.id,
      name: 'Buddy',
      species: 'dog',
      breed: 'Labrador',
      age: 3,
    })
  })

  test('should create notification for new pre-diagnosis', async ({ assert }) => {
    const preDiagnosis = await PreDiagnosis.create({
      petId: pet.id,
      veterinarianId: vet.id,
      userDescription: 'My dog is not eating well',
      urgencyLevel: 'medium',
      status: 'pending',
    })

    await service.notifyNewPreDiagnosis(preDiagnosis)

    // Verify notification was created
    const notifications = await VetNotification.query()
      .where('veterinarianId', vet.id)
      .where('relatedEntityType', 'pre_diagnosis')
      .where('relatedEntityId', preDiagnosis.id)

    assert.equal(notifications.length, 1)
    assert.equal(notifications[0].type, 'new_pre_diagnosis')
    assert.include(notifications[0].title, 'pré-diagnostic')
  })

  test('should create urgent notification for critical cases', async ({ assert }) => {
    const preDiagnosis = await PreDiagnosis.create({
      petId: pet.id,
      veterinarianId: vet.id,
      userDescription: 'My dog collapsed and is not breathing well',
      urgencyLevel: 'critical',
      status: 'pending',
    })

    await service.notifyNewPreDiagnosis(preDiagnosis)

    // Verify urgent notification was created
    const notifications = await VetNotification.query()
      .where('veterinarianId', vet.id)
      .where('type', 'urgent_case')

    assert.equal(notifications.length, 1)
    assert.include(notifications[0].title, 'URGENT')
  })

  test('should create urgent notification for high priority cases', async ({ assert }) => {
    const preDiagnosis = await PreDiagnosis.create({
      petId: pet.id,
      veterinarianId: vet.id,
      userDescription: 'My dog has severe symptoms',
      urgencyLevel: 'high',
      status: 'pending',
    })

    await service.notifyNewPreDiagnosis(preDiagnosis)

    // Verify urgent notification was created
    const notifications = await VetNotification.query()
      .where('veterinarianId', vet.id)
      .where('type', 'urgent_case')

    assert.equal(notifications.length, 1)
    assert.include(notifications[0].title, 'URGENT')
  })

  test('should not create notification if no veterinarian assigned', async ({ assert }) => {
    const preDiagnosis = await PreDiagnosis.create({
      petId: pet.id,
      veterinarianId: null, // No vet assigned
      userDescription: 'My dog is sick',
      urgencyLevel: 'medium',
      status: 'pending',
    })

    await service.notifyNewPreDiagnosis(preDiagnosis)

    // Verify no notification was created
    const notifications = await VetNotification.query()
      .where('relatedEntityType', 'pre_diagnosis')
      .where('relatedEntityId', preDiagnosis.id)

    assert.equal(notifications.length, 0)
  })

  test('should get unread count for veterinarian', async ({ assert }) => {
    // Create unread notifications
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

    // Create read notification (should not be counted)
    await VetNotification.create({
      veterinarianId: vet.id,
      type: 'new_pre_diagnosis',
      title: 'Test 3',
      message: 'Message 3',
      isRead: true,
    })

    const count = await service.getUnreadCount(vet.id)
    assert.equal(count, 2)
  })

  test('should mark notification as read', async ({ assert }) => {
    const notification = await VetNotification.create({
      veterinarianId: vet.id,
      type: 'new_pre_diagnosis',
      title: 'Test',
      message: 'Test message',
      isRead: false,
    })

    const result = await service.markAsRead(notification.id, vet.id)

    assert.isTrue(result)

    await notification.refresh()
    assert.isTrue(notification.isRead)
    assert.exists(notification.readAt)
  })

  test('should not mark notification as read if wrong veterinarian', async ({ assert }) => {
    const otherVet = await Veterinarian.create({
      email: 'other@example.com',
      password: 'password123',
      name: 'Dr. Other',
      phone: '+9876543210',
      clinicName: 'Other Clinic',
      address: '456 Other St',
      specializations: ['general'],
    })

    const notification = await VetNotification.create({
      veterinarianId: otherVet.id,
      type: 'new_pre_diagnosis',
      title: 'Test',
      message: 'Test message',
      isRead: false,
    })

    const result = await service.markAsRead(notification.id, vet.id)

    assert.isFalse(result)

    await notification.refresh()
    assert.isFalse(notification.isRead)
  })

  test('should mark all notifications as read', async ({ assert }) => {
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

    await service.markAllAsRead(vet.id)

    const unreadCount = await service.getUnreadCount(vet.id)
    assert.equal(unreadCount, 0)
  })

  test('should update veterinarianNotifiedAt when notification is created', async ({ assert }) => {
    const preDiagnosis = await PreDiagnosis.create({
      petId: pet.id,
      veterinarianId: vet.id,
      userDescription: 'My dog is not eating well',
      urgencyLevel: 'medium',
      status: 'pending',
    })

    assert.isNull(preDiagnosis.veterinarianNotifiedAt)

    await service.notifyNewPreDiagnosis(preDiagnosis)

    await preDiagnosis.refresh()
    assert.exists(preDiagnosis.veterinarianNotifiedAt)
  })
})
