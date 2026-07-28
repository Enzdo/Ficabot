/**
 * Catalogue des profils d'animaux.
 *
 * La base ne connaît que 3 espèces (dog / cat / nac). Ici on décrit des "kinds"
 * plus fins (lapin, rongeur, furet, oiseau, reptile…) qui pilotent :
 *   - l'habillage visuel (accent, dégradé, emoji)
 *   - le vocabulaire de l'onboarding conversationnel
 *   - les conseils affichés selon le stade de vie
 *
 * Un kind NAC est reconstruit depuis `pet.breed` via `resolveKind()`, ce qui
 * évite d'ajouter une colonne en base : `breedPrefill` sert de repli quand
 * l'utilisateur ne précise pas la race.
 */

import { colors } from './theme'
import type { Species } from '@/types'

export type PetKind = 'dog' | 'cat' | 'rabbit' | 'rodent' | 'ferret' | 'bird' | 'reptile' | 'other'
export type LifeStageKey = 'baby' | 'adult' | 'senior'

export interface Tip {
  emoji: string
  title: string
  body: string
  /** Le mécanisme derrière le conseil : ce qui le rend compréhensible. */
  why: string
}

export interface EducationTopic {
  emoji: string
  title: string
  body: string
  why: string
  /** Méthode concrète, dans l'ordre. */
  steps: string[]
}

export interface LifeStage {
  key: LifeStageKey
  /** Libellé propre à l'espèce : « Chiot », « Lapereau »… */
  label: string
  /** Borne haute exclusive, en mois. Infinity pour le dernier stade. */
  maxMonths: number
  tips: Tip[]
  education: EducationTopic[]
}

export interface AgeChip {
  label: string
  /** Âge représentatif de la tranche, en mois (sert à estimer une date de naissance). */
  months: number
}

export interface PetKindProfile {
  kind: PetKind
  /** Espèce réellement stockée en base. */
  species: Species
  /** « Chien » */
  label: string
  /** Réponse affichée dans la bulle utilisateur : « Un chien » */
  answerLabel: string
  /** Réaction du bot juste après le choix de l'espèce. */
  intro: string
  emoji: string
  /** Race écrite par défaut si l'utilisateur ne précise rien (permet de retrouver le kind). */
  breedPrefill: string
  accent: string
  accentSoft: string
  gradient: [string, string]
  breedQuestion: string
  breedSuggestions: string[]
  ageChips: AgeChip[]
  weightHint: string
  stages: LifeStage[]
}

// ─── Conseils ────────────────────────────────────────────────────────────────

const DOG_STAGES: LifeStage[] = [
  {
    key: 'baby', label: 'Chiot', maxMonths: 12,
    tips: [
      {
        emoji: '💉', title: 'Le protocole vaccinal se termine vers 16 semaines',
        body: 'Les injections s\'enchaînent toutes les 3 à 4 semaines, avec un rappel un an plus tard. Notez chaque date dans son carnet de santé.',
        why: 'Les anticorps transmis par sa mère le protègent puis disparaissent, à une date impossible à prévoir entre 6 et 16 semaines. Tant qu\'ils sont là, ils neutralisent aussi le vaccin. On répète donc les injections pour ne pas laisser de fenêtre où le chiot n\'est plus couvert par sa mère et pas encore par le vaccin.',
      },
      {
        emoji: '🐾', title: 'La fenêtre de socialisation se referme vite',
        body: 'Jusqu\'à environ 4 mois, faites-lui découvrir un maximum de bruits, sols, personnes et congénères — toujours en douceur et sans le forcer.',
        why: 'À cette période, son cerveau constitue la liste de ce qui fait partie du monde normal. Tout ce qui n\'y figure pas devient ensuite suspect par défaut : c\'est ce qui explique qu\'un chien adulte panique devant un parapluie ou un enfant s\'il n\'en a jamais croisé avant ses 4 mois.',
      },
      {
        emoji: '🍽️', title: '3 repas par jour jusqu\'à 6 mois',
        body: 'Une alimentation « junior » adaptée à sa taille adulte estimée : les besoins d\'un futur grand chien n\'ont rien à voir avec ceux d\'un petit format.',
        why: 'Son estomac est trop petit pour absorber en deux fois l\'énergie que réclame sa croissance. Et chez les grandes races, un excès de calcium ou une croissance trop rapide fragilisent les cartilages articulaires, qui n\'ont pas fini de se solidifier avant 12 à 18 mois.',
      },
    ],
    education: [
      {
        emoji: '🚪', title: 'La propreté s\'obtient par le rythme, pas par la punition',
        body: 'Sortez-le après chaque sieste, chaque repas et chaque session de jeu, toujours au même endroit, et fêtez le résultat dehors dans les trois secondes.',
        why: 'Un chiot de 2 mois ne retient pas physiquement plus de 2 à 3 heures : son sphincter n\'est pas mature. Gronder un accident déjà fait ne lui apprend rien sur l\'endroit, mais lui apprend à se cacher pour faire — ce qui rend la suite bien plus difficile.',
        steps: [
          'Sortie systématique au réveil, après manger et après jouer',
          'Toujours le même coin, en restant silencieux le temps qu\'il cherche',
          'Récompense immédiate dès qu\'il a fini, jamais une fois rentré',
          'Accident à l\'intérieur : nettoyer sans lui parler, avec un produit enzymatique',
        ],
      },
      {
        emoji: '📣', title: 'Construire un rappel avant qu\'il n\'en ait besoin',
        body: 'Apprenez le rappel en intérieur, sans distraction, quand il vient déjà spontanément vers vous. Ne l\'appelez jamais pour mettre fin à quelque chose d\'agréable.',
        why: 'Le mot « viens » n\'a aucun sens en soi : il devient un ordre parce qu\'il prédit systématiquement quelque chose de bien. Si vous ne l\'utilisez que pour rentrer du parc ou pour le mettre en laisse, il finit par prédire la fin du plaisir, et le chien apprend à l\'ignorer.',
        steps: [
          'Prononcer son nom + « viens » uniquement quand il se dirige déjà vers vous',
          'Récompenser à chaque fois les 200 premières répétitions, sans exception',
          'Rappeler parfois en pleine balade juste pour récompenser puis relâcher',
          'Ne jamais rappeler pour gronder, laver ou enfermer',
        ],
      },
      {
        emoji: '🦴', title: 'La mordillement se canalise, il ne se supprime pas',
        body: 'Quand ses dents touchent la peau, le jeu s\'arrête net pendant dix secondes, puis vous lui proposez un jouet à mâcher.',
        why: 'Le chiot découvre le monde avec la gueule et apprend le contrôle de sa mâchoire auprès de sa fratrie : quand il mord trop fort, le jeu s\'arrête. Reproduire cette règle lui enseigne la mesure. Le punir physiquement, au contraire, transforme la main humaine en menace.',
        steps: [
          'Contact dent-peau → « aïe », vous retirez la main et cessez toute interaction',
          'Reprise du jeu après quelques secondes de calme',
          'Toujours un jouet à mâcher accessible à proximité',
          'Prévoir des temps de repos : un chiot fatigué mordille dix fois plus',
        ],
      },
    ],
  },
  {
    key: 'adult', label: 'Adulte', maxMonths: 84,
    tips: [
      {
        emoji: '🦷', title: 'Le tartre est le premier motif de soins dentaires',
        body: 'Un brossage 2 à 3 fois par semaine, commencé progressivement, retarde nettement le premier détartrage sous anesthésie.',
        why: 'La plaque se minéralise en tartre en 48 à 72 heures. Passé ce délai, plus aucun brossage ne l\'enlève. Le tartre entretient une inflammation des gencives qui déchausse les dents et diffuse des bactéries dans le sang, avec un retentissement démontré sur le cœur et les reins.',
      },
      {
        emoji: '🏃', title: 'Comptez au moins 1 h d\'activité par jour',
        body: 'Variez marche, jeu et travail d\'odorat : la stimulation mentale fatigue autant qu\'une longue balade.',
        why: 'Un chien consacre une part énorme de son cerveau à l\'olfaction. Chercher une friandise dans l\'herbe pendant dix minutes le sollicite autant qu\'une demi-heure de course, et fait redescendre son niveau de stress — ce qu\'une dépense purement physique, elle, peut au contraire entretenir.',
      },
      {
        emoji: '📅', title: 'Une visite de contrôle par an suffit généralement',
        body: 'Rappels de vaccins, poids, dents et vermifuge en une seule consultation — l\'occasion de repérer ce qui passe inaperçu au quotidien.',
        why: 'Un an de chien adulte équivaut à environ cinq ans d\'humain. Beaucoup de choses changent en douze mois, et un souffle cardiaque ou une masse débutante sont indolores : c\'est le vétérinaire qui les trouve, pas le propriétaire.',
      },
    ],
    education: [
      {
        emoji: '🪢', title: 'La laisse détendue s\'apprend en marchant lentement',
        body: 'Dès que la laisse se tend, vous vous arrêtez. Vous ne repartez que lorsqu\'elle se détend. Une balade d\'apprentissage se fait sur 200 mètres, pas sur 3 km.',
        why: 'Tirer fonctionne : le chien tire, il avance, donc il tire encore. Tant que la traction fait progresser, elle se renforce toute seule. S\'arrêter supprime la récompense — c\'est la seule chose qui casse la boucle, bien plus que n\'importe quel collier.',
        steps: [
          'Laisse tendue → arrêt immédiat, sans à-coup ni parole',
          'Attendre le relâchement, même de quelques centimètres',
          'Repartir dès que la laisse pend',
          'Récompenser les moments où il marche à votre hauteur de lui-même',
        ],
      },
      {
        emoji: '🧩', title: 'Remplacer une gamelle par du travail d\'odorat',
        body: 'Éparpillez une partie de sa ration dans l\'herbe ou dans un tapis de fouille au lieu de la donner dans la gamelle.',
        why: 'Manger dans une gamelle prend 40 secondes et n\'apporte rien mentalement. Chercher la même quantité au nez occupe vingt minutes et déclenche une baisse mesurable du niveau de stress. C\'est le meilleur rapport effort/résultat contre les destructions et l\'agitation du soir.',
        steps: [
          'Prélever un tiers de la ration quotidienne',
          'L\'éparpiller dans l\'herbe, un tapis de fouille ou un jouet distributeur',
          'Le laisser chercher seul, sans l\'aider ni le presser',
          'Augmenter la difficulté quand il trouve trop vite',
        ],
      },
      {
        emoji: '🛋️', title: 'Un vrai signal de fin d\'interaction',
        body: 'Apprenez-lui un mot qui annonce que rien ne va plus se passer : « c\'est fini », suivi de votre indifférence complète.',
        why: 'Beaucoup de chiens sollicitent en permanence parce qu\'ils n\'ont aucun moyen de savoir quand s\'arrêter d\'espérer. Un signal clair, toujours suivi du même comportement de votre part, remplace l\'attente par de la prévisibilité — et la prévisibilité est ce qui apaise un chien.',
        steps: [
          'Choisir un mot et un geste toujours identiques',
          'Après le signal, ne plus le regarder ni lui parler, même s\'il insiste',
          'Tenir bon les premières fois : l\'insistance augmente avant de disparaître',
          'Reprendre l\'interaction plus tard, à votre initiative',
        ],
      },
    ],
  },
  {
    key: 'senior', label: 'Senior', maxMonths: Infinity,
    tips: [
      {
        emoji: '🩺', title: 'Passez à un bilan tous les 6 mois',
        body: 'À partir de 7 ans, une visite semestrielle avec prise de sang permet de dépister tôt les soucis rénaux, thyroïdiens et articulaires.',
        why: 'Les reins ne donnent aucun signe visible tant que 65 à 70 % de leur capacité n\'est pas perdue — l\'animal boit un peu plus, c\'est tout. Une prise de sang les repère bien avant. Et six mois de chien senior, c\'est l\'équivalent de deux à trois ans chez nous : c\'est le temps qu\'il faut à une maladie lente pour devenir irréversible.',
      },
      {
        emoji: '⚖️', title: 'Pesez-le chaque mois',
        body: 'Une variation rapide de poids, à la hausse comme à la baisse, est souvent le tout premier signal d\'alerte.',
        why: 'Vous le voyez tous les jours, donc vous ne voyez pas qu\'il change : une perte de 10 % passe totalement inaperçue à l\'œil. Or 10 % de perte en deux mois oriente déjà vers un problème rénal, dentaire, digestif ou tumoral. La balance voit ce que le regard ne voit plus.',
      },
      {
        emoji: '🛏️', title: 'Adaptez son environnement',
        body: 'Couchage épais, tapis sur les sols glissants et balades plus courtes mais plus fréquentes ménagent ses articulations.',
        why: 'Sur un parquet, un chien arthrosique contracte ses muscles en permanence pour ne pas glisser : la douleur vient autant de cette tension que de l\'articulation elle-même. Et trois sorties de quinze minutes entretiennent la musculature sans déclencher la crise qu\'une seule heure provoquerait.',
      },
    ],
    education: [
      {
        emoji: '👂', title: 'Passer aux signaux visuels avant d\'en avoir besoin',
        body: 'Doublez chaque ordre vocal d\'un geste de la main, dès maintenant, tant qu\'il entend encore bien.',
        why: 'La surdité du chien âgé s\'installe progressivement et passe souvent pour de la désobéissance. S\'il a déjà associé un geste à chaque mot, la perte d\'audition ne coupe pas la communication : il continue simplement avec l\'autre canal, sans période de flottement anxiogène.',
        steps: [
          'Choisir un geste distinct par ordre courant (assis, viens, reste)',
          'Faire le geste juste avant le mot, à chaque fois',
          'Tester de temps en temps le geste seul',
          'Ne jamais le surprendre par-derrière quand il dort',
        ],
      },
      {
        emoji: '🧠', title: 'Entretenir la tête pour ralentir le déclin',
        body: 'Cinq minutes de recherche d\'odeur ou de jouet distributeur par jour, même quand le corps ne suit plus.',
        why: 'Le dysfonctionnement cognitif du chien âgé — désorientation, inversion du rythme jour/nuit, oubli des apprentissages — évolue plus lentement chez les chiens qui restent stimulés. L\'activité mentale reste possible alors même que l\'activité physique doit être réduite.',
        steps: [
          'Cacher trois friandises dans une pièce connue',
          'Le laisser chercher sans limite de temps',
          'Garder les mêmes repères : gamelles, couchage et itinéraires inchangés',
          'Signaler au vétérinaire tout réveil nocturne nouveau',
        ],
      },
    ],
  },
]

