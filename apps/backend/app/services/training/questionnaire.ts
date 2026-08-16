/**
 * Bilan d'éducation canine — catalogue de questions.
 *
 * Deux familles de questions :
 *  - `TRAINING_QUESTIONS` : notées. Chaque option porte un score 0→1 où 1 est
 *    toujours le comportement le plus abouti, quelle que soit la formulation.
 *  - `CONTEXT_QUESTIONS` : non notées. Elles ne changent pas les notes mais
 *    calibrent le plan (temps disponible, motivation du chien, logement…).
 *    Un plan qui propose 30 min par jour à quelqu'un qui en a 10 ne sert à rien.
 *
 * Le catalogue est servi tel quel à l'app mobile : ajouter une question ici
 * suffit, l'écran s'adapte. En revanche, ne jamais réutiliser un `id` déjà
 * publié pour autre chose — les bilans déjà enregistrés le référencent.
 */

export type TrainingAxis = 'obedience' | 'recall' | 'leash' | 'social' | 'calm' | 'daily'

export interface TrainingAxisInfo {
  key: TrainingAxis
  label: string
  emoji: string
  description: string
}

export const TRAINING_AXES: TrainingAxisInfo[] = [
  {
    key: 'obedience',
    label: 'Obéissance de base',
    emoji: '🎓',
    description: "Assis, couché, pas bouger, attention portée sur vous",
  },
  {
    key: 'recall',
    label: 'Rappel',
    emoji: '📣',
    description: 'Revenir quand on l\'appelle, même avec des distractions',
  },
  {
    key: 'leash',
    label: 'Marche en laisse',
    emoji: '🦮',
    description: 'Promenade sans tirer, gestion des croisements',
  },
  {
    key: 'social',
    label: 'Sociabilité',
    emoji: '🐕‍🦺',
    description: 'Chiens, humains, enfants, partage des ressources',
  },
  {
    key: 'calm',
    label: 'Calme & solitude',
    emoji: '🧘',
    description: 'Rester seul, gérer l\'excitation, les aboiements',
  },
  {
    key: 'daily',
    label: 'Vie quotidienne',
    emoji: '🏠',
    description: 'Propreté, manipulation, destructions, vols',
  },
]

export interface TrainingOption {
  value: string
  label: string
  /** 0 = tout est à construire, 1 = comportement acquis. */
  score: number
}

export interface TrainingQuestion {
  id: string
  axis: TrainingAxis
  text: string
  help?: string
  /** Poids dans la note de l'axe. 2 pour les questions structurantes. */
  weight: number
  options: TrainingOption[]
}

/** Raccourci : 4 options ordonnées du meilleur au moins bon. */
function scale(labels: [string, string, string, string]): TrainingOption[] {
  const scores = [1, 0.66, 0.33, 0]
  return labels.map((label, i) => ({ value: `a${i}`, label, score: scores[i] }))
}

