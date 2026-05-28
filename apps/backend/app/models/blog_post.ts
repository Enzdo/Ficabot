import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class BlogPost extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare slug: string

  @column()
  declare title: string

  @column()
  declare excerpt: string

  @column()
  declare content: string

  @column()
  declare category: string

  @column()
  declare target: 'owner' | 'pro'

  @column()
  declare species: string | null // CSV: 'dog,cat,nac' or null

  @column()
  declare author: string

  @column()
  declare authorRole: string | null

  @column()
  declare publishedAt: string

  @column()
  declare readTime: string | null

  @column()
  declare imageUrl: string | null

  @column()
  declare featured: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  get speciesList(): string[] {
    return this.species ? this.species.split(',').map((s) => s.trim()).filter(Boolean) : []
  }

  toJSON() {
    return {
      id: this.id,
      slug: this.slug,
      title: this.title,
      excerpt: this.excerpt,
      content: this.content,
      category: this.category,
      target: this.target,
      species: this.speciesList,
      author: this.author,
      authorRole: this.authorRole,
      publishedAt: this.publishedAt,
      readTime: this.readTime,
      image: this.imageUrl,
      featured: this.featured,
    }
  }
}
