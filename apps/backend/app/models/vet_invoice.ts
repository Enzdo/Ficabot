import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, belongsTo } from '@adonisjs/lucid/orm'
import type { HasMany, BelongsTo } from '@adonisjs/lucid/types/relations'
import VetInvoiceItem from '#models/vet_invoice_item'
import Veterinarian from '#models/veterinarian'

/**
 * Ramène une valeur de colonne `date` à AAAA-MM-JJ.
 *
 * Les composantes locales sont lues (et non `toISOString`) : la date a été
 * écrite à minuit local, et passer par UTC reculerait d'un jour.
 */
function jourIso(valeur: unknown): string {
  if (valeur instanceof Date) {
    const m = String(valeur.getMonth() + 1).padStart(2, '0')
    const j = String(valeur.getDate()).padStart(2, '0')
    return `${valeur.getFullYear()}-${m}-${j}`
  }
  return String(valeur ?? '').slice(0, 10)
}

export default class VetInvoice extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare veterinarianId: number

  @column()
  declare number: string

  /**
   * `invoice` ou `credit_note`. Un avoir annule une facture émise — la seule
   * correction possible, une facture ne se réécrivant ni ne se supprimant.
   */
  @column()
  declare type: 'invoice' | 'credit_note'

  @column()
  declare cancelsInvoiceId: number | null

  @column()
  declare creditReason: string | null

  /** Propriétaire inscrit, s'il en a un. Sert de compte auxiliaire. */
  @column()
  declare userId: number | null

  /** Client sans compte, saisi par le cabinet. */
  @column()
  declare externalClientId: number | null

  @column()
  declare clientName: string

  @column()
  declare clientEmail: string | null

  @column()
  declare petName: string | null

  /**
   * Date de la pièce, en AAAA-MM-JJ.
   *
   * La colonne est un `date` Postgres, que le pilote rend en objet `Date` à
   * minuit *local*. Sérialisé, il repart en UTC : une facture du 1er octobre
   * ressortait datée du 30 septembre 22 h — soit, à cheval sur un mois, dans la
   * mauvaise période comptable. On ramène donc la valeur à la chaîne que le
   * type annonce, plutôt que de rattraper le décalage à chaque lecture.
   */
  @column({ consume: jourIso })
  declare date: string

  @column({ consume: jourIso })
  declare dueDate: string

  @column()
  declare subtotal: number

  @column()
  declare taxRate: number

  @column()
  declare tax: number

  @column()
  declare total: number

  @column()
  declare status: 'draft' | 'pending' | 'paid' | 'overdue'

  @column()
  declare notes: string | null

  @column.dateTime()
  declare paidAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => VetInvoiceItem, { foreignKey: 'invoiceId' })
  declare items: HasMany<typeof VetInvoiceItem>

  @belongsTo(() => Veterinarian)
  declare veterinarian: BelongsTo<typeof Veterinarian>
}
