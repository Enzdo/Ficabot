import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Débloque les comptes vétérinaires existants.
 *
 * L'inscription posait `verificationStatus: clinicId ? 'pending' : 'pending'` —
 * les deux branches du ternaire renvoyaient la même valeur — et aucun code ne
 * faisait jamais passer ce statut à 'verified'. L'envoi de messages aux clients
 * l'exigeant, la messagerie était fermée pour la totalité des comptes.
 *
 * L'inscription pose désormais 'verified' directement. Cette migration aligne
 * les comptes déjà créés, qui resteraient sinon bloqués à vie.
 *
 * Les comptes explicitement 'rejected' ne sont pas touchés : si quelqu'un a un
 * jour été refusé à la main, ce n'est pas à une migration de le réhabiliter.
 */
export default class extends BaseSchema {
  async up() {
    this.defer(async (db) => {
      await db
        .from('veterinarians')
        .where('verification_status', 'pending')
        .update({ verification_status: 'verified' })
    })
  }

  async down() {
    // Pas de retour en arrière : on ne saurait pas distinguer les comptes que
    // cette migration a ouverts de ceux légitimement vérifiés depuis.
  }
}
