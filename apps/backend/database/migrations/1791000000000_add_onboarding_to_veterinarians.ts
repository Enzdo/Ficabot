import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Profil d'exercice renseigné à l'inscription.
 *
 * Sert à deux choses : proposer d'emblée le bon modèle de compte rendu,
 * et savoir à qui on s'adresse. Toutes les colonnes sont nullables — le
 * parcours est passable à chaque étape, et les comptes existants restent
 * valides sans rien remplir.
 */
export default class extends BaseSchema {
  protected tableName = 'veterinarians'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // canine_feline | equine | rurale | nac | urgences | mixte
      table.string('practice_type').nullable()
      // Liste JSON de spécialités (dermatologie, cardiologie…)
      table.text('specialties').nullable()
      // solo | petite_equipe | clinique | groupe
      table.string('team_size').nullable()
      // Modèle de compte rendu proposé par défaut à la dictée
      table.string('default_template').nullable()
      // Null tant que le parcours n'a pas été terminé ou explicitement passé
      table.timestamp('onboarding_completed_at').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('practice_type')
      table.dropColumn('specialties')
      table.dropColumn('team_size')
      table.dropColumn('default_template')
      table.dropColumn('onboarding_completed_at')
    })
  }
}
