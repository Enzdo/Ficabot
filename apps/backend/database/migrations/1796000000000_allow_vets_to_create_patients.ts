import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Permet au praticien de créer un patient.
 *
 * Jusqu'ici, un animal n'entrait dans le logiciel que par son propriétaire :
 * il le créait dans l'application client, puis partageait l'accès. Le praticien
 * qui reçoit un nouveau client n'avait donc aucun moyen d'ouvrir un dossier —
 * il pouvait créer la fiche du propriétaire, mais pas celle de l'animal.
 *
 * Deux rattachements, tous deux facultatifs :
 *
 * - `veterinarian_id` : le cabinet qui a ouvert le dossier. C'est la clé de
 *   cloisonnement de ces patients-là, puisqu'ils n'ont pas de propriétaire
 *   inscrit pour les rattacher.
 * - `external_client_id` : le client sans compte à qui l'animal appartient.
 *   Absent pour un animal vu en urgence, dont on ne sait pas encore à qui il est.
 *
 * Les animaux créés par leur propriétaire gardent `veterinarian_id` à NULL et
 * continuent d'être cadrés par le lien accepté : rien ne change pour eux.
 */
export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('pets', (table) => {
      table
        .integer('veterinarian_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('veterinarians')
        .onDelete('CASCADE')

      table
        .integer('external_client_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('vet_external_clients')
        .onDelete('SET NULL')

      table.index(['veterinarian_id'], 'pets_veterinarian_id_index')
    })
  }

  async down() {
    this.schema.alterTable('pets', (table) => {
      table.dropIndex(['veterinarian_id'], 'pets_veterinarian_id_index')
      table.dropColumn('external_client_id')
      table.dropColumn('veterinarian_id')
    })
  }
}