const CAT_STAGES: LifeStage[] = [
  {
    key: 'baby', label: 'Chaton', maxMonths: 12,
    tips: [
      {
        emoji: '💉', title: 'Typhus et coryza dès 8 semaines',
        body: 'Un rappel 3 à 4 semaines après la première injection, puis un an plus tard. La leucose s\'y ajoute s\'il sort.',
        why: 'Comme chez le chiot, les anticorps maternels bloquent le vaccin tant qu\'ils sont présents, puis disparaissent sans prévenir. Le typhus tue plus d\'un chaton non vacciné sur deux, et il résiste des mois dans l\'environnement : vous pouvez le rapporter sous vos chaussures sans avoir croisé le moindre chat.',
      },
      {
        emoji: '🪪', title: 'L\'identification est obligatoire',
        body: 'Puce ou tatouage : c\'est la loi en France, et c\'est ce qui permet de le retrouver s\'il disparaît.',
        why: 'Un chat non identifié qui arrive en fourrière est juridiquement sans propriétaire, avec un délai de garde très court. La puce est le seul lien qui résiste à une fugue, un déménagement ou un vol — un collier, lui, se perd précisément au moment où il servirait.',
      },
      {
        emoji: '🍽️', title: 'Une alimentation croissance jusqu\'à 12 mois',
        body: 'Des repas fractionnés, de l\'eau toujours accessible, et une gamelle éloignée de la litière.',
        why: 'Le chaton mange spontanément dix à quinze fois par jour : c\'est un chasseur de petites proies, pas un mangeur de gros repas. Et l\'eau placée à côté de la nourriture est instinctivement évitée, car dans la nature une eau proche d\'une carcasse est une eau contaminée.',
      },
    ],
    education: [
      {
        emoji: '🏖️', title: 'La litière obéit à des règles très strictes',
        body: 'Une litière par chat plus une, à l\'écart du bruit et de la nourriture, non parfumée, retirée deux fois par jour.',
        why: 'La majorité des « pipis hors litière » ne sont pas un caprice mais un refus motivé : bac trop sale, trop petit, couvert, parfumé, ou placé sur un lieu de passage. Le chat cherche un endroit où il peut creuser et surveiller les alentours en même temps. Punir ne change aucune de ces causes.',
        steps: [
          'Un bac de plus que le nombre de chats, dans des pièces différentes',
          'Bac large et non couvert, litière fine et sans parfum',
          'Retrait des souillures matin et soir',
          'Jamais à côté de la gamelle ni d\'une machine bruyante',
        ],
      },
      {
        emoji: '🎣', title: 'Jouer à la proie, jamais avec les mains',
        body: 'Canne à pêche ou souris au bout d\'une ficelle, avec une vraie capture à la fin de la séance.',
        why: 'La séquence de chasse du chat se termine par une prise : sans elle, l\'excitation reste en suspens et se reporte sur ce qui bouge — vos chevilles. Et un chaton à qui l\'on a offert les mains comme jouet devient un adulte de cinq kilos qui mord des mains, sans comprendre ce qui a changé.',
        steps: [
          'Faire fuir le jouet loin de lui, jamais vers lui',
          'Alterner phases rapides et immobilité, comme une proie',
          'Le laisser attraper le jouet à la fin',
          'Enchaîner avec un repas : chasse, prise, repas, toilette, sommeil',
        ],
      },
      {
        emoji: '🚗', title: 'Apprivoiser la caisse de transport tout de suite',
        body: 'Laissez-la ouverte en permanence dans le salon, avec un tissu familier et des friandises déposées dedans.',
        why: 'Si la caisse ne sort que pour aller chez le vétérinaire, elle finit par annoncer la peur, et le chat disparaît dès qu\'elle apparaît. Devenue meuble ordinaire, elle perd cette signification — et le trajet, souvent le plus stressant de la consultation, cesse d\'être un combat.',
        steps: [
          'Caisse ouverte et accessible toute l\'année',
          'Y déposer friandises et couverture sans jamais l\'y enfermer',
          'Faire de courts trajets sans destination médicale',
          'Couvrir la caisse d\'un linge pendant les déplacements',
        ],
      },
    ],
  },
  {
    key: 'adult', label: 'Adulte', maxMonths: 120,
    tips: [
      {
        emoji: '💧', title: 'Le chat boit spontanément trop peu',
        body: 'Pâtée, fontaine et plusieurs points d\'eau répartis dans le logement réduisent nettement le risque de troubles urinaires.',
        why: 'Il descend d\'un félin du désert qui tirait presque toute son eau de ses proies. Nourri aux croquettes, il ne compense jamais totalement ce déficit : ses urines restent concentrées, ce qui favorise cristaux et bouchons urinaires — une urgence vitale chez le mâle.',
      },
      {
        emoji: '🧶', title: '10 à 15 min de jeu actif par jour',
        body: 'Canne à pêche, arbre à chat et griffoirs : l\'ennui est la première cause de surpoids et de comportements gênants.',
        why: 'Un chat d\'intérieur dispose du même équipement de chasseur qu\'un chat libre, sans jamais s\'en servir. Cette énergie ne disparaît pas : elle ressort en courses nocturnes, en agressions de chevilles ou en léchage compulsif. Le jeu n\'est pas un loisir, c\'est l\'exutoire prévu.',
      },
      {
        emoji: '🦟', title: 'Antiparasitaires toute l\'année',
        body: 'Puces en continu, vermifuge 2 à 4 fois par an selon son accès à l\'extérieur — même un chat d\'intérieur est concerné.',
        why: 'Les puces vivent dans le logement, pas sur l\'animal : ce que vous voyez sur lui représente environ 5 % de l\'infestation, le reste étant en œufs et larves dans les tapis et les plinthes. Elles arrivent par vos vêtements, ce qui explique qu\'un chat qui ne sort jamais puisse en attraper.',
      },
    ],
    education: [
      {
        emoji: '🪵', title: 'Détourner les griffades plutôt que les interdire',
        body: 'Placez un griffoir robuste juste à côté de l\'endroit qu\'il abîme, puis déplacez-le de quelques centimètres par semaine.',
        why: 'Griffer n\'est pas de la destruction : c\'est un marquage visuel et olfactif déposé sur un support bien visible, souvent près d\'un lieu de passage ou de repos. Un griffoir relégué dans un coin ne remplit pas cette fonction, donc il est ignoré. L\'emplacement compte plus que le modèle.',
        steps: [
          'Repérer les supports qu\'il choisit et leur orientation',
          'Installer un griffoir stable au même endroit, assez haut pour qu\'il s\'étire',
          'Le récompenser lorsqu\'il l\'utilise',
          'Déplacer très progressivement une fois l\'habitude prise',
        ],
      },
      {
        emoji: '🌡️', title: 'L\'habituer aux soins avant d\'en avoir besoin',
        body: 'Quelques secondes par jour : toucher les pattes, soulever une babine, manipuler les oreilles, toujours suivi d\'une friandise.',
        why: 'Le jour où il faudra donner un comprimé ou couper une griffe, il sera trop tard pour négocier. Un chat habitué à ces gestes en dehors de tout contexte médical ne les associe pas à une contrainte — ce qui évite la contention, source de morsures et de renoncement aux traitements.',
        steps: [
          'Une zone du corps par séance, jamais plus de dix secondes',
          'Arrêter avant qu\'il ne s\'agace, pas après',
          'Récompenser systématiquement, même si la manipulation a été brève',
          'Répéter à froid, plusieurs fois par semaine',
        ],
      },
      {
        emoji: '🪜', title: 'Donner de la hauteur, pas seulement de la surface',
        body: 'Étagères, sommets d\'armoire, arbre à chat près d\'une fenêtre : un chat a besoin de points d\'observation en hauteur.',
        why: 'En hauteur, un chat contrôle son environnement et échappe à ce qui le dérange. Dans un logement sans perchoir, il n\'a aucun moyen de se soustraire — c\'est un facteur reconnu de stress chronique, de marquage urinaire et de tensions entre chats d\'un même foyer.',
        steps: [
          'Au moins un point haut par pièce de vie',
          'Un accès en plusieurs paliers pour les chats lourds ou âgés',
          'Un perchoir près d\'une fenêtre pour l\'observation extérieure',
          'Ne jamais l\'en déloger : c\'est son refuge',
        ],
      },
    ],
  },
  {
    key: 'senior', label: 'Senior', maxMonths: Infinity,
    tips: [
      {
        emoji: '🩺', title: 'Les reins se surveillent dès 10 ans',
        body: 'L\'insuffisance rénale est fréquente et silencieuse : un bilan sanguin et urinaire annuel change tout sur la prise en charge.',
        why: 'Un chat sur trois développe une insuffisance rénale après 10 ans. Les premiers signes visibles — boire davantage, maigrir — n\'apparaissent qu\'après la perte des deux tiers de la fonction rénale, quand il ne reste plus qu\'à ralentir. Détectée au stade sanguin, elle se gère des années avec une simple adaptation alimentaire.',
      },
      {
        emoji: '⚖️', title: 'Maigrir en mangeant beaucoup n\'est pas normal',
        body: 'C\'est un signe classique d\'hyperthyroïdie chez le chat âgé : une consultation s\'impose sans attendre.',
        why: 'La thyroïde emballée accélère tout le métabolisme : le chat brûle plus qu\'il n\'avale, même en mangeant énormément. On met souvent cela sur le compte de l\'âge, alors que c\'est l\'une des rares maladies du chat âgé qui se traite très bien — à condition de ne pas laisser le cœur s\'épuiser entre-temps.',
      },
      {
        emoji: '🛋️', title: 'Facilitez ses accès',
        body: 'Litière à bords bas, petites marches vers ses spots favoris et couchage au chaud pour ménager ses articulations.',
        why: 'Neuf chats de plus de 12 ans sur dix présentent de l\'arthrose radiologique, mais un chat ne boite presque jamais : il cesse simplement de sauter. Un bac à rebord haut devient alors douloureux à enjamber, et c\'est ainsi qu\'apparaissent des « malpropretés » chez un chat qui a toujours été propre.',
      },
    ],
    education: [
      {
        emoji: '🗺️', title: 'Ne plus rien déplacer',
        body: 'Gamelles, litières et couchages gardent la même place ; ajoutez une veilleuse sur ses trajets nocturnes.',
        why: 'Vue et audition baissent, et le chat âgé navigue de plus en plus de mémoire. Déplacer une gamelle de deux mètres suffit à le désorienter, avec à la clé une baisse de prise alimentaire ou des accidents. La stabilité de l\'environnement fait ici office de traitement.',
        steps: [
          'Figer l\'emplacement des ressources essentielles',
          'Une litière supplémentaire à chaque étage',
          'Veilleuse sur le trajet nuit entre couchage et litière',
          'Éviter les réaménagements et prévenir avant tout changement',
        ],
      },
      {
        emoji: '🤝', title: 'Maintenir le contact plutôt que le laisser tranquille',
        body: 'Séances courtes de jeu au sol et caresses quotidiennes, même s\'il dort beaucoup plus qu\'avant.',
        why: 'Un chat âgé qui s\'isole passe souvent pour un chat qui « se repose ». C\'est aussi le premier signe de douleur ou de déclin cognitif. Le contact quotidien est ce qui vous permet de repérer une perte de poids, une masse ou un changement de comportement dès la première semaine, et non trois mois plus tard.',
        steps: [
          'Deux ou trois interactions courtes par jour plutôt qu\'une longue',
          'Jeu au sol, à sa hauteur, sans exiger de sauts',
          'Palper le dos et le ventre pendant les caresses',
          'Noter tout changement d\'appétit, de miaulement ou de sommeil',
        ],
      },
    ],
  },
]

