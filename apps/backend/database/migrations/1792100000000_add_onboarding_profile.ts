import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('veterinarians', (table) => {
      table.text('onboarding_profile').nullable()
    })
  }
  async down() {
    this.schema.alterTable('veterinarians', (table) => table.dropColumn('onboarding_profile'))
  }
}
