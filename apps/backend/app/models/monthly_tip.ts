import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class MonthlyTip extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare species: 'dog' | 'cat' | 'nac'

  @column()
  declare month: number

  @column()
  declare title: string

  @column()
  declare body: string

  @column()
  declare emoji: string | null

  @column()
  declare imageUrl: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  toJSON() {
    return {
      id: this.id,
      species: this.species,
      month: this.month,
      title: this.title,
      body: this.body,
      emoji: this.emoji,
      image: this.imageUrl,
    }
  }
}