const RABBIT_STAGES: LifeStage[] = [
  {
    key: 'baby', label: 'Lapereau', maxMonths: 8,
    tips: [
      {
        emoji: '🌿', title: 'Le foin, c\'est 80 % de la ration',
        body: 'À volonté dès le sevrage : il use les dents qui poussent en continu et fait tourner le transit.',
        why: 'Ses dents poussent de 2 à 3 mm par semaine toute sa vie. Seule la mastication longue et latérale du foin les use au même rythme. Nourri surtout aux granulés, qui se croquent vite, il développe en quelques mois des pointes dentaires qui blessent la langue et les joues.',
      },
      {
        emoji: '💉', title: 'Myxomatose et VHD se vaccinent',
        body: 'Possible dès 5 semaines puis rappel annuel — y compris pour un lapin qui ne sort jamais, les insectes suffisent à contaminer.',
        why: 'Ces deux virus se transmettent par les moustiques et les puces, qui entrent par une fenêtre ouverte. La VHD tue en 24 à 48 heures, sans traitement possible. C\'est une des rares situations où la vaccination n\'est pas une précaution mais la seule protection existante.',
      },
      {
        emoji: '🏠', title: 'Plusieurs heures hors enclos chaque jour',
        body: 'Un lapin enfermé en permanence développe troubles osseux et comportements stéréotypés.',
        why: 'C\'est un animal conçu pour parcourir de grandes distances et bondir. Sans mouvement, sa masse osseuse diminue réellement — les fractures spontanées du dos chez le lapin en cage sont documentées — et l\'absence d\'exploration se traduit par un rongement compulsif des barreaux.',
      },
    ],
    education: [
      {
        emoji: '🚽', title: 'Le lapin apprend la propreté seul, si on l\'observe',
        body: 'Placez le bac dans le coin qu\'il a déjà choisi, avec un peu de ses crottes et du foin au-dessus.',
        why: 'Il choisit spontanément un coin unique pour uriner, souvent le plus abrité. On ne lui apprend donc pas l\'endroit : on met le bac là où il a décidé. Le foin par-dessus fonctionne parce qu\'il mange et élimine en même temps — c\'est ce qui le fait rester dans le bac.',
        steps: [
          'Repérer le coin qu\'il utilise déjà pendant une semaine',
          'Y installer un bac à rebord bas',
          'Poser un râtelier ou du foin directement au-dessus',
          'Nettoyer les autres coins au vinaigre blanc pour effacer l\'odeur',
        ],
      },
      {
        emoji: '🤲', title: 'Ne jamais le soulever pour créer du lien',
        body: 'Asseyez-vous par terre et laissez-le venir. Les caresses se font au sol, sur le front et les joues.',
        why: 'Être soulevé reproduit exactement ce que vit une proie emportée par un rapace : le lapin se débat, et une torsion peut lui fracturer la colonne. Un lapin manipulé de force devient craintif à vie, alors que le même animal, approché au sol, vient de lui-même en quelques jours.',
        steps: [
          'S\'installer au sol, immobile, sans chercher le contact',
          'Attendre qu\'il vienne renifler',
          'Caresser le front, jamais le dessous du menton ni le ventre',
          'Réserver le port aux soins, en soutenant l\'arrière-train',
        ],
      },
    ],
  },
  {
    key: 'adult', label: 'Adulte', maxMonths: 60,
    tips: [
      {
        emoji: '⏱️', title: 'Un arrêt de transit est une urgence',
        body: 'Plus de crottes et plus d\'appétit depuis 12 h : direction un vétérinaire NAC le jour même, sans attendre.',
        why: 'Son tube digestif ne s\'arrête jamais : il doit avancer en permanence, sinon les bactéries fermentent, produisent des gaz et provoquent une douleur qui coupe encore plus l\'appétit. Le cercle se referme en quelques heures, et l\'issue est fatale en un à deux jours.',
      },
      {
        emoji: '🦷', title: 'Les dents poussent toute sa vie',
        body: 'Bave, mâchouillage difficile ou tri dans la gamelle sont presque toujours des signes dentaires.',
        why: 'Les molaires du fond sont invisibles sans matériel : quand le propriétaire voit quelque chose, les pointes ont déjà blessé la bouche depuis des semaines. Le premier signe est un changement d\'habitude alimentaire — il délaisse le dur pour le mou — bien avant l\'amaigrissement.',
      },
      {
        emoji: '🥕', title: 'Peu de granulés, beaucoup de verdure',
        body: 'Une petite poignée de granulés par jour suffit, complétée de légumes verts variés introduits progressivement.',
        why: 'Les granulés sont conçus pour un engraissement rapide, pas pour une vie longue. À volonté, ils rassasient sans user les dents et déséquilibrent la flore intestinale, qui a besoin de fibres longues pour fonctionner. La verdure, elle, apporte fibres et eau simultanément.',
      },
    ],
    education: [
      {
        emoji: '🚫', title: 'Sécuriser plutôt que corriger',
        body: 'Gaines de protection sur les câbles, plinthes couvertes, plantes en hauteur : on aménage la pièce, on ne dispute pas le lapin.',
        why: 'Ronger n\'est pas un caprice mais un besoin physiologique permanent. Interdire sans offrir d\'alternative ne fait que déplacer le problème, et un lapin ne fait aucun lien entre une réprimande et un geste passé. Un câble sous tension mâché est mortel : la seule prévention fiable est matérielle.',
        steps: [
          'Passer chaque pièce accessible au niveau du sol',
          'Gainer ou surélever tous les câbles',
          'Proposer bois à ronger, cartons et tunnels en compensation',
          'Prévoir un espace de liberté clos plutôt qu\'un accès total non sécurisé',
        ],
      },
      {
        emoji: '👥', title: 'La cohabitation se prépare, elle ne s\'improvise pas',
        body: 'Deux lapins stérilisés se présentent en terrain neutre, par séances courtes et répétées.',
        why: 'C\'est un animal territorial et social à la fois : il souffre seul, mais deux lapins mis brutalement ensemble se blessent sérieusement. En terrain neutre, aucun des deux ne défend son territoire, et la stérilisation retire la composante hormonale des conflits.',
        steps: [
          'Stériliser les deux animaux et attendre la fin des effets hormonaux',
          'Premiers contacts dans un lieu inconnu des deux',
          'Séances de dix minutes, prolongées progressivement',
          'Emménagement commun seulement après plusieurs toilettages mutuels',
        ],
      },
    ],
  },
  {
    key: 'senior', label: 'Senior', maxMonths: Infinity,
    tips: [
      {
        emoji: '🩺', title: 'Un examen tous les 6 mois après 5 ans',
        body: 'Dents, poids et arthrose : les trois points qui décident du confort d\'un lapin âgé.',
        why: 'Le lapin est une proie : il masque toute faiblesse aussi longtemps qu\'il le peut, car montrer sa douleur revient à se désigner. Quand le comportement change visiblement, la maladie est souvent installée depuis longtemps. Seul un examen régulier permet de prendre de l\'avance.',
      },
      {
        emoji: '🧼', title: 'Vérifiez son arrière-train chaque jour',
        body: 'Un lapin âgé se toilette moins bien ; des souillures attirent les mouches et provoquent des myiases, très graves.',
        why: 'Arthrose et surpoids l\'empêchent d\'atteindre son arrière-train et d\'ingérer ses caecotrophes. Les souillures qui en résultent attirent les mouches, qui pondent dans le pelage : les larves attaquent la peau vivante en 24 heures. C\'est une des urgences les plus rapides de l\'espèce.',
      },
      {
        emoji: '🛏️', title: 'Un sol souple prévient les pododermatites',
        body: 'Tapis et litière épaisse soulagent des pattes fragilisées par l\'âge et le poids.',
        why: 'Le lapin n\'a pas de coussinets : ses pattes reposent sur une simple couche de fourrure. Sur un sol dur ou grillagé, la peau s\'ulcère puis s\'infecte jusqu\'à l\'os, et ces plaies guérissent très mal. Un animal moins mobile, qui reste longtemps au même endroit, y est particulièrement exposé.',
      },
    ],
    education: [
      {
        emoji: '📉', title: 'Suivre les crottes autant que le poids',
        body: 'Observez chaque jour la taille et le nombre de crottes : c\'est le meilleur indicateur quotidien de sa santé.',
        why: 'La production fécale reflète directement l\'activité du transit, qui est le point faible de l\'espèce. Des crottes plus petites ou moins nombreuses précèdent de plusieurs heures la perte d\'appétit — c\'est la fenêtre pendant laquelle une consultation change tout.',
        steps: [
          'Nettoyer le bac à heure fixe pour comparer d\'un jour à l\'autre',
          'Alerter dès que la taille diminue nettement',
          'Peser chaque semaine sur une balance de cuisine',
          'Noter les repas refusés',
        ],
      },
    ],
  },
]

