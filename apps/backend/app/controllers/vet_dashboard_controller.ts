import type { HttpContext } from '@adonisjs/core/http'
import type Veterinarian from '#models/veterinarian'
import type VetEmployee from '#models/vet_employee'

/**
 * La composition du tableau de bord.
 *
 * Le serveur ne connaît pas les modules : il range une liste et la rend. Savoir
 * ce qu'est « chiffre_rdv » appartient à l'écran, qui seul sait l'afficher — et
 * qui évoluera plus vite que cette table. Le serveur se contente de garantir
 * que ce qu'il range est une liste de clés plausibles et de tailles connues.
 */

/** Les tailles admises. Hors de cette liste, la grille ne saurait pas placer. */
const TAILLES = ['petit', 'moyen', 'grand'] as const

/** Au-delà, ce n'est plus un tableau de bord mais une page de garde. */
const MAX_MODULES = 24

export default class VetDashboardController {
  /**
   * Qui possède cette disposition.
   *
   * Le jeton de session désigne le cabinet, employé compris : sans ce détour,
   * une assistante qui réorganise son écran réécrirait celui du titulaire. Or
   * une secrétaire et un praticien ne regardent pas les mêmes chiffres — c'est
   * précisément ce que la personnalisation doit permettre.
   */
  private porteur(ctx: HttpContext): Veterinarian | VetEmployee {
    // `vetAuth` s'exécute sur toutes les routes du logiciel et pose l'acteur :
    // l'affirmer ici suit la convention des autres contrôleurs.
    const actor = ctx.vetActor!
    return actor.employee ?? actor.veterinarian
  }

  async show(ctx: HttpContext) {
    const porteur = this.porteur(ctx)

    return ctx.response.ok({
      success: true,
      data: { layout: porteur.dashboardLayout ?? null },
    })
  }

  async update(ctx: HttpContext) {
    const { request, response } = ctx
    const porteur = this.porteur(ctx)
    const recu = request.input('layout')

    // `null` remet la disposition par défaut, qui suivra les évolutions du
    // logiciel. C'est différent d'une liste vide, qui est un choix.
    if (recu === null) {
      porteur.dashboardLayout = null
      await porteur.save()
      return response.ok({ success: true, data: { layout: null } })
    }

    if (!Array.isArray(recu)) {
      return response.badRequest({
        success: false,
        message: 'Disposition invalide.',
      })
    }

    if (recu.length > MAX_MODULES) {
      return response.badRequest({
        success: false,
        message: `Un tableau de bord ne peut pas dépasser ${MAX_MODULES} modules.`,
      })
    }

    const layout: Array<{ key: string; size: string }> = []
    const vus = new Set<string>()

    for (const brut of recu) {
      const key = String(brut?.key ?? '').trim()
      const size = String(brut?.size ?? '').trim()

      // Une clé que l'écran ne connaît pas ne s'affichera pas ; la refuser ici
      // évite surtout de ranger n'importe quoi dans la colonne.
      if (!/^[a-z0-9_]{2,40}$/.test(key)) {
        return response.badRequest({
          success: false,
          message: `Module inconnu : ${key || '(vide)'}.`,
        })
      }

      if (!TAILLES.includes(size as (typeof TAILLES)[number])) {
        return response.badRequest({
          success: false,
          message: `Taille inconnue pour ${key} : ${size || '(vide)'}.`,
        })
      }

      // Un même module deux fois afficherait deux fois la même chose, et
      // l'écran ne saurait plus lequel déplacer.
      if (vus.has(key)) continue
      vus.add(key)

      layout.push({ key, size })
    }

    porteur.dashboardLayout = layout
    await porteur.save()

    return response.ok({ success: true, data: { layout } })
  }
}
