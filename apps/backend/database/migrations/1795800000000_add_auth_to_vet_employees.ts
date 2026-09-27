import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Donne un accès au logiciel aux employés d'un cabinet.
 *
 * L'employé existait déjà, mais comme ressource d'agenda : une fiche à qui l'on
 * affecte des rendez-vous, sans moyen de se connecter. Il devient un utilisateur.
 *
 * Le mot de passe est nullable, et c'est le pivot : une fiche sans mot de passe
 * reste une simple ressource d'agenda — un remplaçant, un intervenant ponctuel.
 * L'accès se donne et se retire ; il n'est pas inhérent à la fiche.
 */
export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('vet_employees', (table) => {
      table.string('password').nullable()
      table.timestamp('last_login_at').nullable()

      /**
       * Dérogations à la grille de droits du rôle, par domaine. Absent = le rôle
       * décide, ce qui permet de faire évoluer la grille par défaut sans repasser
       * sur chaque employé.
       */
      table.jsonb('capabilities').nullable()
    })

    /**
     * L'adresse identifie l'employé à la connexion, et le formulaire ne demande
     * pas de quel cabinet il s'agit : elle doit donc être unique parmi ceux qui
     * peuvent se connecter, faute de quoi deux comptes homonymes rendraient la
     * résolution ambiguë — et le choix du mauvais cabinet ouvrirait les données
     * d'un confrère.
     *
     * L'index est partiel : les fiches sans accès, elles, peuvent partager une
     * adresse ou n'en avoir aucune.
     */
    this.defer(async (db) => {
      await db.rawQuery(
        `CREATE UNIQUE INDEX IF NOT EXISTS vet_employees_login_email_unique
         ON vet_employees (lower(email))
         WHERE password IS NOT NULL`
      )
    })
  }

  async down() {
    this.defer(async (db) => {
      await db.rawQuery('DROP INDEX IF EXISTS vet_employees_login_email_unique')
    })

    this.schema.alterTable('vet_employees', (table) => {
      table.dropColumn('password')
      table.dropColumn('last_login_at')
      table.dropColumn('capabilities')
    })
  }
}