const RODENT_STAGES: LifeStage[] = [
  {
    key: 'baby', label: 'Jeune', maxMonths: 6,
    tips: [
      {
        emoji: '🏠', title: 'L\'installation décide de son stress',
        body: 'Un habitat spacieux, une litière non poussiéreuse et plusieurs cachettes suffisent à faire passer les premiers jours.',
        why: 'Ce sont des proies : un espace sans cachette les maintient en alerte permanente, ce qui affaiblit réellement leurs défenses immunitaires. Et les litières poussiéreuses irritent des voies respiratoires minuscules, principale porte d\'entrée des infections chez ces espèces.',
      },
      {
        emoji: '🍊', title: 'Le cochon d\'Inde a besoin de vitamine C',
        body: 'Il ne la synthétise pas : un apport quotidien est indispensable. Les autres rongeurs ont chacun leurs besoins propres.',
        why: 'Comme nous, il a perdu l\'enzyme qui fabrique la vitamine C. Sans apport quotidien, le collagène ne se renouvelle plus : en trois à quatre semaines apparaissent boiteries, saignements des gencives et fatigue — un authentique scorbut, réversible s\'il est pris à temps.',
      },
      {
        emoji: '🤝', title: 'Apprivoisez quelques minutes par jour',
        body: 'Main ouverte, friandise, jamais de saisie par le dessus : la confiance se construit en 2 à 3 semaines.',
        why: 'Une main qui descend d\'en haut reproduit la silhouette d\'un rapace : la fuite est réflexe, pas capricieuse. Présentée à plat au niveau du sol, la même main perd cette signification, et l\'animal vient de lui-même — sans le stress qui le rend craintif durablement.',
      },
    ],
    education: [
      {
        emoji: '🗣️', title: 'Associer votre voix à la nourriture',
        body: 'Parlez-lui toujours de la même façon juste avant de déposer sa ration.',
        why: 'Ces espèces ont une excellente mémoire associative et une audition fine. Une phrase répétée qui précède systématiquement quelque chose d\'agréable devient un signal rassurant : l\'animal cesse de se figer à votre approche, ce qui facilite ensuite tous les soins.',
        steps: [
          'Choisir une phrase courte et un ton constant',
          'La dire avant chaque distribution, jamais à un autre moment',
          'Attendre qu\'il vienne au lieu d\'aller le chercher',
          'Étendre ensuite le signal aux séances de manipulation',
        ],
      },
    ],
  },
  {
    key: 'adult', label: 'Adulte', maxMonths: 24,
    tips: [
      {
        emoji: '⚖️', title: 'Une pesée par mois vaut tous les examens',
        body: 'Chez un petit rongeur, la perte de poids est souvent le premier signe visible d\'un problème.',
        why: 'Sous un pelage dense, un animal de 800 g peut en perdre 100 sans que rien ne se voie — soit plus de 12 % de sa masse. Rapporté à un humain, c\'est neuf kilos. La balance détecte en une minute ce que l\'œil ne verra que des semaines plus tard.',
      },
      {
        emoji: '🌬️', title: 'Les soucis respiratoires évoluent vite',
        body: 'Éternuements répétés, respiration bruyante ou nez humide : consultez dès les premiers signes, pas la semaine suivante.',
        why: 'Leurs poumons sont minuscules et leur métabolisme très rapide : une infection qui mettrait des semaines à s\'installer chez un chien se généralise ici en 48 heures. Chez le rat, la mycoplasmose est si répandue qu\'un simple éternuement répété doit être considéré comme un début de pneumonie.',
      },
      {
        emoji: '🎡', title: 'L\'ennui se voit dans le comportement',
        body: 'Tunnels, roue pleine adaptée à sa taille et fourrage à explorer préviennent les stéréotypies.',
        why: 'Un rongeur parcourt plusieurs kilomètres par nuit dans la nature. Privé de cette activité, il développe des mouvements répétitifs — barreaux rongés, allers-retours identiques — qui traduisent une véritable souffrance et non une simple habitude.',
      },
    ],
    education: [
      {
        emoji: '🌙', title: 'Respecter son horloge, pas la vôtre',
        body: 'Manipulez-le en soirée, jamais en le réveillant en pleine journée.',
        why: 'La plupart de ces espèces sont nocturnes ou crépusculaires. Un animal tiré du sommeil réagit par la morsure, et des réveils répétés désorganisent son rythme au point d\'altérer son immunité. Choisir le bon moment supprime à lui seul l\'essentiel des morsures.',
        steps: [
          'Repérer ses heures d\'éveil spontané',
          'Ne jamais ouvrir la cage pendant son sommeil',
          'Prévoir les soins et le nettoyage en soirée',
          'Éloigner l\'habitat des pièces éclairées la nuit',
        ],
      },
    ],
  },
  {
    key: 'senior', label: 'Senior', maxMonths: Infinity,
    tips: [
      {
        emoji: '🩺', title: 'Palpez-le régulièrement',
        body: 'Les masses mammaires sont fréquentes chez le rongeur âgé et souvent opérables quand elles sont prises tôt.',
        why: 'Chez la rate, les tumeurs mammaires touchent plus d\'une femelle sur deux et se développent en quelques semaines. La chirurgie est simple et bien tolérée tant que la masse est petite ; passé une certaine taille, elle gêne la marche et l\'intervention devient risquée.',
      },
      {
        emoji: '🍚', title: 'Ramollissez sa nourriture si besoin',
        body: 'Quand la mastication devient difficile, humidifier les granulés maintient l\'apport et évite l\'amaigrissement.',
        why: 'Ces animaux ont des réserves énergétiques très faibles : deux jours sans manger correctement suffisent à déclencher une cascade métabolique difficile à rattraper. Faciliter la prise alimentaire est souvent plus efficace que n\'importe quel complément.',
      },
      {
        emoji: '🌡️', title: 'Ni courant d\'air, ni coup de chaud',
        body: 'Un rongeur âgé supporte mal les écarts : gardez son habitat à température stable, loin des fenêtres.',
        why: 'Leur rapport surface/volume les fait perdre ou accumuler la chaleur très vite. Le cochon d\'Inde, qui ne transpire pas, entre en hyperthermie au-delà de 28 °C — et un animal âgé, moins mobile, ne peut plus aller chercher un endroit plus frais.',
      },
    ],
    education: [
      {
        emoji: '🪜', title: 'Rapprocher toutes les ressources',
        body: 'Supprimez les étages, rapprochez eau et nourriture du couchage, remplacez les rampes raides par des plans doux.',
        why: 'Un rongeur âgé arthrosique renonce à se déplacer avant de montrer qu\'il a mal. Il boit et mange alors moins, et l\'amaigrissement qu\'on attribue à l\'âge n\'est en réalité qu\'un problème d\'accessibilité — entièrement réversible.',
        steps: [
          'Supprimer les niveaux nécessitant un saut',
          'Doubler les points d\'eau et de nourriture',
          'Litière épaisse sous les zones de repos',
          'Vérifier chaque semaine qu\'il atteint bien tout',
        ],
      },
    ],
  },
]

