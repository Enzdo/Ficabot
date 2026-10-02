import type { HttpContext } from '@adonisjs/core/http'
import Veterinarian from '#models/veterinarian'
import VetService from '#models/vet_service'

/**
 * Le taux d'une entrée du catalogue, ou `null` pour « celui du cabinet ».
 *
 * Une valeur hors de [0, 100] n'est pas un taux : on retombe sur le cabinet
 * plutôt que de l'enregistrer, car elle fausserait toutes les factures
 * suivantes sans rien signaler.
 */
function tauxValide(valeur: unknown): number | null {
  if (valeur === null || valeur === undefined || valeur === '') return null
  const taux = Number(valeur)
  return Number.isFinite(taux) && taux >= 0 && taux <= 100 ? taux : null
}

export default class VetClinicSettingsController {
  /**
   * Get clinic info for the authenticated vet
   */
  async getClinicInfo({ response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    await vet.load('clinic')

    const clinic = vet.clinic

    return response.ok({
      success: true,
      data: {
        name: vet.clinicName || clinic?.name || '',
        // `address` ne porte plus que la voie : le code postal et la ville sont
        // des colonnes à part. Elles étaient renvoyées vides en dur, ce qui
        // vidait les champs de l'écran à chaque rechargement.
        address: vet.address || clinic?.address || '',
        postalCode: vet.postalCode || '',
        city: vet.city || '',
        phone: vet.phone || clinic?.phone || '',
        website: vet.website || clinic?.website || '',
        email: vet.email,
        siret: vet.siret || '',
        // Réglages fiscaux : la facture s'y adosse, et ils figurent sur le
        // document remis au client.
        vatRate: vet.vatRate === null || vet.vatRate === undefined ? 20 : Number(vet.vatRate),
        vatExempt: !!vet.vatExempt,
        vatNumber: vet.vatNumber || '',
        paymentTermsDays: vet.paymentTermsDays ?? 30,
        // Plan comptable. Les valeurs par défaut sont celles du plan comptable
        // général, mais le comptable du cabinet a souvent les siennes : s'il
        // faut les ressaisir à l'import, l'export perd son intérêt.
        accounts: {
          sales: vet.accountSales,
          goods: vet.accountGoods,
          vat: vet.accountVat,
          clients: vet.accountClients,
          bank: vet.accountBank,
          cash: vet.accountCash,
        },
        clinicId: clinic?.id || null,
      },
    })
  }

  /**
   * Update clinic info
   */
  async updateClinicInfo({ request, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    // `email` n'est volontairement pas repris : c'est l'adresse de connexion, la
    // changer ici modifierait l'accès au compte. Le champ est en lecture seule.
    const { name, address, phone, website, siret, postalCode, city,
            vatRate, vatExempt, vatNumber, paymentTermsDays, accounts } = request.only([
      'name', 'address', 'phone', 'website', 'siret', 'postalCode', 'city',
      'vatRate', 'vatExempt', 'vatNumber', 'paymentTermsDays', 'accounts',
    ])

    await vet.load('clinic')

    // Le praticien fait foi : c'est là que tout est écrit, y compris pour les
    // comptes sans clinique Google rattachée — c'est-à-dire tous ceux créés par
    // l'application.
    vet.clinicName = name ?? vet.clinicName
    vet.address = address ?? vet.address
    vet.postalCode = postalCode ?? vet.postalCode
    vet.city = city ?? vet.city

    // Un taux hors de [0, 100] n'est pas un taux : on ignore plutôt que
    // d'enregistrer une valeur qui fausserait toutes les factures suivantes.
    if (vatRate !== undefined && vatRate !== null && vatRate !== '') {
      const taux = Number(vatRate)
      if (Number.isFinite(taux) && taux >= 0 && taux <= 100) vet.vatRate = taux
    }
    if (vatExempt !== undefined) vet.vatExempt = !!vatExempt
    if (vatNumber !== undefined) vet.vatNumber = String(vatNumber).trim() || null
    if (paymentTermsDays !== undefined && paymentTermsDays !== '') {
      const jours = Number(paymentTermsDays)
      if (Number.isInteger(jours) && jours >= 0 && jours <= 365) vet.paymentTermsDays = jours
    }
    // Un numéro de compte est fait de chiffres, et sa classe détermine sa
    // nature : un compte client en 7 produirait des écritures que le comptable
    // devrait reprendre une à une. On refuse plutôt que d'enregistrer.
    if (accounts && typeof accounts === 'object') {
      // Le libellé est celui de l'écran, et non la clé technique : le message
      // d'erreur doit désigner le champ tel que le praticien le voit.
      const attendus: Record<string, { champ: keyof Veterinarian; classe: string; nom: string }> = {
        sales: { champ: 'accountSales', classe: '7', nom: 'Prestations de services' },
        goods: { champ: 'accountGoods', classe: '7', nom: 'Ventes de marchandises' },
        vat: { champ: 'accountVat', classe: '4', nom: 'TVA collectée' },
        clients: { champ: 'accountClients', classe: '4', nom: 'Clients' },
        bank: { champ: 'accountBank', classe: '5', nom: 'Banque' },
        cash: { champ: 'accountCash', classe: '5', nom: 'Caisse' },
      }

      for (const [cle, regle] of Object.entries(attendus)) {
        const brut = (accounts as Record<string, unknown>)[cle]
        if (brut === undefined || brut === null || brut === '') continue
        const numero = String(brut).trim()

        if (!/^\d{3,12}$/.test(numero)) {
          return response.badRequest({
            success: false,
            message: `Le compte « ${regle.nom} » doit être un numéro de 3 à 12 chiffres.`,
          })
        }
        if (!numero.startsWith(regle.classe)) {
          return response.badRequest({
            success: false,
            message: `Le compte « ${regle.nom} » doit commencer par ${regle.classe} (classe ${regle.classe} du plan comptable général).`,
          })
        }

        ;(vet as any)[regle.champ] = numero
      }
    }

    vet.phone = phone ?? vet.phone
    vet.website = website ?? vet.website
    vet.siret = siret ?? vet.siret
    await vet.save()

    // Quand une fiche Google est rattachée, on la tient à jour en miroir.
    if (vet.clinic) {
      vet.clinic.merge({
        name,
        address: [address, postalCode, city].filter(Boolean).join(', '),
        phone,
        website,
      })
      await vet.clinic.save()
    }

    return response.ok({
      success: true,
      message: 'Informations de la clinique mises à jour',
    })
  }

  /**
   * Get clinic opening hours
   */
  async getHours({ response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    await vet.load('clinic')

    const hours = (vet.openingHours as any) || (vet.clinic?.openingHours as any) || null

    return response.ok({
      success: true,
      data: hours,
    })
  }

  /**
   * Update clinic opening hours
   */
  async updateHours({ request, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    const { hours } = request.only(['hours'])

    await vet.load('clinic')

    // Écriture inconditionnelle : enfermée dans `if (vet.clinic)`, elle ne
    // s'exécutait pour personne, et le message « Horaires enregistrés »
    // s'affichait quand même. La prise de RDV en ligne répondait « Fermé ce
    // jour » en permanence, faute d'horaires jamais persistés.
    vet.openingHours = hours
    await vet.save()

    if (vet.clinic) {
      vet.clinic.openingHours = hours
      await vet.clinic.save()
    }

    return response.ok({
      success: true,
      message: 'Horaires mis à jour',
    })
  }

  /**
   * List all services for the authenticated vet
   */
  async listServices({ response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian

    const services = await VetService.query()
      .where('veterinarian_id', vet.id)
      .orderBy('created_at', 'asc')

    return response.ok({
      success: true,
      data: services.map((s) => ({
        id: s.id,
        name: s.name,
        duration: s.duration,
        price: Number(s.price),
        vatRate: s.vatRate === null || s.vatRate === undefined ? null : Number(s.vatRate),
        icon: s.icon,
        colorClass: s.colorClass,
        isActive: s.isActive,
      })),
    })
  }

  /**
   * Create a new service
   */
  async createService({ request, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian
    const { name, duration, price, icon, colorClass, vatRate } = request.only([
      'name', 'duration', 'price', 'icon', 'colorClass', 'vatRate',
    ])

    const service = await VetService.create({
      veterinarianId: vet.id,
      name,
      duration: duration || 30,
      price: price || 0,
      // `null` = le taux du cabinet s'applique. On ne copie pas sa valeur :
      // elle serait figée, et ne suivrait plus un changement de régime.
      vatRate: tauxValide(vatRate),
      icon: icon || '🩺',
      colorClass: colorClass || 'bg-primary-100',
    })

    return response.created({
      success: true,
      data: {
        id: service.id,
        name: service.name,
        duration: service.duration,
        price: Number(service.price),
        vatRate: service.vatRate === null || service.vatRate === undefined ? null : Number(service.vatRate),
        icon: service.icon,
        colorClass: service.colorClass,
        isActive: service.isActive,
      },
    })
  }

  /**
   * Update a service
   */
  async updateService({ params, request, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian

    const service = await VetService.query()
      .where('id', params.id)
      .where('veterinarian_id', vet.id)
      .first()

    if (!service) {
      return response.notFound({ success: false, message: 'Service non trouvé' })
    }

    const { name, duration, price, icon, colorClass, vatRate } = request.only([
      'name', 'duration', 'price', 'icon', 'colorClass', 'vatRate',
    ])

    service.merge({ name, duration, price, icon, colorClass })
    if (vatRate !== undefined) service.vatRate = tauxValide(vatRate)
    await service.save()

    return response.ok({
      success: true,
      data: {
        id: service.id,
        name: service.name,
        duration: service.duration,
        price: Number(service.price),
        vatRate: service.vatRate === null || service.vatRate === undefined ? null : Number(service.vatRate),
        icon: service.icon,
        colorClass: service.colorClass,
        isActive: service.isActive,
      },
    })
  }

  /**
   * Delete a service
   */
  async deleteService({ params, response, auth }: HttpContext) {
    const vet = auth.user as Veterinarian

    const service = await VetService.query()
      .where('id', params.id)
      .where('veterinarian_id', vet.id)
      .first()

    if (!service) {
      return response.notFound({ success: false, message: 'Service non trouvé' })
    }

    await service.delete()

    return response.ok({
      success: true,
      message: 'Service supprimé',
    })
  }
}
