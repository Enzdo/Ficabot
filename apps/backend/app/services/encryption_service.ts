import crypto from 'node:crypto'
import env from '#start/env'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const AUTH_TAG_LENGTH = 16
const SALT_LENGTH = 32

export default class EncryptionService {
  private static getKey(): Buffer {
    const secret = env.get('ENCRYPTION_KEY')
    if (!secret) {
      throw new Error('ENCRYPTION_KEY is not defined in environment variables')
    }
    // Derive a 32-byte key from the secret using SHA-256
    return crypto.createHash('sha256').update(secret).digest()
  }

  /**
   * Encrypt sensitive data
   * Returns a base64 string containing: salt + iv + authTag + encryptedData
   */
  static encrypt(plainText: string): string {
    if (!plainText) return ''

    const key = this.getKey()
    const iv = crypto.randomBytes(IV_LENGTH)
    const salt = crypto.randomBytes(SALT_LENGTH)

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
    
    let encrypted = cipher.update(plainText, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    const authTag = cipher.getAuthTag()

    // Combine salt + iv + authTag + encrypted data
    const combined = Buffer.concat([
      salt,
      iv,
      authTag,
      Buffer.from(encrypted, 'hex'),
    ])

    return combined.toString('base64')
  }

  /**
   * Decrypt encrypted data
   */
  static decrypt(encryptedData: string): string {
    if (!encryptedData) return ''

    try {
      const key = this.getKey()
      const combined = Buffer.from(encryptedData, 'base64')

      // Extract components
      // const salt = combined.subarray(0, SALT_LENGTH)
      const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH)
      const authTag = combined.subarray(
        SALT_LENGTH + IV_LENGTH,
        SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH
      )
      const encrypted = combined.subarray(SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH)

      const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
      decipher.setAuthTag(authTag)

      let decrypted = decipher.update(encrypted.toString('hex'), 'hex', 'utf8')
      decrypted += decipher.final('utf8')

      return decrypted
    } catch (error) {
      console.error('Decryption error:', error)
      return ''
    }
  }

  /**
   * Encrypt a JSON object (all fields except excluded ones)
   */
  static encryptObject<T extends Record<string, any>>(
    data: T,
    excludeFields: string[] = []
  ): Record<string, any> {
    const encrypted: Record<string, any> = {}

    for (const [key, value] of Object.entries(data)) {
      if (excludeFields.includes(key) || value === null || value === undefined) {
        encrypted[key] = value
      } else if (typeof value === 'string') {
        encrypted[key] = this.encrypt(value)
      } else if (typeof value === 'object' && !(value instanceof Date)) {
        encrypted[key] = this.encrypt(JSON.stringify(value))
      } else {
        encrypted[key] = value
      }
    }

    return encrypted
  }

  /**
   * Decrypt a JSON object
   */
  static decryptObject<T extends Record<string, any>>(
    data: T,
    excludeFields: string[] = [],
    jsonFields: string[] = []
  ): Record<string, any> {
    const decrypted: Record<string, any> = {}

    for (const [key, value] of Object.entries(data)) {
      if (excludeFields.includes(key) || value === null || value === undefined) {
        decrypted[key] = value
      } else if (typeof value === 'string' && !excludeFields.includes(key)) {
        const decryptedValue = this.decrypt(value)
        if (jsonFields.includes(key) && decryptedValue) {
          try {
            decrypted[key] = JSON.parse(decryptedValue)
          } catch {
            decrypted[key] = decryptedValue
          }
        } else {
          decrypted[key] = decryptedValue
        }
      } else {
        decrypted[key] = value
      }
    }

    return decrypted
  }
}
