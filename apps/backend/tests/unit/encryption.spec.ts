import { test } from '@japa/runner'
import EncryptionService from '#services/encryption_service'

test.group('EncryptionService', () => {
  test('should encrypt and decrypt string correctly', async ({ assert }) => {
    const encryptionService = new EncryptionService()
    const originalData = 'Sensitive medical data'

    const encrypted = encryptionService.encrypt(originalData)
    assert.notEqual(encrypted, originalData)
    assert.isString(encrypted)

    const decrypted = encryptionService.decrypt(encrypted)
    assert.equal(decrypted, originalData)
  })

  test('should encrypt and decrypt object correctly', async ({ assert }) => {
    const encryptionService = new EncryptionService()
    const originalData = {
      identification: 'ABC123',
      bloodType: 'A+',
      allergies: ['Penicillin'],
    }

    const encrypted = encryptionService.encrypt(originalData)
    assert.isString(encrypted)

    const decrypted = encryptionService.decrypt(encrypted)
    assert.deepEqual(decrypted, originalData)
  })

  test('should handle empty string', async ({ assert }) => {
    const encryptionService = new EncryptionService()
    const originalData = ''

    const encrypted = encryptionService.encrypt(originalData)
    const decrypted = encryptionService.decrypt(encrypted)

    assert.equal(decrypted, originalData)
  })

  test('should handle special characters', async ({ assert }) => {
    const encryptionService = new EncryptionService()
    const originalData = 'Data with émojis 🐕 and spéciàl çhars'

    const encrypted = encryptionService.encrypt(originalData)
    const decrypted = encryptionService.decrypt(encrypted)

    assert.equal(decrypted, originalData)
  })

  test('should produce different ciphertext for same plaintext', async ({ assert }) => {
    const encryptionService = new EncryptionService()
    const originalData = 'Same data'

    const encrypted1 = encryptionService.encrypt(originalData)
    const encrypted2 = encryptionService.encrypt(originalData)

    // Should be different due to random IV (Initialization Vector)
    assert.notEqual(encrypted1, encrypted2)

    // But both should decrypt to same value
    const decrypted1 = encryptionService.decrypt(encrypted1)
    const decrypted2 = encryptionService.decrypt(encrypted2)

    assert.equal(decrypted1, originalData)
    assert.equal(decrypted2, originalData)
  })

  test('should throw on invalid encrypted data', async ({ assert }) => {
    const encryptionService = new EncryptionService()
    const invalidData = 'not-a-valid-encrypted-string'

    assert.throws(
      () => encryptionService.decrypt(invalidData),
      'Failed to decrypt'
    )
  })
})