export const TRAINING_QUESTIONS: TrainingQuestion[] = [
  // ── Obéissance de base ──────────────────────────────────────────────────
  {
    id: 'ob_sit',
    axis: 'obedience',
    text: 'Quand vous demandez « Assis », que se passe-t-il ?',
    weight: 1,
    options: scale([
      "Il s'assoit du premier coup, même dehors",
      "Il s'assoit à la maison, moins bien à l'extérieur",
      "Il obéit surtout si j'ai une friandise en main",
      "Il ne connaît pas encore cet ordre",
    ]),
  },
  {
    id: 'ob_down',
    axis: 'obedience',
    text: 'Et sur « Couché » ?',
    weight: 1,
    options: scale([
      'Il se couche du premier coup, même dehors',
      'Il se couche à la maison, moins bien à l\'extérieur',
      'Il faut souvent le guider avec la main ou une friandise',
      'Il ne connaît pas encore cet ordre',
    ]),
  },
  {
    id: 'ob_stay',
    axis: 'obedience',
    text: 'Le « Pas bouger », il le tient combien de temps ?',
    help: 'Pensez à la dernière fois que vous avez essayé, pas au meilleur jour.',
    weight: 2,
    options: scale([
      'Plus de 30 secondes, même si je m\'éloigne',
      'Entre 10 et 30 secondes si je reste à côté',
      'Quelques secondes à peine',
      'Ce n\'est pas travaillé',
    ]),
  },
  {
    id: 'ob_name',
    axis: 'obedience',
    text: 'Quand vous prononcez son nom, vous regarde-t-il ?',
    weight: 2,
    options: scale([
      'Immédiatement, même en pleine distraction',
      'Oui, sauf s\'il y a quelque chose de très intéressant',
      'Il faut répéter plusieurs fois',
      'Il m\'ignore la plupart du temps',
    ]),
  },
  {
    id: 'ob_leave',
    axis: 'obedience',
    text: 'Face à un objet ou de la nourriture au sol, le « Laisse » fonctionne-t-il ?',
    weight: 1,
    options: scale([
      'Oui, il renonce et revient vers moi',
      'Oui à la maison, pas dans la rue',
      'Il hésite mais finit par prendre quand même',
      'Il attrape sans même m\'entendre',
    ]),
  },

  // ── Rappel ──────────────────────────────────────────────────────────────
  {
    id: 're_closed',
    axis: 'recall',
    text: 'Dans un espace clos (jardin, maison), revient-il quand vous l\'appelez ?',
    weight: 1,
    options: scale([
      'Toujours, et rapidement',
      'La plupart du temps',
      'Seulement s\'il n\'a rien de mieux à faire',
      'Rarement ou jamais',
    ]),
  },
  {
    id: 're_open',
    axis: 'recall',
    text: 'En extérieur non clôturé, détaché, revient-il ?',
    weight: 2,
    options: scale([
      'Oui, de façon fiable',
      'Oui, mais il prend son temps',
      'Il faut le suivre ou attendre qu\'il ait fini',
      'Je ne le détache pas, ce serait trop risqué',
    ]),
  },
  {
    id: 're_distraction',
    axis: 'recall',
    text: 'S\'il joue avec un autre chien ou suit une piste, revient-il quand même ?',
    weight: 2,
    options: scale([
      'Oui, il coupe son activité pour revenir',
      'Oui après quelques secondes d\'hésitation',
      'Seulement si je m\'approche de lui',
      'Non, il est totalement inaccessible',
    ]),
  },
  {
    id: 're_reward',
    axis: 'recall',
    text: 'Que se passe-t-il pour lui au moment où il revient ?',
    help: "Un rappel qui annonce systématiquement la fin de la balade finit par être ignoré.",
    weight: 1,
    options: scale([
      'Je le récompense chaleureusement à chaque retour',
      'Je le félicite souvent',
      'Je le rappelle surtout pour rattacher la laisse',
      'Il m\'arrive de le gronder quand il a mis du temps',
    ]),
  },
  {
    id: 're_freedom',
    axis: 'recall',
    text: 'À quelle fréquence le laissez-vous en liberté ?',
    weight: 1,
    options: scale([
      'Régulièrement, en confiance',
      'Dans certains lieux sûrs uniquement',
      'Rarement, j\'ai peur qu\'il parte',
      'Jamais',
    ]),
  },

  // ── Marche en laisse ────────────────────────────────────────────────────
  {
    id: 'le_calm',
    axis: 'leash',
    text: 'Dans une rue calme, comment marche-t-il en laisse ?',
    weight: 2,
    options: scale([
      'Laisse détendue, il reste près de moi',
      'Il tire un peu au début puis se régule',
      'Il tire régulièrement pendant toute la balade',
      'Il tire en permanence, la promenade est pénible',
    ]),
  },
  {
    id: 'le_trigger',
    axis: 'leash',
    text: 'Quand il aperçoit un autre chien, un chat ou un oiseau ?',
    weight: 2,
    options: scale([
      'Il regarde puis revient vers moi tout seul',
      'Il tire un instant puis se calme si je m\'arrête',
      'Il tire fort et je dois le retenir de toutes mes forces',
      'Il se met à bout de laisse, aboie, parfois se cabre',
    ]),
  },
  {
    id: 'le_tension',
    axis: 'leash',
    text: 'Que se passe-t-il quand la laisse se tend ?',
    weight: 1,
    options: scale([
      'Il relâche et revient de lui-même vers moi',
      'Il s\'arrête si je m\'arrête',
      'Il continue jusqu\'à ce que je cède et le suive',
      'Il tire encore plus fort',
    ]),
  },
  {
    id: 'le_heel',
    axis: 'leash',
    text: 'Sait-il marcher au pied sur quelques mètres à la demande ?',
    weight: 1,
    options: scale([
      'Oui, sur une bonne distance',
      'Sur quelques mètres, avec une friandise',
      'Il tient deux ou trois pas maximum',
      'Ce n\'est pas travaillé',
    ]),
  },
  {
    id: 'le_traffic',
    axis: 'leash',
    text: 'Face à un vélo, une poussette ou une voiture qui passe ?',
    weight: 1,
    options: scale([
      'Il reste indifférent',
      'Il regarde mais continue à marcher',
      'Il sursaute ou veut suivre',
      'Il aboie, se jette dessus ou panique',
    ]),
  },

  // ── Sociabilité ─────────────────────────────────────────────────────────
  {
    id: 'so_dogs',
    axis: 'social',
    text: 'Face à un chien inconnu et calme, tenu en laisse ?',
    weight: 2,
    options: scale([
      'Il salue poliment puis passe à autre chose',
      'Il est excité mais sans agressivité',
      'Il grogne, se fige ou évite',
      'Il aboie, tire et cherche le conflit',
    ]),
  },
  {
    id: 'so_people',
    axis: 'social',
    text: 'Quand une personne inconnue entre chez vous ?',
    weight: 1,
    options: scale([
      'Il signale puis se calme rapidement',
      'Il est très excité pendant quelques minutes',
      'Il aboie longtemps ou se cache',
      'Il est franchement menaçant ou terrorisé',
    ]),
  },
  {
    id: 'so_kids',
    axis: 'social',
    text: 'Avec des enfants ?',
    weight: 1,
    options: scale([
      'Doux et posé, même avec des enfants agités',
      'Correct, mais je surveille de près',
      'Il s\'excite vite ou fuit',
      'Il grogne ou je préfère l\'éviter complètement',
    ]),
  },
  {
    id: 'so_puppy',
    axis: 'social',
    text: 'Avant ses 4 mois, a-t-il rencontré des situations variées ?',
    help: 'Chiens, humains, enfants, bruits de ville, voiture, sols glissants…',
    weight: 1,
    options: scale([
      'Oui, beaucoup et de façon positive',
      'Quelques rencontres, sans plus',
      'Très peu, il est resté surtout à la maison',
      'Je ne sais pas, je l\'ai adopté plus tard',
    ]),
  },
  {
    id: 'so_resources',
    axis: 'social',
    text: 'Autour de sa gamelle, d\'un os ou d\'un jouet ?',
    weight: 2,
    options: scale([
      'On peut s\'approcher et échanger sans problème',
      'Il se raidit un peu mais laisse faire',
      'Il grogne si on approche',
      'Il a déjà claqué des dents ou mordu',
    ]),
  },

  // ── Calme & solitude ────────────────────────────────────────────────────
  {
    id: 'ca_departure',
    axis: 'calm',
    text: 'Quand vous préparez vos affaires pour partir ?',
    weight: 1,
    options: scale([
      'Il reste indifférent ou va se coucher',
      'Il me suit mais reste calme',
      'Il s\'agite, halète, tourne en rond',
      'Il panique, gémit ou aboie avant même que je sorte',
    ]),
  },
  {
    id: 'ca_alone',
    axis: 'calm',
    text: 'Combien de temps peut-il rester seul sans difficulté ?',
    weight: 2,
    options: scale([
      'Une demi-journée sans aucun souci',
      'Deux à trois heures',
      'Moins d\'une heure',
      'Il ne supporte pas d\'être seul',
    ]),
  },
  {
    id: 'ca_return',
    axis: 'calm',
    text: 'À votre retour, comment vous accueille-t-il ?',
    weight: 1,
    options: scale([
      'Content mais rapidement posé',
      'Très excité pendant une minute ou deux',
      'Surexcité, il saute, aboie, urine parfois',
      'Il est en détresse : bave, tremblements, dégâts',
    ]),
  },
  {
    id: 'ca_barking',
    axis: 'calm',
    text: 'Comment décririez-vous ses aboiements ?',
    weight: 2,
    options: scale([
      'Rares, et il s\'arrête quand je le lui demande',
      'Il aboie à des déclencheurs précis mais se calme',
      'Il aboie souvent et met du temps à redescendre',
      'Il aboie beaucoup, mes voisins m\'en ont parlé',
    ]),
  },
  {
    id: 'ca_settle',
    axis: 'calm',
    text: 'Arrive-t-il à se poser quand il y a de l\'activité à la maison ?',
    weight: 1,
    options: scale([
      'Oui, il a un endroit où il va se coucher tout seul',
      'Oui après un temps d\'agitation',
      'Il reste en alerte, difficile à faire redescendre',
      'Il est constamment sur le qui-vive',
    ]),
  },

  // ── Vie quotidienne ─────────────────────────────────────────────────────
  {
    id: 'da_house',
    axis: 'daily',
    text: 'Est-il propre à la maison ?',
    weight: 2,
    options: scale([
      'Totalement, plus aucun accident',
      'Quelques accidents rares',
      'Des accidents réguliers',
      'Pas encore propre du tout',
    ]),
  },
  {
    id: 'da_destroy',
    axis: 'daily',
    text: 'Détruit-il des objets quand il est seul ?',
    weight: 1,
    options: scale([
      'Jamais',
      'C\'est arrivé une ou deux fois',
      'Régulièrement, je dois tout ranger',
      'Systématiquement, y compris les meubles ou les portes',
    ]),
  },
  {
    id: 'da_steal',
    axis: 'daily',
    text: 'Vole-t-il de la nourriture (table, plan de travail, poubelle) ?',
    weight: 1,
    options: scale([
      'Jamais, même si je laisse quelque chose à portée',
      'Seulement si l\'occasion est vraiment trop belle',
      'Souvent, dès que j\'ai le dos tourné',
      'En permanence, c\'est un vrai problème',
    ]),
  },
  {
    id: 'da_handling',
    axis: 'daily',
    text: 'Se laisse-t-il manipuler (pattes, oreilles, brossage, griffes) ?',
    weight: 2,
    options: scale([
      'Sans problème, il se laisse faire complètement',
      'Ça se passe bien avec un peu de patience',
      'Il se débat ou s\'échappe',
      'Impossible sans le contraindre à deux',
    ]),
  },
  {
    id: 'da_jump',
    axis: 'daily',
    text: 'Saute-t-il sur les gens pour dire bonjour ?',
    weight: 1,
    options: scale([
      'Jamais, il garde les quatre pattes au sol',
      'Parfois, sur les personnes qu\'il adore',
      'Souvent, il faut que je le retienne',
      'Systématiquement, y compris sur des inconnus',
    ]),
  },
]

