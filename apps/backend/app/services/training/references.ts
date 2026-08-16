/**
 * Fond documentaire par axe : le « pourquoi » derrière les exercices, les
 * erreurs qui font échouer le travail, et des pistes pour aller plus loin.
 *
 * Note sur les vidéos : aucune URL de vidéo précise n'est codée en dur ici.
 * Une référence inventée ou un lien mort valent moins que rien — ils font
 * perdre confiance dans tout le reste. On fournit donc des recherches
 * préremplies, qui restent valides dans le temps. Le jour où vous disposez
 * d'une liste de vidéos validées, elle a sa place dans `curatedVideos`.
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
  /** Catégorie d'articles du blog à proposer sur cet axe. */
  blogCategory: string
  /** Requêtes de recherche vidéo, en français. */
  searchTerms: string[]
  /** Vidéos validées à la main. Vide tant que personne ne les a vérifiées. */
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
    blogCategory: 'education',
    searchTerms: ['apprendre assis couché chien méthode positive', 'proofing ordres de base chien'],
    curatedVideos: [],
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
    blogCategory: 'education',
    searchTerms: ['apprendre le rappel chien longe', 'rappel chien renforcement positif'],
    curatedVideos: [],
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
    blogCategory: 'education',
    searchTerms: ['chien qui tire en laisse solution positive', 'marche en laisse détendue apprentissage'],
    curatedVideos: [],
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
    blogCategory: 'comportement',
    searchTerms: ['socialisation chien adulte désensibilisation', 'réactivité en laisse chien distance seuil'],
    curatedVideos: [],
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
    blogCategory: 'comportement',
    searchTerms: ['anxiété de séparation chien protocole', 'apprendre le calme chien tapis'],
    curatedVideos: [],
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
    blogCategory: 'education',
    searchTerms: ['propreté chiot apprentissage', 'manipulation soins coopératifs chien'],
    curatedVideos: [],
  },
}

/** Recherche YouTube préremplie — un lien qui reste valide dans le temps. */
export function videoSearchUrl(query: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
}
