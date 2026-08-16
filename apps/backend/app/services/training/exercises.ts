/**
 * Bibliothèque d'exercices — filet de sécurité du générateur de plan.
 *
 * `OPENAI_API_KEY` est optionnelle côté env : sans ce repli, la fonctionnalité
 * serait simplement cassée sur un déploiement sans clé, et un incident OpenAI
 * rendrait le bilan inutilisable. Le plan produit ici est moins personnalisé
 * (il ne tient pas compte de la race) mais il est complet et cohérent.
 *
 * Chaque axe propose trois exercices d'intensité croissante : `easy` sert de
 * base, `medium` généralise, `hard` ajoute la distraction.
 */

import type { TrainingAxis } from './questionnaire.js'

export interface Exercise {
  title: string
  axis: TrainingAxis
  duration: string
  steps: string[]
  tip: string
}

type Tier = 'easy' | 'medium' | 'hard'

export const EXERCISE_LIBRARY: Record<TrainingAxis, Record<Tier, Exercise>> = {
  obedience: {
    easy: {
      title: 'Le contact visuel',
      axis: 'obedience',
      duration: '3 min, 2 fois par jour',
      steps: [
        'Dans une pièce calme, tenez une friandise près de votre visage.',
        'Attendez sans rien dire : dès que votre chien vous regarde dans les yeux, dites « Oui ! » et donnez.',
        'Répétez dix fois, puis retirez la friandise de votre main et attendez le même regard.',
        'Ajoutez le mot « Regarde » juste avant qu\'il ne lève les yeux.',
      ],
      tip: "Ne répétez jamais le mot deux fois : attendez. Un ordre répété apprend au chien qu'il a le droit d'ignorer le premier.",
    },
    medium: {
      title: 'Assis / couché en alternance',
      axis: 'obedience',
      duration: '5 min par jour',
      steps: [
        'Demandez « Assis », récompensez, puis « Couché », récompensez.',
        'Alternez dans un ordre imprévisible pour qu\'il écoute vraiment le mot.',
        'Passez progressivement d\'une récompense à chaque fois à une récompense une fois sur deux.',
        'Refaites la séquence debout, assis sur une chaise, puis de dos.',
      ],
      tip: 'Terminez toujours sur une réussite, même facile.',
    },
    hard: {
      title: 'Le « Pas bouger » qui tient',
      axis: 'obedience',
      duration: '5 min par jour',
      steps: [
        'Demandez « Assis », dites « Pas bouger », comptez 3 secondes, revenez le récompenser à sa place.',
        'Augmentez d\'abord la durée (jusqu\'à 30 s), puis la distance (un pas, deux pas), puis les deux.',
        'Si le chien se lève, ce n\'est pas une faute : revenez à l\'étape précédente.',
        'Terminez par un mot de libération clair et toujours le même, comme « C\'est bon ».',
      ],
      tip: 'Ne montez qu\'un seul critère à la fois : durée, distance ou distraction. Jamais deux ensemble.',
    },
  },

  recall: {
    easy: {
      title: 'Le rappel jackpot',
      axis: 'recall',
      duration: '5 min par jour, à la maison',
      steps: [
        'Choisissez un mot de rappel neuf, jamais utilisé pour gronder.',
        'À un mètre de lui, prononcez le mot une seule fois sur un ton joyeux.',
        'Dès qu\'il arrive, donnez trois friandises d\'affilée plutôt qu\'une seule.',
        'Répétez cinq fois par séance, en augmentant la distance dans la maison.',
      ],
      tip: 'Le rappel doit toujours être la meilleure nouvelle de sa journée. Ne l\'utilisez jamais pour le gronder, le laver ou finir la balade.',
    },
    medium: {
      title: 'Le rappel ping-pong',
      axis: 'recall',
      duration: '10 min, 3 fois par semaine',
      steps: [
        'À deux personnes, placez-vous à dix mètres l\'un de l\'autre dans un lieu clos.',
        'Appelez-le chacun à votre tour et récompensez à chaque arrivée.',
        'Augmentez la distance progressivement jusqu\'à trente mètres.',
        'Terminez en le laissant repartir jouer : arriver ne signifie pas la fin de la liberté.',
      ],
      tip: 'Utilisez une longe de 10 m dans un lieu non clos : jamais de rappel raté par manque de sécurité.',
    },
    hard: {
      title: 'Rappel avec distraction',
      axis: 'recall',
      duration: '10 min, 3 fois par semaine',
      steps: [
        'En longe, laissez-le renifler ou observer un autre chien à bonne distance.',
        'Appelez une seule fois, au moment où il est encore capable d\'entendre.',
        'S\'il ne vient pas, rapprochez-vous en gardant la longe tendue sans tirer, et récompensez dès qu\'il se tourne.',
        'Réduisez la distance à la distraction séance après séance.',
      ],
      tip: "Si vous devez appeler deux fois, la distraction était trop forte : reculez de cinq mètres.",
    },
  },

  leash: {
    easy: {
      title: 'La laisse détendue à la maison',
      axis: 'leash',
      duration: '5 min par jour',
      steps: [
        'Attachez la laisse dans le couloir, sans objectif de destination.',
        'Faites un pas. Si la laisse reste détendue, récompensez au niveau de votre jambe.',
        'Enchaînez deux pas, trois pas, en récompensant toujours à hauteur de votre cuisse.',
        'Passez ensuite dans le jardin ou le hall d\'immeuble.',
      ],
      tip: 'Récompensez toujours à la position que vous voulez obtenir, jamais devant vous.',
    },
    medium: {
      title: "L'arbre et le demi-tour",
      axis: 'leash',
      duration: 'À chaque promenade',
      steps: [
        'Dès que la laisse se tend, arrêtez-vous net et devenez immobile comme un arbre.',
        'Attendez que la tension disparaisse d\'elle-même, puis repartez.',
        "S'il ne cède pas au bout de dix secondes, faites demi-tour et marchez dans l'autre sens.",
        'Récompensez chaque fois qu\'il revient spontanément à votre hauteur.',
      ],
      tip: 'Soyez d\'une régularité absolue pendant deux semaines. Une seule promenade où il tire et réussit à avancer annule des jours de travail.',
    },
    hard: {
      title: 'Croisements maîtrisés',
      axis: 'leash',
      duration: '15 min, 3 fois par semaine',
      steps: [
        'Repérez un endroit où passent des chiens ou des vélos, et placez-vous assez loin pour que votre chien reste capable de manger.',
        'Dès qu\'il aperçoit le déclencheur, dites « Oui ! » et récompensez, même s\'il regarde encore.',
        'Répétez à chaque passage : il doit associer le déclencheur à quelque chose de bon.',
        'Réduisez la distance de deux mètres à chaque séance réussie.',
      ],
      tip: "S'il refuse la friandise, vous êtes trop près : reculez jusqu'à ce qu'il puisse à nouveau manger.",
    },
  },

  social: {
    easy: {
      title: 'Observation à distance',
      axis: 'social',
      duration: '10 min, 3 fois par semaine',
      steps: [
        'Asseyez-vous sur un banc à bonne distance d\'un lieu de passage.',
        'Laissez votre chien observer sans jamais l\'obliger à approcher.',
        'Récompensez chaque regard calme et chaque retour d\'attention vers vous.',
        'Partez avant qu\'il ne montre le moindre signe de tension.',
      ],
      tip: 'Regarder sans interagir est un exercice à part entière : la sociabilité se construit dans le calme, pas dans le contact forcé.',
    },
    medium: {
      title: 'Rencontres choisies',
      axis: 'social',
      duration: '2 fois par semaine',
      steps: [
        'Organisez une rencontre avec un chien adulte, équilibré et connu.',
        'Marchez côte à côte pendant plusieurs minutes avant de laisser le contact.',
        'Limitez la rencontre à trois secondes, puis rappelez et repartez.',
        'Répétez plusieurs fois : des salutations courtes valent mieux qu\'une longue.',
      ],
      tip: 'Laisses détendues des deux côtés. Une laisse tendue transforme une rencontre neutre en tension.',
    },
    hard: {
      title: "L'échange plutôt que la confiscation",
      axis: 'social',
      duration: '5 min par jour',
      steps: [
        'Donnez-lui un objet de faible valeur.',
        'Approchez-vous, jetez une friandise meilleure au sol à un mètre, sans jamais tendre la main vers l\'objet.',
        'Pendant qu\'il mange, récupérez l\'objet et rendez-le-lui immédiatement.',
        'Montez très progressivement la valeur de l\'objet de départ.',
      ],
      tip: "En cas de grognement sur la nourriture ou de morsure déjà survenue, arrêtez et faites appel à un comportementaliste : ce travail ne s'improvise pas seul.",
    },
  },

  calm: {
    easy: {
      title: 'Le tapis de décompression',
      axis: 'calm',
      duration: '10 min par jour',
      steps: [
        'Installez un tapis dédié dans un coin calme mais pas isolé.',
        'Récompensez chaque fois qu\'il y pose spontanément une patte, puis s\'y couche.',
        'Ne l\'appelez jamais depuis ce tapis : c\'est son endroit à lui.',
        'Donnez-lui un os à mâcher dessus pour créer une association durable.',
      ],
      tip: 'Mâcher fait redescendre le rythme cardiaque. Dix minutes de mastication valent une promenade en termes de fatigue mentale.',
    },
    medium: {
      title: 'Départs sans conséquence',
      axis: 'calm',
      duration: '10 min par jour',
      steps: [
        'Prenez vos clés, votre manteau, puis rasseyez-vous sans sortir. Répétez jusqu\'à indifférence.',
        'Sortez, refermez la porte, revenez au bout de cinq secondes.',
        'Augmentez la durée de façon irrégulière : 10 s, 5 s, 30 s, 15 s.',
        'Aucun au revoir, aucune fête au retour : sortir et rentrer doit devenir banal.',
      ],
      tip: "Ne dépassez jamais la durée à laquelle il commence à s'agiter. Filmez-le pour savoir où est cette limite.",
    },
    hard: {
      title: 'Le protocole anti-aboiement',
      axis: 'calm',
      duration: 'À chaque déclenchement',
      steps: [
        'Identifiez précisément ce qui déclenche les aboiements et à quelle distance.',
        'Intervenez avant l\'aboiement : au premier regard, appelez-le et récompensez son retour.',
        'S\'il aboie déjà, éloignez-le calmement sans crier, puis reprenez plus loin.',
        'Occultez la vue sur la rue si les aboiements viennent de la fenêtre.',
      ],
      tip: 'Crier sur un chien qui aboie revient à aboyer avec lui : il se sent conforté.',
    },
  },

  daily: {
    easy: {
      title: 'Propreté : le rythme fixe',
      axis: 'daily',
      duration: 'Toute la journée',
      steps: [
        'Sortez au réveil, après chaque repas, après chaque sieste et après chaque jeu.',
        'Restez dehors sans parler jusqu\'à ce qu\'il fasse, puis récompensez dans les deux secondes.',
        'En cas d\'accident à l\'intérieur, nettoyez sans gronder, avec un produit enzymatique.',
        'Notez les horaires pendant une semaine pour repérer son rythme réel.',
      ],
      tip: 'Récompenser dehors fonctionne. Gronder dedans apprend seulement à se cacher pour faire.',
    },
    medium: {
      title: 'Manipulation en douceur',
      axis: 'daily',
      duration: '3 min par jour',
      steps: [
        'Touchez une patte une seconde, récompensez, relâchez.',
        'Passez à deux secondes, puis soulevez légèrement la patte.',
        'Faites de même avec les oreilles, la gueule, la queue, séparément.',
        'Introduisez la brosse ou le coupe-griffes posé au sol avant de vous en servir.',
      ],
      tip: 'Arrêtez toujours avant qu\'il ne retire la patte lui-même : c\'est vous qui décidez de la fin.',
    },
    hard: {
      title: 'Quatre pattes au sol',
      axis: 'daily',
      duration: 'À chaque arrivée',
      steps: [
        'Quand il saute, tournez-vous et croisez les bras sans rien dire.',
        'Dès que les quatre pattes touchent le sol, tournez-vous et récompensez au niveau du sol.',
        'Demandez la même chose à toutes les personnes qui entrent, sans exception.',
        'Anticipez en demandant « Assis » avant l\'ouverture de la porte.',
      ],
      tip: 'Une seule personne qui accepte les sauts entretient le comportement chez tout le monde.',
    },
  },
}

