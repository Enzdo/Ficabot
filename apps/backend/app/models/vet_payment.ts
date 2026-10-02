import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import VetInvoice from '#models/vet_invoice'

/**
 * Un encaissement.
 *
 * Plusieurs règlements peuvent viser la même facture : c'est tout l'objet de ce
 * registre, le statut seul ne sachant pas représenter un paiement en deux fois.
 */
export default class VetPayment extends BaseModel {
  public static table = 'vet_payments'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare invoiceId: number

  @column()
  declare veterinarianId: number

  /** Date réelle d'encaissement — distincte de la date de facture. */
  @column.date()
  declare date: DateTime

  @column()
  declare amount: number

  /** Décide du journal comptable : caisse pour les espèces, banque sinon. */
  @column()
  declare method: 'cash' | 'card' | 'check' | 'transfer' | 'other'

  @column()
  declare reference: string | null

  @column()
  declare note: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => VetInvoice, { foreignKey: 'invoiceId' })
  declare invoice: BelongsTo<typeof VetInvoice>
}