const FERRET_STAGES: LifeStage[] = [
  {
    key: 'baby', label: 'Fureton', maxMonths: 12,
    tips: [
      {
        emoji: '💉', title: 'La maladie de Carré est mortelle chez le furet',
        body: 'Primovaccination dès 8 semaines puis rappel annuel : c\'est le vaccin à ne pas manquer.',
        why: 'Chez le furet, la létalité de la maladie de Carré approche 100 %, contre environ 50 % chez le chien. Le virus se transmet dans l\'air et sur les vêtements, donc même un furet strictement domestique est exposé. Il n\'existe aucun traitement.',
      },
      {
        emoji: '😴', title: 'Jusqu\'à 18 h de sommeil par jour',
        body: 'C\'est normal — ce sont ses phases d\'éveil qui doivent être vives et curieuses.',
        why: 'Son sommeil est si profond qu\'il peut sembler inanimé et froid au toucher : beaucoup de propriétaires consultent en urgence pour un animal parfaitement sain. Ce qui compte n\'est pas la durée du sommeil mais la qualité de l\'éveil.',
      },
      {
        emoji: '🦷', title: 'Le mordillement s\'éduque',
        body: 'Il joue avec la gueule : redirigez systématiquement vers un jouet, sans le brusquer ni le punir.',
        why: 'Sa peau est épaisse et ses jeux entre congénères impliquent des morsures que nous ne supporterions pas : il n\'a aucune raison de deviner que la nôtre est fragile. Il ne s\'agit pas d\'agressivité mais d\'un calibrage à apprendre, comme chez le chiot.',
      },
    ],
    education: [
      {
        emoji: '🎯', title: 'La litière s\'installe dans les coins',
        body: 'Un bac triangulaire dans chaque angle qu\'il utilise, et une récompense immédiate à chaque réussite.',
        why: 'Le furet recule dans un angle pour éliminer et ne se déplace jamais loin pour le faire : il utilise le coin le plus proche au moment où l\'envie vient. Multiplier les bacs dans les angles est donc bien plus efficace que d\'essayer de lui apprendre un emplacement unique.',
        steps: [
          'Observer les angles qu\'il choisit spontanément',
          'Y placer des bacs à angle avec un rebord bas',
          'Récompenser dans la seconde qui suit',
          'Nettoyer les erreurs avec un produit enzymatique',
        ],
      },
    ],
  },
  {
    key: 'adult', label: 'Adulte', maxMonths: 48,
    tips: [
      {
        emoji: '🚫', title: 'Les corps étrangers sont sa première urgence',
        body: 'Caoutchouc, mousse, bouchons : le furet avale tout. Sécurisez la pièce avant chaque sortie.',
        why: 'Il explore avec la bouche et adore la texture du caoutchouc et de la mousse. Son intestin est étroit : un morceau de quelques millimètres suffit à l\'obstruer. C\'est la première cause de chirurgie d\'urgence de l\'espèce, et les signes se limitent souvent à un animal qui mange moins et vomit un peu.',
      },
      {
        emoji: '🏃', title: 'Au moins 4 h hors cage par jour',
        body: 'Dans un espace vérifié : trous, machines, plantes toxiques et canapés repérés à l\'avance.',
        why: 'Il se faufile dans toute ouverture par laquelle sa tête passe, soit environ 4 cm. Les accidents domestiques les plus fréquents sont l\'écrasement dans un canapé convertible et l\'entrée dans un lave-linge — un espace non préparé est un vrai danger, pas une simple contrainte.',
      },
      {
        emoji: '🦟', title: 'Mêmes parasites qu\'un chat',
        body: 'Puces et vers se traitent avec des produits adaptés au furet, y compris pour un animal d\'intérieur.',
        why: 'Il est sensible au ver du cœur, transmis par les moustiques, et une seule larve suffit à obstruer un cœur de sa taille. Beaucoup d\'antiparasitaires pour chiens lui sont par ailleurs toxiques : le dosage doit être spécifique.',
      },
    ],
    education: [
      {
        emoji: '🧭', title: 'Un rappel qui repose sur le bruit',
        body: 'Associez un bruit précis — bouchon de friandise, clé de cage — à une récompense grasse très appréciée.',
        why: 'Le furet a une vue médiocre mais une excellente audition, et son attachement à une friandise dépasse largement son intérêt pour la voix humaine. Un signal sonore constamment suivi d\'une récompense devient le seul moyen fiable de le récupérer sous un meuble.',
        steps: [
          'Choisir un bruit unique, jamais utilisé pour autre chose',
          'L\'associer chaque fois à la même friandise',
          'S\'entraîner d\'abord à un mètre, puis d\'une pièce à l\'autre',
          'Ne jamais l\'utiliser pour le remettre en cage sans compensation',
        ],
      },
    ],
  },
  {
    key: 'senior', label: 'Senior', maxMonths: Infinity,
    tips: [
      {
        emoji: '🩺', title: 'Surrénales et insulinome après 3-4 ans',
        body: 'Perte de poils symétrique, faiblesse de l\'arrière-train ou moments d\'absence justifient un bilan rapide.',
        why: 'Ce sont les deux maladies qui touchent la majorité des furets âgés. L\'insulinome fait chuter le sucre sanguin : l\'animal reste hébété, bave, puis se remet — ce qui fait souvent croire à un simple coup de fatigue, alors que chaque épisode use le cerveau.',
      },
      {
        emoji: '⚖️', title: 'Pesée mensuelle',
        body: 'Le furet âgé maigrit discrètement sous son pelage : la balance le voit avant vous.',
        why: 'Son poids varie déjà naturellement de 30 % entre l\'été et l\'hiver. Sans suivi chiffré, il devient impossible de distinguer cette variation saisonnière normale d\'un amaigrissement pathologique.',
      },
      {
        emoji: '🛏️', title: 'Hamacs bas et rampes',
        body: 'Limitez les sauts en hauteur et rapprochez litière, eau et couchage de son espace de repos.',
        why: 'La faiblesse des postérieurs est un signe précoce d\'insulinome et de maladie surrénalienne. Un hamac haut placé devient alors une chute potentielle, et l\'animal se retient plutôt que de traverser la cage pour atteindre le bac.',
      },
    ],
    education: [
      {
        emoji: '🍬', title: 'Fractionner les repas contre l\'hypoglycémie',
        body: 'Nourriture disponible en permanence et repas riches en protéines animales, jamais de friandises sucrées.',
        why: 'Chez un furet atteint d\'insulinome, un jeûne de quelques heures suffit à déclencher un malaise. Le sucre aggrave la situation : il provoque une décharge d\'insuline supplémentaire, donc une chute encore plus brutale une heure après.',
        steps: [
          'Croquettes ou pâtée disponibles jour et nuit',
          'Privilégier les protéines animales, éviter céréales et sucres',
          'Signaler tout épisode d\'hébétude au vétérinaire',
          'Ne jamais laisser un furet âgé à jeun avant une anesthésie sans avis',
        ],
      },
    ],
  },
]

