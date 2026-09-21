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
  {
    id: 'vaccinale',
    label: 'Consultation vaccinale',
    sections: [
      { key: 'motif', label: 'Motif', hint: 'primo-vaccination, rappel, mise à jour' },
      { key: 'etatGeneral', label: 'État général', hint: 'aptitude à la vaccination, température' },
      { key: 'vaccinsAdministres', label: 'Vaccins administrés', hint: 'valences, lot, voie, site' },
      { key: 'antiparasitaires', label: 'Antiparasitaires', hint: 'produit, dose, date' },
      { key: 'conseils', label: 'Conseils au propriétaire', hint: 'effets attendus, surveillance' },
      { key: 'prochaineEcheance', label: 'Prochaine échéance', hint: 'date du prochain rappel' },
    ],
  },
  {
    id: 'urgence',
    label: 'Urgence',
    sections: [
      { key: 'motif', label: "Motif d'admission", hint: 'circonstances, heure de survenue' },
      { key: 'triage', label: 'Triage', hint: "degré d'urgence, état à l'arrivée" },
      { key: 'constantes', label: 'Constantes', hint: 'température, FC, FR, TRC, muqueuses, douleur' },
      { key: 'examenClinique', label: 'Examen clinique', hint: 'par appareil' },
      { key: 'gestesRealises', label: 'Gestes réalisés', hint: 'voie veineuse, oxygène, analgésie' },
      { key: 'examensComplementaires', label: 'Examens complémentaires', hint: 'biologie, imagerie' },
      { key: 'hypotheses', label: 'Hypothèses', hint: 'pistes évoquées' },
      { key: 'orientation', label: 'Orientation', hint: 'hospitalisation, retour, référé' },
      { key: 'consignes', label: 'Consignes au propriétaire', hint: 'signes devant faire reconsulter' },
    ],
  },
  {
    id: 'chirurgie',
    label: 'Compte rendu opératoire',
    sections: [
      { key: 'indication', label: 'Indication', hint: "motif de l'intervention" },
      { key: 'preoperatoire', label: 'Bilan préopératoire', hint: 'examens, classification ASA' },
      { key: 'anesthesie', label: 'Anesthésie', hint: 'protocole, durée, incidents' },
      { key: 'intervention', label: 'Intervention', hint: "voie d'abord, gestes, matériel" },
      { key: 'constatations', label: 'Constatations peropératoires', hint: 'ce qui a été observé' },
      { key: 'suites', label: 'Suites immédiates', hint: 'réveil, analgésie' },
      { key: 'consignes', label: 'Consignes postopératoires', hint: 'repos, pansement, alimentation' },
      { key: 'controle', label: 'Contrôle', hint: 'retrait des points, réévaluation' },
    ],
  },
  {
    id: 'ophtalmologie',
    label: 'Ophtalmologie',
    sections: [
      { key: 'motif', label: 'Motif', hint: 'raison de la venue' },
      { key: 'anamnese', label: 'Anamnèse', hint: 'ancienneté, évolution, traitements essayés' },
      { key: 'oeilDroit', label: 'Œil droit', hint: "annexes, cornée, chambre antérieure, fond d'œil" },
      { key: 'oeilGauche', label: 'Œil gauche', hint: "annexes, cornée, chambre antérieure, fond d'œil" },
      { key: 'testsSpecifiques', label: 'Tests spécifiques', hint: 'Schirmer, fluorescéine, tonométrie' },
      { key: 'hypotheses', label: 'Hypothèses', hint: 'pistes évoquées' },
      { key: 'traitement', label: 'Traitement', hint: 'collyres, voie générale, doses' },
      { key: 'suivi', label: 'Suivi', hint: 'délai de contrôle' },
    ],
  },
  {
    id: 'cardiologie',
    label: 'Cardiologie',
    sections: [
      { key: 'motif', label: 'Motif', hint: "souffle, intolérance à l'effort, syncope" },
      { key: 'anamnese', label: 'Anamnèse', hint: 'évolution, traitements en cours' },
      { key: 'examenClinique', label: 'Examen clinique', hint: 'auscultation, pouls, muqueuses' },
      { key: 'echocardiographie', label: 'Échocardiographie', hint: 'mesures, fonction, valvules' },
      { key: 'ecg', label: 'ECG', hint: 'rythme, fréquence, anomalies' },
      { key: 'pressionArterielle', label: 'Pression artérielle', hint: 'méthode, valeurs' },
      { key: 'conclusion', label: 'Conclusion', hint: 'stade, éléments retenus' },
      { key: 'traitement', label: 'Traitement et suivi', hint: 'molécules, doses, réévaluation' },
    ],
  },
  {
    id: 'neurologie',
    label: 'Neurologie',
    sections: [
      { key: 'motif', label: 'Motif', hint: 'crises, ataxie, déficit' },
      { key: 'anamnese', label: 'Anamnèse', hint: 'début, évolution, fréquence' },
      { key: 'examenGeneral', label: 'Examen général', hint: 'hors neurologie' },
      { key: 'examenNeurologique', label: 'Examen neurologique', hint: 'état mental, nerfs crâniens, posture, réflexes' },
      { key: 'localisation', label: 'Localisation lésionnelle', hint: 'segment suspecté' },
      { key: 'hypotheses', label: 'Hypothèses', hint: 'différentiels envisagés' },
      { key: 'examensComplementaires', label: 'Examens complémentaires', hint: 'imagerie, LCR' },
      { key: 'conduiteATenir', label: 'Conduite à tenir', hint: 'traitement, référé, surveillance' },
    ],
  },
  {
    id: 'orthopedie',
    label: 'Orthopédie',
    sections: [
      { key: 'motif', label: 'Motif', hint: 'boiterie, traumatisme' },
      { key: 'anamnese', label: 'Anamnèse', hint: 'ancienneté, circonstances, évolution' },
      { key: 'examenStatique', label: 'Examen statique', hint: 'aplombs, amyotrophie' },
      { key: 'examenDynamique', label: 'Examen dynamique', hint: 'grade de boiterie, allures' },
      { key: 'palpation', label: 'Palpation et manipulations', hint: 'douleur, tests spécifiques' },
      { key: 'imagerie', label: 'Imagerie', hint: 'incidences, lecture' },
      { key: 'hypotheses', label: 'Hypothèses', hint: 'pistes évoquées' },
      { key: 'conduiteATenir', label: 'Conduite à tenir', hint: 'traitement, chirurgie, repos' },
    ],
  },
  {
    id: 'comportement',
    label: 'Comportement',
    sections: [
      { key: 'motif', label: 'Motif', hint: 'plainte du propriétaire' },
      { key: 'contexte', label: 'Contexte de vie', hint: 'foyer, autres animaux, rythme' },
      { key: 'histoire', label: 'Histoire du trouble', hint: 'apparition, fréquence, déclencheurs' },
      { key: 'observations', label: 'Observations en consultation', hint: 'posture, interactions' },
      { key: 'examenMedical', label: 'Examen médical', hint: 'écarter une cause organique' },
      { key: 'hypotheses', label: 'Hypothèses', hint: 'pistes évoquées' },
      { key: 'planTherapeutique', label: 'Plan thérapeutique', hint: 'mesures, thérapie, molécules' },
      { key: 'suivi', label: 'Suivi', hint: 'échéances, critères de réévaluation' },
    ],
  },
  {
    id: 'echographie',
    label: 'Échographie abdominale',
    sections: [
      { key: 'indication', label: 'Indication', hint: "motif de l'examen" },
      { key: 'conditions', label: "Conditions d'examen", hint: 'préparation, sonde, sédation' },
      { key: 'foieRate', label: 'Foie et rate', hint: 'taille, échostructure, contours' },
      { key: 'digestif', label: 'Tube digestif', hint: 'paroi, contenu, motilité' },
      { key: 'urinaire', label: 'Appareil urinaire', hint: 'reins, vessie' },
      { key: 'autres', label: 'Autres structures', hint: 'surrénales, ganglions, épanchement' },
      { key: 'conclusion', label: 'Conclusion', hint: 'éléments retenus' },
      { key: 'conduiteATenir', label: 'Conduite à tenir', hint: 'suite proposée' },
    ],
  },
  {
    id: 'radiologie',
    label: 'Radiologie',
    sections: [
      { key: 'indication', label: 'Indication', hint: "motif de l'examen" },
      { key: 'incidences', label: 'Incidences réalisées', hint: 'vues, constantes' },
      { key: 'lecture', label: 'Lecture', hint: 'description des structures' },
      { key: 'anomalies', label: 'Anomalies relevées', hint: 'localisation, aspect' },
      { key: 'conclusion', label: 'Conclusion', hint: 'éléments retenus' },
      { key: 'conduiteATenir', label: 'Conduite à tenir', hint: 'examens ou traitement proposés' },
    ],
  },
  {
    id: 'dentisterie',
    label: 'Dentisterie',
    sections: [
      { key: 'motif', label: 'Motif', hint: 'halitose, difficulté à manger, détartrage' },
      { key: 'examenBuccal', label: 'Examen buccal', hint: 'tartre, gencives, mobilité' },
      { key: 'charting', label: 'Charting dentaire', hint: 'dents concernées, lésions' },
      { key: 'radiographie', label: 'Radiographie dentaire', hint: 'incidences, lecture' },
      { key: 'actes', label: 'Actes réalisés', hint: 'détartrage, extractions, sutures' },
      { key: 'traitement', label: 'Traitement', hint: 'analgésie, antibiothérapie si justifiée' },
      { key: 'conseils', label: 'Conseils', hint: 'hygiène, alimentation, contrôle' },
    ],
  },
  {
    id: 'nac',
    label: 'NAC',
    sections: [
      { key: 'espece', label: 'Espèce et identification', hint: 'espèce, âge, sexe, poids' },
      { key: 'conditionsDeVie', label: 'Conditions de vie', hint: 'habitat, température, congénères' },
      { key: 'alimentation', label: 'Alimentation', hint: 'ration, complément, eau' },
      { key: 'motif', label: 'Motif', hint: 'raison de la venue' },
      { key: 'examenClinique', label: 'Examen clinique', hint: "adapté à l'espèce" },
      { key: 'hypotheses', label: 'Hypothèses', hint: 'pistes évoquées' },
      { key: 'traitement', label: 'Traitement', hint: "doses adaptées à l'espèce" },
      { key: 'conseils', label: 'Conseils de maintenance', hint: "corrections d'élevage" },
    ],
  },
  {
    id: 'equine',
    label: 'Consultation équine',
    sections: [
      { key: 'identification', label: 'Identification', hint: 'nom, race, âge, usage' },
      { key: 'motif', label: 'Motif', hint: 'raison de la visite' },
      { key: 'anamnese', label: 'Anamnèse', hint: 'travail, alimentation, antécédents' },
      { key: 'examenGeneral', label: 'Examen général', hint: 'constantes, état corporel' },
      { key: 'examenLocomoteur', label: 'Examen locomoteur', hint: 'statique, dynamique, flexions' },
      { key: 'examensComplementaires', label: 'Examens complémentaires', hint: 'imagerie, anesthésies diagnostiques' },
      { key: 'conclusion', label: 'Conclusion', hint: 'éléments retenus' },
      { key: 'conduiteATenir', label: 'Conduite à tenir', hint: 'traitement, repos, suivi' },
    ],
  },
  {
    id: 'ruminants',
    label: 'Ruminants',
    sections: [
      { key: 'elevage', label: 'Élevage', hint: 'effectif, conduite, bâtiment' },
      { key: 'motif', label: 'Motif', hint: 'individuel ou de troupeau' },
      { key: 'animauxConcernes', label: 'Animaux concernés', hint: 'nombre, identification, lot' },
      { key: 'examenClinique', label: 'Examen clinique', hint: 'constantes, appareils' },
      { key: 'hypotheses', label: 'Hypothèses', hint: 'pistes évoquées' },
      { key: 'prelevements', label: 'Prélèvements', hint: 'nature, laboratoire' },
      { key: 'traitement', label: 'Traitement', hint: "molécules, doses, délai d'attente" },
      { key: 'mesures', label: "Mesures d'élevage", hint: 'prévention, conduite à adapter' },
    ],
  },
  {
    id: 'hospitalisation',
    label: "Suivi d'hospitalisation",
    sections: [
      { key: 'motif', label: "Motif d'hospitalisation", hint: "raison de l'admission" },
      { key: 'constantes', label: 'Constantes du jour', hint: 'température, FC, FR, poids, douleur' },
      { key: 'evolution', label: 'Évolution', hint: 'depuis la dernière évaluation' },
      { key: 'traitementsAdministres', label: 'Traitements administrés', hint: 'molécules, doses, horaires' },
      { key: 'alimentation', label: 'Alimentation et élimination', hint: 'prise alimentaire, urines, selles' },
      { key: 'examens', label: 'Examens du jour', hint: 'biologie, imagerie' },
      { key: 'planDuJour', label: 'Plan pour les 24 h', hint: 'objectifs, surveillance' },
    ],
  },
  {
    id: 'suivi-nutritionnel',
    label: 'Suivi nutritionnel',
    sections: [
      { key: 'motif', label: 'Motif', hint: 'surpoids, maigreur, régime médical' },
      { key: 'mesures', label: 'Mesures', hint: "poids, note d'état corporel" },
      { key: 'alimentationActuelle', label: 'Alimentation actuelle', hint: 'aliment, quantité, friandises' },
      { key: 'activite', label: 'Activité', hint: 'type, durée, fréquence' },
      { key: 'objectif', label: 'Objectif', hint: 'poids cible, échéance' },
      { key: 'planAlimentaire', label: 'Plan alimentaire', hint: 'ration calculée, répartition' },
      { key: 'suivi', label: 'Suivi', hint: 'pesées, ajustements' },
    ],
  },
]

