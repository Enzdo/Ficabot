import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import ReportTemplate from '#models/report_template'

/**
 * Bibliothèque de modèles de compte rendu.
 *
 * Trois provenances : les modèles fournis avec le produit (généraux), ceux
 * créés par le vétérinaire (personnels), et ses favoris — qui sont une vue
 * sur les deux précédents, pas une troisième copie.
 */
export default class ReportTemplatesController {
  /** GET /vet/templates?scope=all|builtin|mine|favorites&q=… */
  async index({ request, response, auth }: HttpContext) {
    const vet = auth.user as any
    const scope = request.input('scope', 'all')
    const q = (request.input('q') ?? '').trim().toLowerCase()

    const favorites = await db
      .from('report_template_favorites')
      .where('veterinarian_id', vet.id)
      .select('template_id')
    const favIds = new Set(favorites.map((f: any) => f.template_id))

    const query = ReportTemplate.query().orderBy('name', 'asc')

    if (scope === 'builtin') query.whereNull('veterinarianId')
    else if (scope === 'mine') query.where('veterinarianId', vet.id)
    else if (scope === 'favorites') {
      if (favIds.size === 0) return response.ok({ success: true, data: [] })
      query.whereIn('id', [...favIds])
    } else {
      // Par défaut : les modèles fournis et les siens, jamais ceux des autres
      query.where((b) => b.whereNull('veterinarianId').orWhere('veterinarianId', vet.id))
    }

    let templates = await query

    if (q) {
      templates = templates.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          (t.category ?? '').toLowerCase().includes(q) ||
          (t.description ?? '').toLowerCase().includes(q)
      )
    }