const BIRD_STAGES: LifeStage[] = [
  {
    key: 'baby', label: 'Jeune', maxMonths: 12,
    tips: [
      {
        emoji: '🪵', title: 'Des perchoirs de diamètres variés',
        body: 'En bois naturel plutôt qu\'en plastique lisse : cela prévient les lésions plantaires et muscle ses pattes.',
        why: 'Sur un perchoir unique et lisse, le pied appuie toujours au même endroit : la peau finit par s\'ulcérer. Des diamètres et textures variés répartissent les points d\'appui, exactement comme le feraient des branches différentes.',
      },
      {
        emoji: '🌤️', title: '10 à 12 h d\'obscurité par nuit',
        body: 'Un rythme jour/nuit régulier conditionne son comportement, sa mue et son équilibre hormonal.',
        why: 'La durée du jour pilote directement ses hormones. Un oiseau exposé à la lumière artificielle jusqu\'à minuit se croit en été permanent : il entre en cycle reproductif continu, avec agressivité, plumage abîmé et, chez les femelles, des pontes à répétition qui épuisent leurs réserves de calcium.',
      },
      {
        emoji: '🍎', title: 'Un régime 100 % graines carence l\'oiseau',
        body: 'Introduisez tôt granulés, légumes et fruits : les habitudes alimentaires se figent avec l\'âge.',
        why: 'Les graines sont grasses et pauvres en vitamine A et en calcium ; l\'oiseau trie les plus grasses et laisse le reste. La carence en vitamine A qui en découle fragilise les voies respiratoires. Passé un an, un oiseau habitué aux graines refuse durablement toute nouveauté.',
      },
    ],
    education: [
      {
        emoji: '👆', title: 'Le « step up » avant tout le reste',
        body: 'Présentez votre doigt contre le bas de sa poitrine et attendez qu\'il monte de lui-même, sans le pousser.',
        why: 'C\'est le geste qui conditionne tout le reste : sortie de cage, soins, évacuation en cas d\'urgence. Un oiseau attrapé de force apprend que la main annonce une contrainte, et chaque manipulation devient ensuite une lutte qui abîme son plumage et sa confiance.',
        steps: [
          'Approcher le doigt lentement, juste au-dessus des pattes',
          'Attendre le mouvement spontané, sans jamais pousser',
          'Récompenser par une graine préférée, réservée à cet exercice',
          'Répéter deux minutes par jour, toujours en terminant sur une réussite',
        ],
      },
      {
        emoji: '🔍', title: 'Faire chercher sa nourriture',
        body: 'Répartissez sa ration dans plusieurs contenants, papiers à déchirer et jouets à fourrager.',
        why: 'Dans la nature, un perroquet consacre 60 % de sa journée à trouver sa nourriture. Servie dans une coupelle, cette activité disparaît d\'un coup — et le vide qu\'elle laisse est la première cause de picage, un trouble presque impossible à guérir une fois installé.',
        steps: [
          'Ne jamais donner toute la ration au même endroit',
          'Envelopper des graines dans du papier à déchirer',
          'Changer les cachettes régulièrement',
          'Vérifier au début qu\'il trouve assez à manger',
        ],
      },
    ],
  },
  {
    key: 'adult', label: 'Adulte', maxMonths: 96,
    tips: [
      {
        emoji: '🔥', title: 'Le Téflon surchauffé tue les oiseaux',
        body: 'Poêles antiadhésives, fumée, bougies parfumées et aérosols : leur système respiratoire ne pardonne rien.',
        why: 'Leurs poumons sont prolongés par des sacs aériens qui traversent tout le corps, et l\'air y circule en un seul sens : l\'oxygénation est bien plus efficace que la nôtre, mais l\'exposition aux toxiques aussi. Une poêle oubliée sur le feu tue un oiseau dans la pièce voisine en quelques minutes.',
      },
      {
        emoji: '🧠', title: 'L\'ennui provoque le picage',
        body: 'Fourrageage, jouets à détruire et interactions quotidiennes valent mieux que n\'importe quel traitement du plumage.',
        why: 'Le picage est un comportement de substitution : faute d\'activité, l\'oiseau reporte sur ses plumes le temps qu\'il consacrerait à chercher sa nourriture. Une fois le geste devenu habitude, il persiste même après enrichissement — d\'où l\'importance de prévenir plutôt que de corriger.',
      },
      {
        emoji: '⚠️', title: 'Un oiseau cache la maladie',
        body: 'Plumes ébouriffées, fientes modifiées ou silence inhabituel signifient souvent que ça dure déjà depuis un moment.',
        why: 'Dans un groupe sauvage, un oiseau visiblement affaibli est le premier ciblé par les prédateurs et rejeté par ses congénères. Il masque donc ses symptômes jusqu\'à l\'épuisement de ses réserves : quand il se laisse aller, il ne reste souvent que quelques jours de marge.',
      },
    ],
    education: [
      {
        emoji: '🗓️', title: 'Ritualiser les sorties plutôt que les improviser',
        body: 'Des sorties à heures régulières, toujours annoncées de la même façon, et un retour en cage récompensé.',
        why: 'Un oiseau anticipe très finement le déroulé de la journée. Des sorties imprévisibles entretiennent une attente permanente, source de cris insistants. Et si le retour en cage annonce toujours la fin du plaisir, il devient un combat quotidien — sauf s\'il prédit lui aussi quelque chose d\'agréable.',
        steps: [
          'Fixer un ou deux créneaux quotidiens',
          'Annoncer la sortie par un signal constant',
          'Placer la meilleure friandise de la journée au retour en cage',
          'Ne jamais poursuivre l\'oiseau pour le rentrer',
        ],
      },
    ],
  },
  {
    key: 'senior', label: 'Senior', maxMonths: Infinity,
    tips: [
      {
        emoji: '🩺', title: 'Un bilan aviaire par an',
        body: 'Poids, bec, griffes et analyse sanguine chez un vétérinaire qui suit régulièrement des oiseaux.',
        why: 'Les maladies du foie liées à un régime trop gras sont fréquentes et longtemps muettes : elles se voient dans le sang et sur l\'aspect du bec bien avant tout symptôme. Peu de praticiens sont formés à l\'aviaire, il vaut mieux identifier le bon avant l\'urgence.',
      },
      {
        emoji: '🦶', title: 'Perchoirs plus larges et plus bas',
        body: 'Réduisez les hauteurs de vol et de saut pour ménager articulations et pattes.',
        why: 'Un oiseau âgé arthrosique ou en surpoids se rattrape mal : les chutes depuis un perchoir haut provoquent des fractures du bréchet et des lésions plantaires. Des perchoirs plats et bas suppriment ce risque sans réduire son activité.',
      },
      {
        emoji: '⚖️', title: 'Pesée hebdomadaire',
        body: 'Quelques grammes comptent énormément chez un oiseau : une balance de cuisine suffit.',
        why: 'Chez une perruche de 35 g, perdre 4 g équivaut à 10 % du poids corporel — l\'équivalent de 7 kg chez un adulte. Aucune observation visuelle ne détecte cela sous les plumes ; seule une pesée régulière le révèle.',
      },
    ],
    education: [
      {
        emoji: '🔆', title: 'Stabiliser la lumière et le calme',
        body: 'Horaires de coucher fixes, cage à l\'écart des passages, et pas de changement brutal de pièce.',
        why: 'Un oiseau âgé s\'adapte moins bien aux perturbations : un déménagement de cage ou des couchers irréguliers suffisent à déclencher mue anormale, picage ou baisse d\'appétit. La régularité vaut ici davantage que n\'importe quel complément alimentaire.',
        steps: [
          'Couvrir la cage à heure fixe chaque soir',
          'Éloigner la cage des passages et des courants d\'air',
          'Annoncer les changements par des étapes progressives',
          'Maintenir les mêmes jouets, en n\'en changeant qu\'un à la fois',
        ],
      },
    ],
  },
]

const REPTILE_STAGES: LifeStage[] = [
  {
    key: 'baby', label: 'Juvénile', maxMonths: 24,
    tips: [
      {
        emoji: '🌡️', title: 'Le gradient thermique conditionne tout',
        body: 'Point chaud et zone fraîche, mesurés au thermomètre : sans la bonne température, il ne digère pas.',
        why: 'Un reptile ne produit pas sa chaleur : sa digestion, son immunité et son activité dépendent entièrement de la température qu\'il trouve. Trop froid, la nourriture stagne dans l\'estomac et fermente. C\'est pourquoi la majorité des maladies de reptiles sont en réalité des erreurs de maintenance.',
      },
      {
        emoji: '☀️', title: 'Les UVB se remplacent tous les 6 à 12 mois',
        body: 'Le tube continue d\'éclairer bien après avoir cessé d\'émettre — d\'où les maladies osseuses chez les juvéniles.',
        why: 'Sans UVB, pas de vitamine D3, donc pas de fixation du calcium. L\'os se déminéralise et se déforme : mâchoire molle, membres arqués, fractures spontanées. Comme la lampe éclaire toujours, rien n\'alerte le propriétaire avant l\'apparition des déformations, souvent irréversibles.',
      },
      {
        emoji: '🍽️', title: 'Un juvénile mange bien plus souvent',
        body: 'Le rythme de nourrissage dépend de l\'espèce et chute nettement au passage à l\'âge adulte.',
        why: 'En croissance, un pogona mange tous les jours et surtout des insectes ; adulte, il devient majoritairement végétarien et deux à trois repas par semaine suffisent. Conserver le rythme juvénile provoque une obésité et une atteinte hépatique fréquentes en captivité.',
      },
    ],
    education: [
      {
        emoji: '📋', title: 'Tenir un carnet de maintenance',
        body: 'Notez chaque jour températures, hygrométrie, repas et mues.',
        why: 'Les problèmes de reptiles s\'installent sur des semaines et se diagnostiquent essentiellement à partir des conditions de vie. Sans relevé, impossible de dire au vétérinaire ce qui a changé — et c\'est presque toujours dans ce changement que se trouve la cause.',
        steps: [
          'Relever le point chaud et le point froid chaque jour',
          'Noter chaque repas accepté ou refusé',
          'Photographier chaque mue',
          'Dater le remplacement des UVB',
        ],
      },
    ],
  },
  {
    key: 'adult', label: 'Adulte', maxMonths: 120,
    tips: [
      {
        emoji: '💧', title: 'Une hygrométrie inadaptée abîme les mues',
        body: 'Doigts et bout de queue sont les premiers touchés : surveillez chaque mue de près.',
        why: 'Trop sec, la peau ne se détache pas d\'un seul tenant : des anneaux de peau morte restent en place, se resserrent et coupent la circulation. Le doigt ou l\'extrémité de la queue finit par se nécroser et tomber. C\'est indolore au début, donc facile à manquer.',
      },
      {
        emoji: '🦴', title: 'Calcium et D3 pour les insectivores',
        body: 'La complémentation régulière évite des carences invisibles jusqu\'au jour où elles ne le sont plus.',
        why: 'Les insectes d\'élevage contiennent beaucoup plus de phosphore que de calcium, ce qui pousse l\'organisme à puiser dans l\'os. Saupoudrer les proies rétablit le rapport. Sans cela, la maladie osseuse métabolique s\'installe silencieusement pendant des mois.',
      },
      {
        emoji: '🧽', title: 'Hygiène du terrarium et des mains',
        body: 'Point d\'eau nettoyé quotidiennement et lavage des mains systématique après manipulation (salmonelles).',
        why: 'Les reptiles hébergent naturellement des salmonelles sans en être malades. La transmission se fait par les mains et les surfaces, et les jeunes enfants sont les plus exposés. Un lavage systématique suffit à supprimer pratiquement tout le risque.',
      },
    ],
    education: [
      {
        emoji: '✋', title: 'Manipuler après avoir signalé sa présence',
        body: 'Faites-lui d\'abord voir votre main sur le côté, jamais au-dessus, et évitez toute manipulation en période de mue ou de digestion.',
        why: 'Une main qui descend d\'en haut reproduit l\'attaque d\'un rapace, et une manipulation pendant la digestion provoque régurgitation et stress. Approcher latéralement, en dehors de ces périodes, transforme la manipulation en routine acceptée plutôt qu\'en agression.',
        steps: [
          'Se signaler visuellement avant de toucher',
          'Soutenir tout le corps, jamais seulement le milieu',
          'Pas de manipulation dans les 48 h suivant un repas',
          'S\'abstenir totalement pendant la mue',
        ],
      },
    ],
  },
  {
    key: 'senior', label: 'Senior', maxMonths: Infinity,
    tips: [
      {
        emoji: '🩺', title: 'Un contrôle annuel chez un vétérinaire NAC',
        body: 'Poids, qualité des mues et cavité buccale chez un praticien habitué aux reptiles.',
        why: 'La stomatite et l\'atteinte rénale sont fréquentes chez les reptiles âgés et se voient à l\'examen bien avant que l\'animal ne cesse de s\'alimenter. Chez une espèce qui peut jeûner des semaines sans que cela paraisse anormal, l\'examen régulier est le seul repère fiable.',
      },
      {
        emoji: '🌡️', title: 'Des paramètres encore plus stables',
        body: 'Un reptile âgé encaisse mal les variations : vérifiez régulièrement thermostat et sondes.',
        why: 'Son immunité dépend de la température : un point chaud défaillant pendant quelques jours suffit à déclencher une infection respiratoire chez un animal âgé, là où un jeune compenserait sans conséquence.',
      },
      {
        emoji: '🍽️', title: 'Des rations plus espacées',
        body: 'Le métabolisme ralentit ; conserver le rythme d\'un adulte jeune mène tout droit à l\'obésité.',
        why: 'Chez le reptile, la graisse s\'accumule dans les corps adipeux et le foie plutôt que sous la peau : l\'animal ne paraît pas gros alors que son foie est déjà atteint. La stéatose hépatique est l\'une des causes de mortalité les plus fréquentes en captivité.',
      },
    ],
    education: [
      {
        emoji: '🔦', title: 'Vérifier le matériel avant l\'animal',
        body: 'Contrôlez thermostat, sondes et âge des UVB à date fixe, chaque trimestre.',
        why: 'Un thermostat qui dérive ou un UVB épuisé ne se voient pas : l\'animal se dégrade lentement et on cherche la cause chez lui. Chez un reptile âgé, ce contrôle matériel régulier prévient plus de maladies que n\'importe quelle observation comportementale.',
        steps: [
          'Vérifier les températures avec un thermomètre indépendant',
          'Noter la date de pose des UVB et la remplacer sans attendre la panne',
          'Contrôler l\'hygrométrie à deux endroits du terrarium',
          'Tester le thermostat de sécurité',
        ],
      },
    ],
  },
]

