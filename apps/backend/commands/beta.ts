import { BaseCommand, args, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

/** Ouvre ou ferme les écrans en essai pour un cabinet. */
export default class Beta extends BaseCommand {
  static commandName = 'beta'
  static description = 'Ouvre ou ferme les écrans en essai pour un compte vétérinaire'
  static options: CommandOptions = { startApp: true }

  @args.string({ required: false, description: 'email du compte ; omis, liste l’état de tous' })
  declare email: string

  @flags.boolean({ description: 'fermer au lieu d’ouvrir' })
  declare off: boolean

  async run() {
    const { default: Veterinarian } = await import('#models/veterinarian')

    if (!this.email) {
      const vets = await Veterinarian.query().orderBy('id', 'asc')
      for (const v of vets) {
        this.logger.info(`  ${v.betaFeatures ? '✓ ouvert ' : '  fermé  '} ${v.email}`)
      }
      return
    }

    const vet = await Veterinarian.findBy('email', this.email)
    if (!vet) return this.logger.error('compte introuvable')

    vet.betaFeatures = !this.off
    await vet.save()
    this.logger.info(`${vet.email} → écrans en essai ${vet.betaFeatures ? 'OUVERTS' : 'fermés'}`)
  }
}
