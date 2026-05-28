import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.raw(`ALTER TABLE pets DROP CONSTRAINT IF EXISTS pets_species_check`)
    this.schema.raw(
      `ALTER TABLE pets ADD CONSTRAINT pets_species_check CHECK (species IN ('dog','cat','nac'))`
    )
    this.schema.raw(`ALTER TABLE pre_diagnoses DROP CONSTRAINT IF EXISTS pre_diagnoses_species_check`)
    this.schema.raw(
      `ALTER TABLE pre_diagnoses ADD CONSTRAINT pre_diagnoses_species_check CHECK (species IN ('dog','cat','nac'))`
    )
  }

  async down() {
    this.schema.raw(`ALTER TABLE pets DROP CONSTRAINT IF EXISTS pets_species_check`)
    this.schema.raw(
      `ALTER TABLE pets ADD CONSTRAINT pets_species_check CHECK (species IN ('dog','cat'))`
    )
    this.schema.raw(`ALTER TABLE pre_diagnoses DROP CONSTRAINT IF EXISTS pre_diagnoses_species_check`)
    this.schema.raw(
      `ALTER TABLE pre_diagnoses ADD CONSTRAINT pre_diagnoses_species_check CHECK (species IN ('dog','cat'))`
    )
  }
}
