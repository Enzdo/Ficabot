import logger from '@adonisjs/core/services/logger'
import ReportTemplate from '#models/report_template'
import {
  CONSULTATION_TEMPLATES,
  findTemplate,
  templateCategory,
  type ConsultationTemplate,
  type TemplateSection,
} from '#services/consultation_templates'

/**
 * Passerelle entre la bibliothèque de modèles et la dictée.
 *
 * Deux univers coexistaient sans jamais se croiser : la page « Modèles » lisait
 * et écrivait la table `report_templates`, tandis que la dictée n'utilisait que
 * la constante `CONSULTATION_TEMPLATES`. Créer, modifier ou dupliquer un modèle
 * n'avait donc aucun effet sur le compte rendu, alors que la page annonce « la
 * trame que suit le compte rendu dicté ».
 *
 * La table fait désormais foi. La constante reste le filet : si la lecture
 * échoue, la dictée continue avec les modèles fournis plutôt que de s'arrêter —
 * c'est le cœur du produit, il ne doit pas dépendre d'une requête annexe.
 *
 * Identifiant : le `slug` pour les modèles fournis, l'identifiant numérique en
 * texte pour les modèles personnels, qui n'en ont pas.
 */

export const templateKey = (row: ReportTemplate): string => row.slug || String(row.id)

function parseSections(raw: string, name: string): TemplateSection[] {
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((s) => s && typeof s.key === 'string' && typeof s.label === 'string')
      .map((s) => ({ key: s.key, label: s.label, hint: typeof s.hint === 'string' ? s.hint : '' }))
  } catch (error) {
    logger.error({ err: error, template: name }, 'Rubriques de modèle illisibles')
    return []
  }
}

const toConsultationTemplate = (row: ReportTemplate): ConsultationTemplate => ({
  id: templateKey(row),
  label: row.name,
  sections: parseSections(row.sections, row.name),
})

/** Modèles fournis, plus ceux du praticien. Jamais ceux d'un confrère. */
function scopedQuery(veterinarianId?: number) {
  return ReportTemplate.query().where((q) => {
    q.whereNull('veterinarian_id')
    if (veterinarianId) q.orWhere('veterinarian_id', veterinarianId)
  })
}

/**
 * Liste destinée au sélecteur de la dictée. Les modèles sans rubrique sont
 * écartés : ils ne structureraient rien, et laisser un choix inerte dans la
 * liste vaut pire qu'une liste plus courte.
 */
export async function listTemplatesFor(veterinarianId?: number) {
  try {
    const rows = await scopedQuery(veterinarianId).orderBy('is_builtin', 'desc').orderBy('name', 'asc')

    const templates = rows
      .map((row) => ({ row, template: toConsultationTemplate(row) }))
      .filter(({ template }) => template.sections.length > 0)

    if (templates.length === 0) throw new Error('bibliothèque vide')

    return templates.map(({ row, template }) => ({
      id: template.id,
      label: template.label,
      category: row.category || templateCategory(template.id),
      sections: template.sections.map((s) => ({ key: s.key, label: s.label })),
      isBuiltin: row.isBuiltin,
    }))
  } catch (error) {
    logger.error({ err: error }, 'Bibliothèque de modèles illisible, repli sur les modèles fournis')
    return CONSULTATION_TEMPLATES.map((t) => ({
      id: t.id,
      label: t.label,
      category: templateCategory(t.id),
      sections: t.sections.map((s) => ({ key: s.key, label: s.label })),
      isBuiltin: true,
    }))
  }
}

/**
 * Modèle à appliquer au compte rendu.
 *
 * Un identifiant inconnu retombe sur le premier modèle fourni, comme avant —
 * mais il ne peut plus s'agir d'un modèle du praticien qu'on aurait ignoré.
 */
export async function resolveTemplate(
  id?: string | null,
  veterinarianId?: number
): Promise<ConsultationTemplate> {
  if (!id) return findTemplate(null)

  try {
    const numericId = /^\d+$/.test(id) ? Number(id) : null

    const row = await scopedQuery(veterinarianId)
      .where((q) => {
        q.where('slug', id)
        if (numericId !== null) q.orWhere('id', numericId)
      })
      .first()

    if (!row) return findTemplate(id)

    const template = toConsultationTemplate(row)
    return template.sections.length > 0 ? template : findTemplate(id)
  } catch (error) {
    logger.error({ err: error, templateId: id }, 'Modèle introuvable en base, repli sur les fournis')
    return findTemplate(id)
  }
}