export interface ContextQuestion {
  id: string
  text: string
  help?: string
  options: { value: string; label: string }[]
}

export const CONTEXT_QUESTIONS: ContextQuestion[] = [
  {
    id: 'ctx_experience',
    text: 'Quelle est votre expérience avec les chiens ?',
    options: [
      { value: 'first', label: "C'est mon premier chien" },
      { value: 'some', label: "J'en ai déjà eu un ou deux" },
      { value: 'expert', label: "J'ai une longue expérience" },
    ],
  },
  {
    id: 'ctx_time',
    text: 'Combien de temps pouvez-vous consacrer à l\'éducation chaque jour ?',
    help: 'Soyez réaliste : un plan tenu 10 min par jour bat un plan de 30 min abandonné.',
    options: [
      { value: 'short', label: '5 à 10 minutes' },
      { value: 'medium', label: '15 à 20 minutes' },
      { value: 'long', label: '30 minutes ou plus' },
    ],
  },
  {
    id: 'ctx_home',
    text: 'Dans quel environnement vivez-vous ?',
    options: [
      { value: 'flat', label: 'Appartement, sans extérieur privé' },
      { value: 'flat_outdoor', label: 'Appartement avec balcon ou terrasse' },
      { value: 'house', label: 'Maison avec jardin' },
      { value: 'rural', label: 'Campagne, grands espaces' },
    ],
  },
  {
    id: 'ctx_motivation',
    text: 'Qu\'est-ce qui le motive le plus ?',
    options: [
      { value: 'food', label: 'La nourriture' },
      { value: 'toy', label: 'Le jeu et les jouets' },
      { value: 'praise', label: 'Les caresses et la voix' },
      { value: 'hard', label: 'Difficile à motiver' },
    ],
  },
  {
    id: 'ctx_priority',
    text: 'Quelle est votre priorité en ce moment ?',
    options: [
      { value: 'obedience', label: 'Les ordres de base' },
      { value: 'recall', label: 'Le rappel' },
      { value: 'leash', label: 'La marche en laisse' },
      { value: 'social', label: 'Les rencontres avec les autres' },
      { value: 'calm', label: 'Le calme et la solitude' },
      { value: 'daily', label: 'Le quotidien à la maison' },
    ],
  },
  {
    id: 'ctx_pro',
    text: 'Avez-vous déjà travaillé avec un éducateur canin ?',
    options: [
      { value: 'never', label: 'Jamais' },
      { value: 'few', label: 'Quelques séances' },
      { value: 'regular', label: 'Un suivi régulier' },
    ],
  },
]

/** Index par id, pour noter sans reparcourir le tableau à chaque réponse. */
export const QUESTIONS_BY_ID = new Map(TRAINING_QUESTIONS.map((q) => [q.id, q]))
export const CONTEXT_BY_ID = new Map(CONTEXT_QUESTIONS.map((q) => [q.id, q]))

/** Libellés lisibles côté humain, réutilisés dans le prompt et l'app. */
export const AXIS_LABEL: Record<TrainingAxis, string> = TRAINING_AXES.reduce(
  (acc, a) => ({ ...acc, [a.key]: a.label }),
  {} as Record<TrainingAxis, string>
)
