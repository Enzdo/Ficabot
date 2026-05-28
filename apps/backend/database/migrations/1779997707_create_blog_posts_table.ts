import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'blog_posts'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('slug', 200).notNullable().unique()
      table.string('title', 300).notNullable()
      table.text('excerpt').notNullable()
      table.text('content').notNullable()
      table.string('category', 100).notNullable()
      // 'owner' = propriétaires d'animaux, 'pro' = vétérinaires
      table.string('target', 10).notNullable().defaultTo('owner')
      // Species tags: 'dog', 'cat', 'nac' — CSV (multiple possible: 'dog,cat')
      table.string('species', 50).nullable()
      table.string('author', 200).notNullable()
      table.string('author_role', 200).nullable()
      table.string('published_at', 50).notNullable()
      table.string('read_time', 20).nullable()
      table.text('image_url').nullable()
      table.boolean('featured').notNullable().defaultTo(false)
      table.timestamp('created_at').notNullable().defaultTo(this.now())
      table.timestamp('updated_at').notNullable().defaultTo(this.now())

      table.index('slug')
      table.index('target')
      table.index('species')
      table.index('featured')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