const OTHER_STAGES: LifeStage[] = [
  {
    key: 'baby', label: 'Jeune', maxMonths: 12,
    tips: [
      {
        emoji: '🔎', title: 'Trouvez un vétérinaire NAC dès maintenant',
        body: 'Tous les cabinets ne prennent pas les espèces exotiques : mieux vaut le savoir avant l\'urgence.',
        why: 'Les espèces exotiques réclament un matériel et une formation spécifiques, et beaucoup de cliniques les refusent. Chercher un praticien un dimanche, avec un animal qui décline en quelques heures, fait perdre le temps qui comptait le plus.',
      },
      {
        emoji: '📓', title: 'Notez tout dès le départ',
        body: 'Poids, alimentation et petits changements de comportement : c\'est ce qui rend une consultation efficace.',
        why: 'Pour les espèces peu courantes, il n\'existe pas toujours de valeurs de référence : le meilleur point de comparaison reste l\'animal lui-même quelques semaines plus tôt. Votre carnet devient alors l\'outil de diagnostic principal.',
      },
      {
        emoji: '🏠', title: 'L\'environnement avant tout',
        body: 'Chez la plupart des espèces exotiques, les maladies viennent d\'abord de conditions de vie inadaptées.',
        why: 'Température, hygrométrie, éclairage et espace conditionnent directement l\'immunité de ces animaux. C\'est pourquoi un traitement seul échoue souvent : sans correction de la maintenance, la maladie revient.',
      },
    ],
    education: [
      {
        emoji: '📚', title: 'Vérifier les besoins à la source',
        body: 'Recoupez ce que dit l\'animalerie avec une source vétérinaire spécialisée avant d\'installer quoi que ce soit.',
        why: 'Beaucoup de conseils de vente reposent sur ce qui se vend et non sur ce dont l\'espèce a besoin : cages sous-dimensionnées, substrats inadaptés, régimes incomplets. Corriger après coup coûte plus cher que de bien installer dès le départ.',
        steps: [
          'Identifier précisément l\'espèce, pas seulement le nom commercial',
          'Vérifier taille adulte, longévité et besoins climatiques',
          'Prévoir l\'installation définitive dès le début',
          'Demander l\'avis d\'un vétérinaire NAC avant l\'acquisition si possible',
        ],
      },
    ],
  },
  {
    key: 'adult', label: 'Adulte', maxMonths: 96,
    tips: [
      {
        emoji: '⚖️', title: 'Pesez-le régulièrement',
        body: 'Le poids reste l\'indicateur de santé le plus fiable, quelle que soit l\'espèce.',
        why: 'C\'est la seule mesure objective accessible à la maison, et elle bouge avant les symptômes. Une courbe régulière vaut mieux qu\'une impression, surtout chez des espèces dont le pelage ou les plumes masquent la silhouette.',
      },
      {
        emoji: '🍽️', title: 'Vérifiez ses besoins spécifiques',
        body: 'Ration, température et hygrométrie varient énormément d\'une espèce à l\'autre : fiez-vous à une source vétérinaire.',
        why: 'Deux espèces proches d\'apparence peuvent avoir des besoins opposés. Appliquer le régime du voisin est l\'une des causes les plus fréquentes de carences chez les NAC.',
      },
      {
        emoji: '📅', title: 'Une visite de contrôle par an',
        body: 'Même sans symptôme : beaucoup d\'espèces masquent la douleur jusqu\'à un stade avancé.',
        why: 'La plupart de ces animaux sont des proies : montrer sa faiblesse les expose. Ce réflexe persiste en captivité, et c\'est ce qui explique les découvertes tardives.',
      },
    ],
    education: [
      {
        emoji: '👀', title: 'Observer dix minutes par jour, sans intervenir',
        body: 'Regardez-le vivre sans le solliciter : posture, respiration, déplacements, appétit.',
        why: 'Un animal observé pendant qu\'on interagit avec lui adapte son comportement. C\'est en le regardant à distance qu\'apparaissent les écarts réels : une respiration plus rapide, un appui différent, une zone qu\'il ne visite plus.',
        steps: [
          'Choisir un moment fixe, quand il est actif',
          'Rester à distance, sans le solliciter',
          'Comparer avec ce que vous avez noté les jours précédents',
          'Signaler tout écart persistant plus de deux jours',
        ],
      },
    ],
  },
  {
    key: 'senior', label: 'Senior', maxMonths: Infinity,
    tips: [
      {
        emoji: '🩺', title: 'Passez à deux visites par an',
        body: 'Le suivi rapproché est ce qui change le plus le pronostic chez un animal âgé.',
        why: 'Chez les espèces à vie courte, six mois représentent une part énorme de l\'espérance de vie : ce qui est indétectable à une visite peut être avancé à la suivante. C\'est le rythme qui fait la différence, pas la profondeur de l\'examen.',
      },
      {
        emoji: '🛏️', title: 'Simplifiez ses déplacements',
        body: 'Nourriture, eau et couchage à portée immédiate, sans obstacle ni hauteur à franchir.',
        why: 'Un animal âgé renonce à se déplacer avant de montrer qu\'il souffre. La baisse de prise alimentaire que l\'on attribue à l\'âge n\'est alors qu\'une question d\'accès, et elle se corrige en déplaçant une gamelle.',
      },
      {
        emoji: '👀', title: 'Surveillez les petits changements',
        body: 'Moins d\'activité, appétit en baisse ou isolement méritent un avis, même s\'ils semblent anodins.',
        why: 'Chez ces espèces, ces signaux discrets sont souvent les seuls disponibles : il n\'y a ni boiterie franche ni plainte. Les prendre au sérieux tôt est ce qui laisse une marge de manœuvre thérapeutique.',
      },
    ],
    education: [
      {
        emoji: '🧾', title: 'Préparer la consultation à l\'avance',
        body: 'Arrivez avec la courbe de poids, des photos et la liste datée de ce qui a changé.',
        why: 'Face à une espèce peu courante, le vétérinaire dispose de peu de repères standard. Votre historique devient la principale base de comparaison, et il oriente le diagnostic plus vite que n\'importe quel examen à l\'aveugle.',
        steps: [
          'Apporter le carnet de poids',
          'Photographier ou filmer le comportement inhabituel',
          'Lister les changements récents de maintenance ou d\'alimentation',
          'Noter les questions avant la consultation',
        ],
      },
    ],
  },
]

// ─── Profils ─────────────────────────────────────────────────────────────────