export function findTemplate(id?: string | null): ConsultationTemplate {
  return CONSULTATION_TEMPLATES.find((t) => t.id === id) ?? CONSULTATION_TEMPLATES[0]
}

/**
 * Familles de modèles, pour regrouper la liste à l'écran.
 *
 * Passé quelques modèles, une rangée à plat n'est plus lisible : le praticien
 * cherche « le modèle de dermato », pas le septième bouton. La famille est ici
 * et non sur chaque modèle pour qu'un regroupement se change en un seul point.
 */
export const TEMPLATE_CATEGORIES: Record<string, string> = {
  generale: 'Médecine',
  'medecine-interne': 'Médecine',
  vaccinale: 'Prévention',
  'suivi-nutritionnel': 'Prévention',
  urgence: 'Urgences',
  hospitalisation: 'Urgences',
  chirurgie: 'Chirurgie',
  dentisterie: 'Chirurgie',
  orthopedie: 'Chirurgie',
  echographie: 'Imagerie',
  radiologie: 'Imagerie',
  dermatologie: 'Spécialités',
  ophtalmologie: 'Spécialités',
  cardiologie: 'Spécialités',
  neurologie: 'Spécialités',
  comportement: 'Spécialités',
  nac: 'Filières',
  equine: 'Filières',
  ruminants: 'Filières',
}

export function templateCategory(id: string): string {
  return TEMPLATE_CATEGORIES[id] ?? 'Médecine'
}
