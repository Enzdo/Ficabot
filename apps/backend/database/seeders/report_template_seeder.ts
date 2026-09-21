import { BaseSeeder } from '@adonisjs/lucid/seeders'
import ReportTemplate from '#models/report_template'
import { CONSULTATION_TEMPLATES } from '#services/consultation_templates'

/**
 * Bascule les modèles jusqu'ici codés en dur vers la base.
 * Idempotent : relancer le seeder ne crée pas de doublons.
 */
export default class extends BaseSeeder {
  async run() {
    for (const t of CONSULTATION_TEMPLATES) {
      const existing = await ReportTemplate.findBy('slug', t.id)
      const payload = {
        slug: t.id,
        name: t.label,
        category: t.id === 'generale' ? 'general' : t.id,
        description: `Modèle fourni — ${t.sections.length} rubriques`,
        sections: JSON.stringify(t.sections),
        isBuiltin: true,
        veterinarianId: null,
      }
      if (existing) {
        existing.merge(payload)
        await existing.save()
      } else {
        await ReportTemplate.create(payload)
      }
    }
  }
}
