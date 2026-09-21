import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import { CONSULTATION_TEMPLATES } from '#services/consultation_templates'

/**
 * Parcours d'inscription : on qualifie l'exercice du vétérinaire pour lui
 * proposer d'emblée le bon modèle de compte rendu.
 *
 * Chaque étape est passable : un praticien pressé doit pouvoir entrer dans
 * l'application sans rien remplir. Rien n'est donc obligatoire ici.
 */

/** Types d'exercice. `template` indique le modèle proposé par défaut. */
const PRACTICE_TYPES = [
  { id: 'canine_feline', label: 'Canine et féline', template: 'generale' },
  { id: 'equine', label: 'Équine', template: 'generale' },
  { id: 'rurale', label: 'Rurale', template: 'generale' },
  { id: 'nac', label: 'NAC', template: 'generale' },
  { id: 'urgences', label: 'Urgences', template: 'medecine-interne' },
  { id: 'mixte', label: 'Mixte ou autre', template: 'generale' },
]

const SPECIALTIES = [
  'Médecine générale',
  'Dermatologie',
  'Cardiologie',
  'Neurologie',
  'Ophtalmologie',
  'Orthopédie',
  'Médecine interne',
  'Oncologie',
  'Chirurgie',
  'Comportement',
  'Imagerie',
  'Dentisterie',
  'Nutrition',
  'Reproduction',
]

const TEAM_SIZES = [
  { id: 'solo', label: 'Seul' },
  { id: 'petite_equipe', label: '2 à 3 praticiens' },
  { id: 'clinique', label: '4 à 10 praticiens' },
  { id: 'groupe', label: 'Plus de 10, ou plusieurs sites' },
]

/** La spécialité cochée peut affiner le modèle proposé. */
const SPECIALTY_TEMPLATE: Record<string, string> = {
  Dermatologie: 'dermatologie',
  'Médecine interne': 'medecine-interne',
}

export default class VetOnboardingController {
  /** GET /vet/onboarding/options */
  async options({ response }: HttpContext) {
    return response.ok({
      success: true,
      data: {
        practiceTypes: PRACTICE_TYPES.map(({ id, label }) => ({ id, label })),
        specialties: SPECIALTIES,
        teamSizes: TEAM_SIZES,
        templates: CONSULTATION_TEMPLATES.map((t) => ({ id: t.id, label: t.label })),
      },
    })
  }

  /** GET /vet/onboarding — état courant, pour savoir s'il faut lancer le parcours */
  async show({ response, auth }: HttpContext) {
    const vet = auth.user as any

    return response.ok({
      success: true,
      data: {
        completed: Boolean(vet?.onboardingCompletedAt),
        practiceType: vet?.practiceType ?? null,
        specialties: this.parseSpecialties(vet?.specialties),
        teamSize: vet?.teamSize ?? null,
        defaultTemplate: vet?.defaultTemplate ?? null,
      },
    })
  }

  /**
   * POST /vet/onboarding
   * body : { practiceType?, specialties?: string[], teamSize?, completed?: boolean }
   *
   * Appelée à chaque étape : on enregistre au fil de l'eau plutôt qu'à la fin,
   * pour qu'une fermeture d'onglet ne fasse pas tout recommencer.
   */
  async update({ request, response, auth }: HttpContext) {
    const vet = auth.user as any

    if (!vet) {
      return response.unauthorized({ success: false, message: 'Session expirée' })
    }

    const { practiceType, specialties, teamSize, completed } = request.only([
      'practiceType',
      'specialties',
      'teamSize',
      'completed',
    ])

    if (practiceType !== undefined) {
      const known = PRACTICE_TYPES.find((p) => p.id === practiceType)
      vet.practiceType = known ? known.id : null
      if (known) vet.defaultTemplate = known.template
    }

    if (specialties !== undefined) {
      const clean = Array.isArray(specialties)
        ? specialties.filter((s: unknown) => typeof s === 'string' && SPECIALTIES.includes(s))
        : []
      vet.specialties = JSON.stringify(clean)

      // Une spécialité dominante prime sur le type d'exercice pour le modèle.
      const match = clean.map((s: string) => SPECIALTY_TEMPLATE[s]).find(Boolean)
      if (match) vet.defaultTemplate = match
    }

    if (teamSize !== undefined) {
      vet.teamSize = TEAM_SIZES.some((t) => t.id === teamSize) ? teamSize : null
    }

    if (completed === true) {
      vet.onboardingCompletedAt = DateTime.now()
    }

    await vet.save()

    return response.ok({
      success: true,
      data: {
        completed: Boolean(vet.onboardingCompletedAt),
        defaultTemplate: vet.defaultTemplate ?? null,
      },
    })
  }

  private parseSpecialties(raw: unknown): string[] {
    if (!raw || typeof raw !== 'string') return []
    try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
}
