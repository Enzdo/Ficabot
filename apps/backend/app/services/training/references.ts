/**
 * Fond documentaire par axe : le « pourquoi » derrière les exercices, les
 * erreurs qui font échouer le travail, et des pistes pour aller plus loin.
 *
 * Les vidéos de `curatedVideos` ont été vérifiées une à une via l'API oEmbed
 * de YouTube, qui renvoie une erreur pour toute vidéo supprimée ou privée :
 * titre et chaîne ci-dessous sont ceux réellement retournés, pas une
 * reconstitution. Une référence inventée ou morte vaut moins que rien.
 *
 * Elles restent doublées d'une recherche préremplie : une vidéo peut être
 * retirée par son auteur, une recherche non.
 */

import type { TrainingAxis } from './questionnaire.js'

export interface AxisReference {
  /** Ce qui se joue vraiment derrière les exercices de cet axe. */
  why: string
  /** Le mécanisme d'apprentissage, en une phrase compréhensible. */
  mechanism: string
  /** Erreurs qui font caler le travail, formulées comme on les rencontre. */
  mistakes: string[]
  /** Repères de progression, pour savoir si on avance. */
  milestones: string[]
  /**
   * Articles du blog à proposer, par slug et dans l'ordre de pertinence.
   * Sélection explicite plutôt que filtre par catégorie : « Comportement »
   * mélange le rappel, le marquage urinaire du chat et la cage de transport,
   * dont deux n'ont rien à faire sur un exercice de rappel.
   */
  blogSlugs: string[]
  /** Filet de sécurité si aucun des slugs n'existe encore en base. */
  blogCategory: string
  /** Requêtes de recherche vidéo, en français. */
  searchTerms: string[]
  /** Vidéos vérifiées via l'API oEmbed de YouTube : elles existent et sont publiques. */
  curatedVideos: { title: string; url: string; source: string }[]
}

