import { BaseCommand, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { randomBytes } from 'node:crypto'
import { DateTime } from 'luxon'

/**
 * Un compte d'essai pour parcourir le logiciel.
 *
 * Créé par la console et non par le formulaire d'inscription : celui-ci envoie
 * un courriel de bienvenue, qui partirait de la clé d'envoi de production vers
 * une adresse injoignable.
 *
 * L'adresse est en `.invalid`, domaine que la norme réserve et qui ne sera
 * jamais attribué : aucun message ne peut atteindre quelqu'un par accident.
 *
 * Le mot de passe n'est pas inscrit ici. Ce dépôt est public, et ce compte vit
 * dans la base de production : un mot de passe en clair dans l'historique Git
 * y ouvrirait la porte à qui le lit. Il est donc tiré au sort et affiché une
 * fois, ou fourni par `--mot-de-passe`.
 */
const COMPTE = {
  email: 'essai@ficana.invalid',
  firstName: 'Camille',
  lastName: 'Essai',
  clinicName: 'Cabinet d’essai Ficana',
  phone: '0500000000',
  address: '1 rue de l’Essai',
  postalCode: '00000',
  city: 'Essaiville',
}

export default class CompteTest extends BaseCommand {
  static commandName = 'compte:test'
  static description = 'Crée ou réinitialise le compte vétérinaire d’essai'
  static options: CommandOptions = { startApp: true }

  @flags.string({
    flagName: 'mot-de-passe',
    description: 'mot de passe à poser ; omis, il est tiré au sort et affiché',
  })
  declare motDePasse: string

  @flags.boolean({ description: 'fermer les écrans en essai sur ce compte' })
  declare sansBeta: boolean

  async run() {
    const { default: Veterinarian } = await import('#models/veterinarian')

    // Base64 d'octets aléatoires : assez long pour ne pas se deviner, et
    // lisible pour être recopié dans un champ de connexion.
    const motDePasse = this.motDePasse || `${randomBytes(9).toString('base64url')}!aA1`

    const existant = await Veterinarian.findBy('email', COMPTE.email)
    const vet = existant ?? new Veterinarian()

    vet.email = COMPTE.email
    // Le modèle chiffre au crochet de sauvegarde : on affecte le clair.
    vet.password = motDePasse
    vet.firstName = COMPTE.firstName
    vet.lastName = COMPTE.lastName
    vet.clinicName = COMPTE.clinicName
    vet.phone = COMPTE.phone
    vet.address = COMPTE.address
    vet.postalCode = COMPTE.postalCode
    vet.city = COMPTE.city

    // Dispensé d'abonnement : sans cela, l'écran de paiement se referme sur
    // le compte avant qu'on ait rien pu voir.
    vet.subscriptionExempt = true
    vet.verificationStatus = 'verified'
    vet.isVerified = true
    // Tous les écrans ouverts par défaut, y compris ceux en essai : c'est
    // l'intérêt d'un compte d'essai que de pouvoir tout parcourir. `--sans-beta`
    // rend la vue qu'aura un client.
    vet.betaFeatures = !this.sansBeta
    // L'accueil guidé est déjà fait : il mène sinon à un questionnaire avant
    // de laisser entrer.
    vet.onboardingCompletedAt = DateTime.now()

    await vet.save()

    this.logger.info(`${existant ? 'réinitialisé' : 'créé'} : ${vet.email} (id ${vet.id})`)
    this.logger.info(`mot de passe : ${motDePasse}`)
    this.logger.warning('à noter maintenant : il n’est stocké que chiffré')
  }
}
