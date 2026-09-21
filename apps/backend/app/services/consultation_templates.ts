/**
 * Modèles de compte rendu.
 *
 * Chaque modèle décrit les rubriques attendues. Le vétérinaire choisit
 * celui qui correspond à sa consultation, et le compte rendu est structuré
 * selon ces rubriques — pas selon une trame unique imposée.
 *
 * `key` sert d'identifiant technique et de clé JSON renvoyée par le modèle ;
 * `label` est affiché au praticien.
 */
export interface TemplateSection {
  key: string
  label: string
  hint: string
}

export interface ConsultationTemplate {
  id: string
  label: string
  sections: TemplateSection[]
}

export const CONSULTATION_TEMPLATES: ConsultationTemplate[] = [
  {
    id: 'generale',
    label: 'Consultation générale',
    sections: [
      { key: 'motif', label: 'Motif', hint: "raison de la venue, telle qu'exprimée" },
      { key: 'anamnese', label: 'Anamnèse', hint: 'historique rapporté par le propriétaire' },
      { key: 'examenClinique', label: 'Examen clinique', hint: 'observations et constantes relevées' },
      { key: 'hypotheses', label: 'Hypothèses', hint: 'pistes évoquées, sans trancher' },
      { key: 'examensComplementaires', label: 'Examens complémentaires', hint: 'examens proposés ou réalisés' },
      { key: 'traitement', label: 'Traitement', hint: 'molécules, doses et durées énoncées' },
      { key: 'conduiteATenir', label: 'Conduite à tenir', hint: 'suite donnée, contrôle, consignes' },
    ],
  },
  {
    id: 'dermatologie',
    label: 'Dermatologie',
    sections: [
      { key: 'motif', label: 'Motif', hint: 'raison de la venue' },
      { key: 'anamnese', label: 'Anamnèse', hint: 'ancienneté, évolution, saisonnalité, contagion' },
      { key: 'lesions', label: 'Lésions observées', hint: 'type, aspect, étendue' },
      { key: 'localisation', label: 'Localisation', hint: 'zones atteintes' },
      { key: 'examenClinique', label: 'Examen clinique', hint: 'reste de l’examen' },
      { key: 'hypotheses', label: 'Hypothèses', hint: 'pistes évoquées' },
      { key: 'examensComplementaires', label: 'Examens complémentaires', hint: 'raclage, cytologie, culture…' },
      { key: 'traitement', label: 'Traitement', hint: 'local et systémique, doses et durées' },
    ],
  },
  {
    id: 'medecine-interne',
    label: 'Médecine interne',
    sections: [
      { key: 'motif', label: 'Motif', hint: 'raison de la venue' },
      { key: 'anamnese', label: 'Anamnèse', hint: 'historique, traitements en cours' },
      { key: 'constantes', label: 'Constantes', hint: 'température, FC, FR, poids, état général' },
      { key: 'examenClinique', label: 'Examen clinique', hint: 'par appareil' },
      { key: 'hypotheses', label: 'Hypothèses', hint: 'diagnostics différentiels évoqués' },
      { key: 'examensComplementaires', label: 'Examens complémentaires', hint: 'biologie, imagerie…' },
      { key: 'traitement', label: 'Traitement', hint: 'molécules, doses et durées' },
      { key: 'suivi', label: 'Suivi', hint: 'contrôle, critères de réévaluation' },
    ],
  },
]

export function findTemplate(id?: string | null): ConsultationTemplate {
  return CONSULTATION_TEMPLATES.find((t) => t.id === id) ?? CONSULTATION_TEMPLATES[0]
}