export const AXIS_REFERENCES: Record<TrainingAxis, AxisReference> = {
  obedience: {
    why: "Les ordres de base ne servent pas à « avoir un chien obéissant » : ils servent à disposer d'un langage commun utilisable en situation réelle. Un « assis » fiable, c'est ce qui vous permet de gérer un croisement, une porte d'immeuble ou l'arrivée d'un invité sans forcer physiquement votre chien.",
    mechanism:
      "Le chien associe un mot à une position parce qu'elle lui a rapporté quelque chose, et non parce qu'il « comprend » le français. La régularité de la récompense compte donc plus que le ton de la voix.",
    mistakes: [
      "Répéter l'ordre plusieurs fois : le chien apprend que le premier mot ne compte pas, et attend la troisième répétition.",
      "Passer trop vite à l'extérieur : un comportement acquis au salon n'est pas acquis dans la rue, il faut le réapprendre à chaque contexte.",
      "Ne récompenser que quand on a des friandises sur soi : le chien apprend à repérer la main, pas à écouter.",
      "Monter la durée et la distraction en même temps : un seul critère à la fois, sinon l'exercice échoue et la séance se termine sur un échec.",
    ],
    milestones: [
      'Le comportement sort du premier coup, à la maison, 8 fois sur 10.',
      "Le même comportement tient dans une autre pièce, puis dans le jardin ou le hall.",
      'Il tient en extérieur calme, sans friandise visible dans la main.',
      "Il tient avec un passant ou un chien à vingt mètres.",
    ],
    blogSlugs: ['rappel-apprendre-chien-revenir', 'marche-en-laisse-poser-bases-chiot'],
    blogCategory: 'Comportement',
    searchTerms: ['apprendre assis couché chien méthode positive', 'proofing ordres de base chien'],
    curatedVideos: [
      { title: 'Assis, couché, pas bougé, stop… les ordres à apprendre en premier', url: 'https://www.youtube.com/watch?v=xh6xXC73nNE', source: 'EDUC DOG' },
      { title: '[Tuto véto] Apprendre le assis et le pas bouger', url: 'https://www.youtube.com/watch?v=pVGfVrm5Q6g', source: 'Catedog — Conseils Vétérinaires' },
    ]
  },

  recall: {
    why: "Le rappel est le seul comportement dont dépend la sécurité de votre chien. C'est aussi celui qui se dégrade le plus vite : chaque rappel raté, ou suivi de quelque chose de désagréable, enseigne au chien qu'il vaut mieux ne pas revenir.",
    mechanism:
      "Le chien compare en permanence ce que vaut revenir contre ce que vaut rester. Le travail consiste à faire pencher la balance, pas à hausser le ton.",
    mistakes: [
      "Rappeler pour rattacher la laisse et rentrer : le mot finit par annoncer la fin de la liberté, et le chien s'éloigne en l'entendant.",
      'Gronder un chien qui met du temps à revenir : vous punissez le retour, jamais le départ.',
      'Rappeler quand on sait qu\'il ne viendra pas : chaque rappel ignoré affaiblit le mot.',
      "Travailler détaché trop tôt : sans longe, un échec ne peut pas être rattrapé.",
    ],
    milestones: [
      'Il revient de façon fiable à la maison, à quelques mètres.',
      'Il revient en longe de dix mètres, en extérieur calme.',
      "Il coupe une activité modérée (reniflage) pour revenir.",
      "Il revient alors qu'un autre chien joue à distance.",
    ],
    blogSlugs: ['rappel-apprendre-chien-revenir'],
    blogCategory: 'Comportement',
    searchTerms: ['apprendre le rappel chien longe', 'rappel chien renforcement positif'],
    curatedVideos: [
      { title: 'Comment apprendre le RAPPEL de A à Z (guide complet)', url: 'https://www.youtube.com/watch?v=p1QtVfkYbDo', source: 'EDUC DOG' },
      { title: 'Apprendre le rappel facilement et rapidement', url: 'https://www.youtube.com/watch?v=P_-7HG_bEpc', source: 'EDUC DOG' },
      { title: 'Apprendre le rappel au pied à son chien', url: 'https://www.youtube.com/watch?v=ZK8NmJ7QtrE', source: 'Peps et Scot Passion Chiens' },
    ]
  },

  leash: {
    why: "Un chien qui tire ne le fait presque jamais « pour dominer » : il marche simplement plus vite que vous et a appris que tirer fait avancer. La promenade est aussi son principal moment de découverte, d'où l'intensité.",
    mechanism:
      "Tant que tirer permet d'avancer, le comportement est récompensé à chaque pas. L'enjeu est de rendre la laisse tendue inefficace, sans jamais faire mal.",
    mistakes: [
      "Céder après avoir résisté : c'est le pire scénario, le chien apprend qu'il faut insister plus longtemps.",
      "Ne pas offrir de temps de reniflage libre : un chien qui n'a jamais le droit de renifler tire d'autant plus.",
      "Changer d'équipement en espérant régler le problème : le harnais ou le collier ne remplacent pas l'apprentissage.",
      "Travailler la marche quand le chien est plein d'énergie : commencez après une dépense, pas avant.",
    ],
    milestones: [
      'Laisse détendue sur quelques mètres dans le couloir ou le jardin.',
      "La laisse se détend d'elle-même quand vous vous arrêtez.",
      'Une rue calme se fait sans tension permanente.',
      'Un croisement de chien à dix mètres se passe sans se cabrer.',
    ],
    blogSlugs: ['marche-en-laisse-poser-bases-chiot'],
    blogCategory: 'Comportement',
    searchTerms: ['chien qui tire en laisse solution positive', 'marche en laisse détendue apprentissage'],
    curatedVideos: [
      { title: 'Petite astuce pour l\'apprentissage de la marche en laisse', url: 'https://www.youtube.com/watch?v=jyTl8bZsJVM', source: 'Esprit Dog' },
      { title: 'Apprendre le rappel et la marche en laisse à son chiot', url: 'https://www.youtube.com/watch?v=y2rVk2W17TA', source: 'EDUC DOG' },
    ]
  },

  social: {
    why: "La sociabilité n'est pas « aimer tous les chiens ». C'est être capable de croiser, d'ignorer et de se remettre d'une rencontre sans stress. Un chien poli qui n'a pas envie de jouer est parfaitement sociable.",
    mechanism:
      "L'exposition seule ne suffit pas : c'est l'exposition à une distance où le chien reste capable de manger et de vous écouter qui construit la confiance. Trop près, il n'apprend rien, il subit.",
    mistakes: [
      "Forcer le contact « pour qu'il s'habitue » : on obtient l'inverse, une association négative durable.",
      'Laisser les laisses tendues pendant une rencontre : la tension mécanique crée de la tension émotionnelle.',
      'Laisser les rencontres durer : trois secondes puis on repart vaut mieux qu\'une minute qui dégénère.',
      "Traiter un grognement comme une faute à punir : c'est un avertissement utile, le supprimer produit un chien qui mord sans prévenir.",
    ],
    milestones: [
      "Il observe un chien à trente mètres en restant capable de prendre une friandise.",
      'Il se remet en quelques secondes après avoir vu un déclencheur.',
      'Il salue brièvement puis se détourne de lui-même.',
      'Il croise sans réaction en ville, laisse détendue.',
    ],
    blogSlugs: ['sociabiliser-chiot-fenetre-3-12-semaines', 'chien-aboie-trop-comprendre'],
    blogCategory: 'Comportement',
    searchTerms: ['socialisation chien adulte désensibilisation', 'réactivité en laisse chien distance seuil'],
    curatedVideos: [
      { title: 'Chien réactif, l\'erreur à ne pas faire', url: 'https://www.youtube.com/watch?v=LrYz0ReVkMo', source: 'Esprit Dog' },
      { title: 'Chien réactif aux voitures — désensibilisation étape par étape', url: 'https://www.youtube.com/watch?v=2bVZKUIzuk8', source: 'Sentier Canin' },
      { title: 'Chien peureux : le désensibiliser étape par étape', url: 'https://www.youtube.com/watch?v=J1QrcoyoDkM', source: 'Esprit Dog' },
    ]
  },

  calm: {
    why: "Le calme est un apprentissage, pas un trait de caractère. Un chien qui ne sait pas se poser vit en alerte permanente, et cette tension ressort sur tous les autres domaines — aboiements, destructions, difficulté à apprendre.",
    mechanism:
      "On ne peut pas demander le calme : on peut le récompenser quand il apparaît, et construire un endroit où il est facile. La mastication et le reniflage font redescendre le rythme cardiaque bien plus efficacement qu'une longue course.",
    mistakes: [
      "Fatiguer le chien physiquement en espérant l'apaiser : on obtient un athlète qui a besoin de toujours plus.",
      'Faire de grands au revoir et de grandes retrouvailles : cela transforme votre départ en événement.',
      "Dépasser la durée d'absence que le chien supporte : filmez-le pour savoir où est réellement la limite.",
      "Crier sur un chien qui aboie : pour lui, vous aboyez avec lui.",
    ],
    milestones: [
      'Il va se coucher seul sur son tapis quand il y a de l\'activité.',
      "Vous pouvez prendre vos clés sans qu'il s'agite.",
      'Il reste seul dix minutes sans signe de détresse.',
      'Il reste seul deux heures, confirmé par une vidéo.',
    ],
    blogSlugs: ['anxiete-separation-chien-pistes', 'chien-aboie-trop-comprendre'],
    blogCategory: 'Comportement',
    searchTerms: ['anxiété de séparation chien protocole', 'apprendre le calme chien tapis'],
    curatedVideos: [
      { title: '3 étapes pour apprendre à votre chien à rester seul', url: 'https://www.youtube.com/watch?v=q4a7B4O9qpo', source: 'EDUC DOG' },
      { title: 'Laisser son chiot seul à la maison sans stress', url: 'https://www.youtube.com/watch?v=ZQl0LdtyzJc', source: 'EDUC DOG' },
    ]
  },

  daily: {
    why: "Ce sont les comportements du quotidien qui décident si la cohabitation est agréable : propreté, manipulation, vols, sauts. Ils passent souvent après le reste, alors que ce sont eux qu'on subit tous les jours.",
    mechanism:
      "Ces comportements se corrigent en aménageant l'environnement autant qu'en entraînant : ce qui n'est pas accessible n'est pas volé, ce qui n'est pas répété ne s'installe pas.",
    mistakes: [
      "Gronder après coup : un chien n'associe une conséquence qu'aux deux secondes qui précèdent. L'air « coupable » est une réaction à votre colère, pas un aveu.",
      "Nettoyer un accident avec un produit ammoniaqué : l'odeur rappelle l'urine et invite à recommencer. Il faut un nettoyant enzymatique.",
      "Laisser une seule personne accepter les sauts : le comportement se maintient chez tout le monde.",
      "Contraindre pour la manipulation : chaque séance forcée rend la suivante plus difficile.",
    ],
    milestones: [
      'Plus aucun accident sur une semaine complète.',
      'Il se laisse toucher les pattes sans les retirer.',
      'Il garde les quatre pattes au sol à votre arrivée.',
      'La table peut rester desservie quelques minutes sans incident.',
    ],
    blogSlugs: ['eduquer-chiot-proprete-2-semaines', 'soins-griffes-quand-comment-couper-chien-chat', 'brossage-pelage-demeler-lustrer-detecter-parasites', 'nettoyer-oreilles-chien-frequence-technique'],
    blogCategory: 'Hygiène',
    searchTerms: ['propreté chiot apprentissage', 'manipulation soins coopératifs chien'],
    curatedVideos: [
      { title: 'Comment apprendre la propreté à son chien (guide complet)', url: 'https://www.youtube.com/watch?v=b1pScgeb1u4', source: 'EDUC DOG' },
      { title: '3 méthodes faciles pour apprendre la propreté', url: 'https://www.youtube.com/watch?v=h2g0VlA5GnI', source: 'EDUC DOG' },
      { title: 'La propreté du chiot — tutoriel complet', url: 'https://www.youtube.com/watch?v=Bg_jrIGmE5A', source: 'Peps et Scot Passion Chiens' },
    ]
  },
}

/** Recherche YouTube préremplie — un lien qui reste valide dans le temps. */
export function videoSearchUrl(query: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
}