const TIER_BY_SCORE = (score: number): Tier => (score < 35 ? 'easy' : score < 65 ? 'medium' : 'hard')

/**
 * Construit un plan de quatre semaines à partir des axes les plus faibles.
 * Semaines 1-2 sur l'axe le plus faible, semaine 3 sur le deuxième, semaine 4
 * en consolidation des deux.
 */
export function buildFallbackPlan(params: {
  petName: string
  breed: string | null
  scores: Record<TrainingAxis, number>
  weakest: TrainingAxis[]
  axisLabel: Record<TrainingAxis, string>
  sessionsPerDay: string
}) {
  const { petName, breed, scores, weakest, axisLabel, sessionsPerDay } = params
  const [first, second = first, third = second] = weakest

  const pick = (axis: TrainingAxis, bump = 0): Exercise => {
    const tiers: Tier[] = ['easy', 'medium', 'hard']
    const base = tiers.indexOf(TIER_BY_SCORE(scores[axis]))
    return EXERCISE_LIBRARY[axis][tiers[Math.min(base + bump, 2)]]
  }

  return {
    summary:
      `${petName} obtient ${Math.round(
        Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length
      )}/100 au bilan. Le travail des quatre prochaines semaines porte en priorité sur ` +
      `« ${axisLabel[first]} », puis « ${axisLabel[second]} ». Les autres domaines sont ` +
      `entretenus mais ne sont pas le chantier du moment.`,
    breedInsight: breed
      ? `Plan générique : les spécificités de la race ${breed} n'ont pas pu être intégrées automatiquement. Relancez la génération plus tard pour un plan adapté à la race.`
      : 'Aucune race renseignée sur la fiche : complétez-la pour obtenir un plan adapté aux prédispositions de votre chien.',
    priorities: [first, second, third]
      .filter((a, i, arr) => arr.indexOf(a) === i)
      .map((axis) => ({
        axis,
        title: axisLabel[axis],
        why: `Note actuelle : ${scores[axis]}/100. C'est le domaine où la marge de progression est la plus grande.`,
      })),
    weeks: [
      {
        week: 1,
        theme: `${axisLabel[first]} — poser les bases`,
        goal: `Obtenir le comportement dans un environnement calme, sans distraction.`,
        sessions: sessionsPerDay,
        exercises: [pick(first), pick('obedience')],
        successCriteria: 'Le comportement est obtenu 8 fois sur 10 à la maison.',
      },
      {
        week: 2,
        theme: `${axisLabel[first]} — généraliser`,
        goal: 'Reproduire le même comportement dans une autre pièce, puis dehors au calme.',
        sessions: sessionsPerDay,
        exercises: [pick(first, 1), pick(second)],
        successCriteria: 'Le comportement tient dans deux lieux différents de la maison.',
      },
      {
        week: 3,
        theme: `${axisLabel[second]} — ouvrir un second chantier`,
        goal: `Travailler « ${axisLabel[second]} » tout en entretenant les acquis de la semaine 1.`,
        sessions: sessionsPerDay,
        exercises: [pick(second, 1), pick(first, 1)],
        successCriteria: 'Les deux comportements sont obtenus séparément sans hésitation.',
      },
      {
        week: 4,
        theme: 'Consolidation avec distraction',
        goal: 'Tenir les acquis en présence de distractions modérées.',
        sessions: sessionsPerDay,
        exercises: [pick(first, 2), pick(second, 2), pick(third, 1)],
        successCriteria:
          'Le comportement est obtenu en extérieur, avec un passant ou un chien à vingt mètres.',
      },
    ],
    dailyRoutine: [
      'Deux à trois micro-séances de 3 à 5 minutes, jamais une longue séance.',
      'Une sortie de reniflage en longe, sans objectif d\'éducation : c\'est du repos mental.',
      'Dix minutes de mastication le soir pour faire redescendre l\'excitation.',
      'Un moment de calme sur le tapis pendant que vous vaquez à vos occupations.',
    ],
    mistakesToAvoid: [
      'Répéter un ordre plusieurs fois : cela apprend au chien que le premier ne compte pas.',
      'Monter deux critères en même temps (durée et distraction, par exemple).',
      'Gronder après coup : un chien n\'associe une conséquence qu\'aux deux secondes qui précèdent.',
      'Sauter une étape parce que « ça marche à la maison » : chaque nouveau lieu est un nouvel apprentissage.',
    ],
    whenToSeePro:
      "Consultez un éducateur canin comportementaliste sans attendre en cas de grognement sur la nourriture, de morsure même légère, de panique lors des absences, ou si aucun progrès n'apparaît après trois semaines de travail régulier.",
  }
}
