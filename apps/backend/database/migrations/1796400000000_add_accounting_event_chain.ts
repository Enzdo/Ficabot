import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Le journal inaltérable des événements comptables.
 *
 * Exigé par l'article 286-I-3°bis du CGI : les données enregistrées ne doivent
 * pouvoir être ni modifiées ni supprimées sans que cela se voie. Chaque
 * événement porte une signature calculée sur son contenu *et* sur celle de
 * l'événement précédent : toucher une ligne rompt la chaîne à partir d'elle, et
 * la rupture se détecte en la reparcourant.
 */
export default class extends BaseSchema {
  protected tableName = 'vet_accounting_events'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      /**
       * Pas de clé étrangère vers `veterinarians`.
       *
       * En cascade, supprimer un compte effacerait son journal — exactement ce
       * que la conservation interdit. En restriction, le compte deviendrait
       * indéprimable. On garde donc la colonne seule, et le journal survit au
       * compte ; l'arbitrage entre effacement et conservation fiscale reste à
       * trancher, mais il se tranchera sur des données encore présentes.
       */
      table.integer('veterinarian_id').notNullable()

      /** Rang de l'événement dans la chaîne du cabinet, à partir de 1. */
      table.integer('sequence').notNullable()

      table.string('type').notNullable()

      /** De quoi relire le journal sans le déchiffrer : « FAC-2026-001 ». */
      table.string('reference').nullable()

      /** Les données signées, sérialisées de façon déterministe. */
      table.text('payload').notNullable()

      table.string('previous_signature', 64).notNullable()
      table.string('signature', 64).notNullable()

      table.timestamp('recorded_at', { useTz: true }).notNullable()

      // Deux événements ne peuvent pas prétendre au même rang : c'est ce qui
      // empêche une écriture concurrente de bifurquer la chaîne.
      table.unique(['veterinarian_id', 'sequence'])
      table.index(['veterinarian_id', 'sequence'])
    })

    /**
     * L'interdiction est posée dans la base, pas seulement dans le code.
     *
     * Une règle que seule l'application respecte n'est pas une garantie : il
     * suffit d'un accès direct, d'un script de reprise ou d'une erreur pour la
     * contourner. Ici, même le propriétaire de la connexion est refusé.
     */
    this.defer(async (db) => {
      await db.rawQuery(`
        CREATE OR REPLACE FUNCTION vet_accounting_events_immutable()
        RETURNS trigger AS $$
        BEGIN
          RAISE EXCEPTION 'Le journal comptable est inaltérable : ni modification ni suppression.';
        END;
        $$ LANGUAGE plpgsql;
      `)

      await db.rawQuery(`
        CREATE TRIGGER vet_accounting_events_no_change
          BEFORE UPDATE OR DELETE ON vet_accounting_events
          FOR EACH ROW EXECUTE FUNCTION vet_accounting_events_immutable();
      `)

      // TRUNCATE ne déclenche pas les déclencheurs de ligne : il lui faut le
      // sien, sans quoi la table entière se viderait d'un mot.
      await db.rawQuery(`
        CREATE TRIGGER vet_accounting_events_no_truncate
          BEFORE TRUNCATE ON vet_accounting_events
          FOR EACH STATEMENT EXECUTE FUNCTION vet_accounting_events_immutable();
      `)
    })
  }

  async down() {
    this.defer(async (db) => {
      await db.rawQuery('DROP TRIGGER IF EXISTS vet_accounting_events_no_change ON vet_accounting_events')
      await db.rawQuery('DROP TRIGGER IF EXISTS vet_accounting_events_no_truncate ON vet_accounting_events')
      await db.rawQuery('DROP FUNCTION IF EXISTS vet_accounting_events_immutable()')
    })
    this.schema.dropTable(this.tableName)
  }
}