    return response.ok({
      success: true,
      data: templates.map((t) => this.present(t, favIds.has(t.id))),
    })
  }

  /** GET /vet/templates/:id */
  async show({ params, response, auth }: HttpContext) {
    const template = await this.findVisible(params.id, auth)
    if (!template) {
      return response.notFound({ success: false, message: 'Modèle introuvable' })
    }
    const fav = await this.isFavorite(template.id, auth)
    return response.ok({ success: true, data: this.present(template, fav) })
  }

  /** POST /vet/templates — body : { name, category?, description?, sections: [{key,label,hint?}] } */
  async store({ request, response, auth }: HttpContext) {
    const vet = auth.user as any
    const { name, category, description, sections } = request.only([
      'name',
      'category',
      'description',
      'sections',
    ])

    const clean = this.cleanSections(sections)
    if (!name?.trim()) {
      return response.badRequest({ success: false, message: 'Le modèle doit avoir un nom' })
    }
    if (!clean.length) {
      return response.badRequest({ success: false, message: 'Ajoutez au moins une rubrique' })
    }

    const template = await ReportTemplate.create({
      veterinarianId: vet.id,
      name: name.trim().slice(0, 120),
      category: category?.trim()?.slice(0, 40) || null,
      description: description?.trim()?.slice(0, 300) || null,
      sections: JSON.stringify(clean),
      isBuiltin: false,
    })

    return response.created({ success: true, data: this.present(template, false) })
  }

  /** PUT /vet/templates/:id — les modèles fournis ne sont pas modifiables */
  async update({ params, request, response, auth }: HttpContext) {
    const vet = auth.user as any
    const template = await ReportTemplate.query()
      .where('id', params.id)
      .where('veterinarianId', vet.id)
      .first()

    if (!template) {
      return response.notFound({
        success: false,
        message: "Ce modèle est fourni avec le produit : dupliquez-le pour l'adapter.",
      })
    }

    const { name, category, description, sections } = request.only([
      'name',
      'category',
      'description',
      'sections',
    ])

    if (name !== undefined) template.name = (name ?? '').trim().slice(0, 120) || template.name
    if (category !== undefined) template.category = category?.trim()?.slice(0, 40) || null
    if (description !== undefined) template.description = description?.trim()?.slice(0, 300) || null
    if (sections !== undefined) {
      const clean = this.cleanSections(sections)
      if (!clean.length) {
        return response.badRequest({ success: false, message: 'Ajoutez au moins une rubrique' })
      }
      template.sections = JSON.stringify(clean)
    }

    await template.save()
    const fav = await this.isFavorite(template.id, auth)
    return response.ok({ success: true, data: this.present(template, fav) })
  }

  /** POST /vet/templates/:id/duplicate — la voie pour adapter un modèle fourni */
  async duplicate({ params, response, auth }: HttpContext) {
    const vet = auth.user as any
    const source = await this.findVisible(params.id, auth)
    if (!source) {
      return response.notFound({ success: false, message: 'Modèle introuvable' })
    }

    const copy = await ReportTemplate.create({
      veterinarianId: vet.id,
      name: `${source.name} (copie)`.slice(0, 120),
      category: source.category,
      description: source.description,
      sections: source.sections,
      isBuiltin: false,
    })

    return response.created({ success: true, data: this.present(copy, false) })
  }

  /** DELETE /vet/templates/:id */
  async destroy({ params, response, auth }: HttpContext) {
    const vet = auth.user as any
    const template = await ReportTemplate.query()
      .where('id', params.id)
      .where('veterinarianId', vet.id)
      .first()

    if (!template) {
      return response.notFound({
        success: false,
        message: 'Un modèle fourni avec le produit ne peut pas être supprimé.',
      })
    }

    await template.delete()
    return response.ok({ success: true, data: { deleted: true } })
  }

  /** POST /vet/templates/:id/favorite — bascule */
  async toggleFavorite({ params, response, auth }: HttpContext) {
    const vet = auth.user as any
    const template = await this.findVisible(params.id, auth)
    if (!template) {
      return response.notFound({ success: false, message: 'Modèle introuvable' })
    }

    const existing = await db
      .from('report_template_favorites')
      .where('veterinarian_id', vet.id)
      .where('template_id', template.id)
      .first()

    if (existing) {
      await db
        .from('report_template_favorites')
        .where('veterinarian_id', vet.id)
        .where('template_id', template.id)
        .delete()
      return response.ok({ success: true, data: { favorite: false } })
    }

    await db.table('report_template_favorites').insert({
      veterinarian_id: vet.id,
      template_id: template.id,
      created_at: new Date(),
    })
    return response.ok({ success: true, data: { favorite: true } })
  }

  private async findVisible(id: string, auth: HttpContext['auth']) {
    const vet = auth.user as any
    return ReportTemplate.query()
      .where('id', id)
      .where((b) => b.whereNull('veterinarianId').orWhere('veterinarianId', vet.id))
      .first()
  }

  private async isFavorite(templateId: number, auth: HttpContext['auth']) {
    const vet = auth.user as any
    const row = await db
      .from('report_template_favorites')
      .where('veterinarian_id', vet.id)
      .where('template_id', templateId)
      .first()
    return Boolean(row)
  }

  private cleanSections(raw: unknown) {
    if (!Array.isArray(raw)) return []
    return raw
      .filter((s: any) => s && typeof s.label === 'string' && s.label.trim())
      .map((s: any, i: number) => ({
        key:
          (typeof s.key === 'string' && s.key.trim()) ||
          s.label
            .trim()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[̀-ͯ]/g, '')
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_|_$/g, '') ||
          `rubrique_${i + 1}`,
        label: s.label.trim().slice(0, 80),
        hint: typeof s.hint === 'string' ? s.hint.trim().slice(0, 160) : '',
      }))
      .slice(0, 20)
  }

  private present(t: ReportTemplate, favorite: boolean) {
    let sections: any[] = []
    try {
      sections = JSON.parse(t.sections)
    } catch {
      sections = []
    }
    return {
      id: t.id,
      slug: t.slug,
      name: t.name,
      category: t.category,
      description: t.description,
      sections,
      sectionCount: sections.length,
      builtin: Boolean(t.isBuiltin || t.veterinarianId === null),
      favorite,
    }
  }
}
