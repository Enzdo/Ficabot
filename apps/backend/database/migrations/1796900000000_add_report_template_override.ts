import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * La version personnelle d'un modèle fourni.
 *
 * Les modèles fournis sont une seule ligne partagée par tous les cabinets :
 * les modifier sur place changerait la trame de compte rendu de tout le monde.
 * Le praticien qui en adapte un obtient donc sa propre ligne, qui note ici de
 * quel modèle fourni elle prend la place. Lui seul voit la sienne ; les autres
 * continuent de voir l'original.
 *
 * Le repère est le `slug` et non l'identifiant : les modèles fournis sont semés
 * par un seeder, et leurs identifiants diffèrent d'un environnement à l'autre.
 */
export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('report_templates', (table) => {
      table.string('overrides_slug', 80).nullable()
      // Une seule version personnelle par modèle fourni : deux feraient deux
      // entrées du même nom, sans moyen de savoir laquelle la dictée applique.
      // Postgres tient les NULL pour distincts : les lignes sans remplacement
      // ne se gênent pas entre elles.
      table.unique(['veterinarian_id', 'overrides_slug'])
    })
  }

  async down() {
    this.schema.alterTable('report_templates', (table) => {
      table.dropUnique(['veterinarian_id', 'overrides_slug'])
      table.dropColumn('overrides_slug')
    })
  }
}