export const PET_KINDS: PetKindProfile[] = [
  {
    kind: 'dog', species: 'dog', label: 'Chien', answerLabel: 'Un chien', emoji: '🐕',
    intro: 'Un chien, on va bien s\'occuper de lui 🐕',
    breedPrefill: '',
    accent: '#C4813C', accentSoft: colors.beigeLight, gradient: ['#F7EFE3', '#E7D2B4'],
    breedQuestion: 'Vous connaissez sa race ?',
    breedSuggestions: ['Croisé', 'Labrador', 'Berger allemand', 'Golden retriever', 'Bouledogue français', 'Chihuahua'],
    ageChips: [
      { label: 'Moins d\'1 an', months: 6 },
      { label: '1 à 3 ans', months: 24 },
      { label: '3 à 7 ans', months: 60 },
      { label: 'Plus de 7 ans', months: 108 },
    ],
    weightHint: 'Ex : 12.5',
    stages: DOG_STAGES,
  },
  {
    kind: 'cat', species: 'cat', label: 'Chat', answerLabel: 'Un chat', emoji: '🐱',
    intro: 'Un chat, très bien 🐱',
    breedPrefill: '',
    accent: colors.blue, accentSoft: colors.blueLight, gradient: ['#EDF2FB', '#D3E0F5'],
    breedQuestion: 'Vous connaissez sa race ?',
    breedSuggestions: ['Européen', 'Maine coon', 'Siamois', 'Bengal', 'Persan', 'Croisé'],
    ageChips: [
      { label: 'Moins d\'1 an', months: 6 },
      { label: '1 à 3 ans', months: 24 },
      { label: '3 à 10 ans', months: 72 },
      { label: 'Plus de 10 ans', months: 144 },
    ],
    weightHint: 'Ex : 4.2',
    stages: CAT_STAGES,
  },
  {
    kind: 'rabbit', species: 'nac', label: 'Lapin', answerLabel: 'Un lapin', emoji: '🐰',
    intro: 'Un lapin — une espèce fragile et passionnante 🐰',
    breedPrefill: 'Lapin',
    accent: colors.green, accentSoft: colors.greenLight, gradient: ['#EFF6E4', '#D8E9C0'],
    breedQuestion: 'Vous connaissez sa race ?',
    breedSuggestions: ['Nain bélier', 'Tête de lion', 'Rex', 'Géant des Flandres', 'Lapin de garenne'],
    ageChips: [
      { label: 'Moins de 8 mois', months: 4 },
      { label: '8 mois à 2 ans', months: 16 },
      { label: '2 à 5 ans', months: 42 },
      { label: 'Plus de 5 ans', months: 78 },
    ],
    weightHint: 'Ex : 1.8',
    stages: RABBIT_STAGES,
  },
  {
    kind: 'rodent', species: 'nac', label: 'Rongeur', answerLabel: 'Un rongeur', emoji: '🐹',
    intro: 'Un rongeur — petit format, grande attention 🐹',
    breedPrefill: 'Rongeur',
    accent: colors.orange, accentSoft: colors.orangeLight, gradient: ['#FDF1E9', '#F8D9C2'],
    breedQuestion: 'C\'est lequel exactement ?',
    breedSuggestions: ['Cochon d\'Inde', 'Hamster', 'Rat domestique', 'Souris', 'Gerbille', 'Chinchilla'],
    ageChips: [
      { label: 'Moins de 6 mois', months: 3 },
      { label: '6 mois à 2 ans', months: 14 },
      { label: 'Plus de 2 ans', months: 32 },
    ],
    weightHint: 'Ex : 0.9',
    stages: RODENT_STAGES,
  },
  {
    kind: 'ferret', species: 'nac', label: 'Furet', answerLabel: 'Un furet', emoji: '🦦',
    intro: 'Un furet, sacré caractère 🦦',
    breedPrefill: 'Furet',
    accent: '#8A6E52', accentSoft: colors.beigeLight, gradient: ['#F5EDE3', '#E3D0B8'],
    breedQuestion: 'Sa robe, vous la connaissez ?',
    breedSuggestions: ['Putoisé', 'Albinos', 'Zibeline', 'Silver', 'Champagne'],
    ageChips: [
      { label: 'Moins d\'1 an', months: 6 },
      { label: '1 à 4 ans', months: 30 },
      { label: 'Plus de 4 ans', months: 60 },
    ],
    weightHint: 'Ex : 1.2',
    stages: FERRET_STAGES,
  },
  {
    kind: 'bird', species: 'nac', label: 'Oiseau', answerLabel: 'Un oiseau', emoji: '🦜',
    intro: 'Un oiseau, très bon choix 🦜',
    breedPrefill: 'Oiseau',
    accent: '#3FA095', accentSoft: '#E6F3F1', gradient: ['#E9F5F3', '#C9E6E1'],
    breedQuestion: 'Quel oiseau est-ce ?',
    breedSuggestions: ['Perruche ondulée', 'Calopsitte', 'Canari', 'Inséparable', 'Perroquet gris', 'Mandarin'],
    ageChips: [
      { label: 'Moins d\'1 an', months: 6 },
      { label: '1 à 8 ans', months: 48 },
      { label: 'Plus de 8 ans', months: 120 },
    ],
    weightHint: 'Ex : 0.09',
    stages: BIRD_STAGES,
  },
  {
    kind: 'reptile', species: 'nac', label: 'Reptile', answerLabel: 'Un reptile', emoji: '🦎',
    intro: 'Un reptile — tout se joue sur son installation 🦎',
    breedPrefill: 'Reptile',
    accent: colors.greenDark, accentSoft: colors.greenLight, gradient: ['#EDF4E2', '#D2E5B7'],
    breedQuestion: 'Quelle espèce est-ce ?',
    breedSuggestions: ['Pogona', 'Gecko léopard', 'Serpent des blés', 'Python royal', 'Tortue de terre', 'Iguane'],
    ageChips: [
      { label: 'Moins de 2 ans', months: 12 },
      { label: '2 à 10 ans', months: 60 },
      { label: 'Plus de 10 ans', months: 144 },
    ],
    weightHint: 'Ex : 0.4',
    stages: REPTILE_STAGES,
  },
  {
    kind: 'other', species: 'nac', label: 'Autre', answerLabel: 'Un autre animal', emoji: '🐾',
    intro: 'Très bien, on note ça 🐾',
    breedPrefill: '',
    accent: colors.gray[600], accentSoft: colors.gray[100], gradient: ['#F5F1EB', '#E2D8CB'],
    breedQuestion: 'Vous pouvez préciser l\'espèce ?',
    breedSuggestions: [],
    ageChips: [
      { label: 'Moins d\'1 an', months: 6 },
      { label: '1 à 8 ans', months: 48 },
      { label: 'Plus de 8 ans', months: 120 },
    ],
    weightHint: 'Ex : 2.5',
    stages: OTHER_STAGES,
  },
]

const KIND_BY_KEY = PET_KINDS.reduce<Record<PetKind, PetKindProfile>>((acc, p) => {
  acc[p.kind] = p
  return acc
}, {} as Record<PetKind, PetKindProfile>)

export function getKindProfile(kind: PetKind): PetKindProfile {
  return KIND_BY_KEY[kind] ?? KIND_BY_KEY.other
}

/** Mots-clés permettant de retrouver le kind d'un NAC depuis sa race. */
const NAC_PATTERNS: { kind: PetKind; re: RegExp }[] = [
  { kind: 'rabbit',  re: /lapin|belier|bélier|lion|garenne|flandre|angora/ },
  { kind: 'ferret',  re: /furet|putois|zibeline/ },
  { kind: 'rodent',  re: /rongeur|hamster|cochon|rat\b|souris|gerbille|chinchilla|octodon|degue|dègue|ecureuil|écureuil/ },
  { kind: 'bird',    re: /oiseau|perruche|calopsitte|canari|inseparable|inséparable|perroquet|mandarin|ara\b|cacatoes|cacatoès|gris du gabon/ },
  { kind: 'reptile', re: /reptile|pogona|gecko|serpent|python|boa|tortue|iguane|cameleon|caméléon|lezard|lézard|agame/ },
]

/** Retrouve le kind fin d'un animal à partir de son espèce et de sa race. */
export function resolveKind(pet: { species: Species | string; breed?: string | null }): PetKind {
  if (pet.species === 'dog') return 'dog'
  if (pet.species === 'cat') return 'cat'

  const breed = (pet.breed ?? '').toLowerCase()
  if (!breed) return 'other'
  const match = NAC_PATTERNS.find((p) => p.re.test(breed))
  return match ? match.kind : 'other'
}

export function getPetProfile(pet: { species: Species | string; breed?: string | null }): PetKindProfile {
  return getKindProfile(resolveKind(pet))
}

/**
 * Race à stocker en base pour rester capable de retrouver le kind ensuite.
 * « Albinos » pour un furet deviendrait un NAC indéterminé : on le préfixe
 * alors par le type ("Furet Albinos"). Une race déjà parlante reste intacte.
 */
export function breedForKind(kind: PetKind, answer?: string | null): string | undefined {
  const profile = getKindProfile(kind)
  const clean = answer?.trim()

  if (!clean) return profile.breedPrefill || undefined
  if (resolveKind({ species: profile.species, breed: clean }) === kind) return clean
  return profile.breedPrefill ? `${profile.breedPrefill} ${clean}` : clean
}

// ─── Âge & stade de vie ──────────────────────────────────────────────────────

/** Date de naissance approximative (1er du mois) pour un âge donné en mois. */
export function birthDateFromMonths(months: number): string {
  const d = new Date()
  d.setDate(1)
  d.setMonth(d.getMonth() - months)
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return `${d.getFullYear()}-${month}-01`
}

export function ageInMonths(birthDate: string | null | undefined): number | null {
  if (!birthDate) return null
  const birth = new Date(birthDate)
  if (isNaN(birth.getTime())) return null

  const now = new Date()
  let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
  if (now.getDate() < birth.getDate()) months -= 1
  return Math.max(0, months)
}

export function formatAge(months: number): string {
  if (months < 1) return 'moins d\'un mois'
  if (months < 24) return `${months} mois`

  const years = Math.floor(months / 12)
  const rest = months % 12
  if (rest === 0) return `${years} ans`
  return `${years} ans et ${rest} mois`
}

/** Stade de vie d'un animal ; `adult` par défaut quand la date de naissance manque. */
export function getLifeStage(kind: PetKind, birthDate: string | null | undefined): LifeStage {
  const profile = getKindProfile(kind)
  const months = ageInMonths(birthDate)
  if (months === null) return profile.stages.find((s) => s.key === 'adult') ?? profile.stages[0]
  return profile.stages.find((s) => months < s.maxMonths) ?? profile.stages[profile.stages.length - 1]
}

export function getStageTips(pet: { species: Species | string; breed?: string | null; birthDate?: string | null }): Tip[] {
  return getLifeStage(resolveKind(pet), pet.birthDate).tips
}

/** Sujets d'éducation adaptés à l'espèce et au stade de vie. */
export function getEducationTopics(pet: { species: Species | string; breed?: string | null; birthDate?: string | null }): EducationTopic[] {
  return getLifeStage(resolveKind(pet), pet.birthDate).education
}

/** « Chiot de 4 mois », « Adulte » si l'âge est inconnu. */
export function describeStage(pet: { species: Species | string; breed?: string | null; birthDate?: string | null }): string {
  const stage = getLifeStage(resolveKind(pet), pet.birthDate)
  const months = ageInMonths(pet.birthDate)
  return months === null ? stage.label : `${stage.label} · ${formatAge(months)}`
}
