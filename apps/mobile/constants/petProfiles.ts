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
}

export interface LifeStage {
  key: LifeStageKey
  /** Libellé propre à l'espèce : « Chiot », « Lapereau »… */
  label: string
  /** Borne haute exclusive, en mois. Infinity pour le dernier stade. */
  maxMonths: number
  tips: Tip[]
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
      { emoji: '💉', title: 'Le protocole vaccinal se termine vers 16 semaines', body: 'Les injections s\'enchaînent toutes les 3 à 4 semaines, avec un rappel un an plus tard. Notez chaque date dans son carnet de santé.' },
      { emoji: '🐾', title: 'La fenêtre de socialisation se referme vite', body: 'Jusqu\'à environ 4 mois, faites-lui découvrir un maximum de bruits, sols, personnes et congénères — toujours en douceur et sans le forcer.' },
      { emoji: '🍽️', title: '3 repas par jour jusqu\'à 6 mois', body: 'Une alimentation « junior » adaptée à sa taille adulte estimée : les besoins d\'un futur grand chien n\'ont rien à voir avec ceux d\'un petit format.' },
    ],
  },
  {
    key: 'adult', label: 'Adulte', maxMonths: 84,
    tips: [
      { emoji: '🦷', title: 'Le tartre est le premier motif de soins dentaires', body: 'Un brossage 2 à 3 fois par semaine, commencé progressivement, retarde nettement le premier détartrage sous anesthésie.' },
      { emoji: '🏃', title: 'Comptez au moins 1 h d\'activité par jour', body: 'Variez marche, jeu et travail d\'odorat : la stimulation mentale fatigue autant qu\'une longue balade.' },
      { emoji: '📅', title: 'Une visite de contrôle par an suffit généralement', body: 'Rappels de vaccins, poids, dents et vermifuge en une seule consultation — l\'occasion de repérer ce qui passe inaperçu au quotidien.' },
    ],
  },
  {
    key: 'senior', label: 'Senior', maxMonths: Infinity,
    tips: [
      { emoji: '🩺', title: 'Passez à un bilan tous les 6 mois', body: 'À partir de 7 ans, une visite semestrielle avec prise de sang permet de dépister tôt les soucis rénaux, thyroïdiens et articulaires.' },
      { emoji: '⚖️', title: 'Pesez-le chaque mois', body: 'Une variation rapide de poids, à la hausse comme à la baisse, est souvent le tout premier signal d\'alerte.' },
      { emoji: '🛏️', title: 'Adaptez son environnement', body: 'Couchage épais, tapis sur les sols glissants et balades plus courtes mais plus fréquentes ménagent ses articulations.' },
    ],
  },
]

const CAT_STAGES: LifeStage[] = [
  {
    key: 'baby', label: 'Chaton', maxMonths: 12,
    tips: [
      { emoji: '💉', title: 'Typhus et coryza dès 8 semaines', body: 'Un rappel 3 à 4 semaines après la première injection, puis un an plus tard. La leucose s\'y ajoute s\'il sort.' },
      { emoji: '🪪', title: 'L\'identification est obligatoire', body: 'Puce ou tatouage : c\'est la loi en France, et c\'est ce qui permet de le retrouver s\'il disparaît.' },
      { emoji: '🍽️', title: 'Une alimentation croissance jusqu\'à 12 mois', body: 'Des repas fractionnés, de l\'eau toujours accessible, et une gamelle éloignée de la litière.' },
    ],
  },
  {
    key: 'adult', label: 'Adulte', maxMonths: 120,
    tips: [
      { emoji: '💧', title: 'Le chat boit spontanément trop peu', body: 'Pâtée, fontaine et plusieurs points d\'eau répartis dans le logement réduisent nettement le risque de troubles urinaires.' },
      { emoji: '🧶', title: '10 à 15 min de jeu actif par jour', body: 'Canne à pêche, arbre à chat et griffoirs : l\'ennui est la première cause de surpoids et de comportements gênants.' },
      { emoji: '🦟', title: 'Antiparasitaires toute l\'année', body: 'Puces en continu, vermifuge 2 à 4 fois par an selon son accès à l\'extérieur — même un chat d\'intérieur est concerné.' },
    ],
  },
  {
    key: 'senior', label: 'Senior', maxMonths: Infinity,
    tips: [
      { emoji: '🩺', title: 'Les reins se surveillent dès 10 ans', body: 'L\'insuffisance rénale est fréquente et silencieuse : un bilan sanguin et urinaire annuel change tout sur la prise en charge.' },
      { emoji: '⚖️', title: 'Maigrir en mangeant beaucoup n\'est pas normal', body: 'C\'est un signe classique d\'hyperthyroïdie chez le chat âgé : une consultation s\'impose sans attendre.' },
      { emoji: '🛋️', title: 'Facilitez ses accès', body: 'Litière à bords bas, petites marches vers ses spots favoris et couchage au chaud pour ménager ses articulations.' },
    ],
  },
]

const RABBIT_STAGES: LifeStage[] = [
  {
    key: 'baby', label: 'Lapereau', maxMonths: 8,
    tips: [
      { emoji: '🌿', title: 'Le foin, c\'est 80 % de la ration', body: 'À volonté dès le sevrage : il use les dents qui poussent en continu et fait tourner le transit.' },
      { emoji: '💉', title: 'Myxomatose et VHD se vaccinent', body: 'Possible dès 5 semaines puis rappel annuel — y compris pour un lapin qui ne sort jamais, les insectes suffisent à contaminer.' },
      { emoji: '🏠', title: 'Plusieurs heures hors enclos chaque jour', body: 'Un lapin enfermé en permanence développe troubles osseux et comportements stéréotypés.' },
    ],
  },
  {
    key: 'adult', label: 'Adulte', maxMonths: 60,
    tips: [
      { emoji: '⏱️', title: 'Un arrêt de transit est une urgence', body: 'Plus de crottes et plus d\'appétit depuis 12 h : direction un vétérinaire NAC le jour même, sans attendre.' },
      { emoji: '🦷', title: 'Les dents poussent toute sa vie', body: 'Bave, mâchouillage difficile ou tri dans la gamelle sont presque toujours des signes dentaires.' },
      { emoji: '🥕', title: 'Peu de granulés, beaucoup de verdure', body: 'Une petite poignée de granulés par jour suffit, complétée de légumes verts variés introduits progressivement.' },
    ],
  },
  {
    key: 'senior', label: 'Senior', maxMonths: Infinity,
    tips: [
      { emoji: '🩺', title: 'Un examen tous les 6 mois après 5 ans', body: 'Dents, poids et arthrose : les trois points qui décident du confort d\'un lapin âgé.' },
      { emoji: '🧼', title: 'Vérifiez son arrière-train chaque jour', body: 'Un lapin âgé se toilette moins bien ; des souillures attirent les mouches et provoquent des myiases, très graves.' },
      { emoji: '🛏️', title: 'Un sol souple prévient les pododermatites', body: 'Tapis et litière épaisse soulagent des pattes fragilisées par l\'âge et le poids.' },
    ],
  },
]

const RODENT_STAGES: LifeStage[] = [
  {
    key: 'baby', label: 'Jeune', maxMonths: 6,
    tips: [
      { emoji: '🏠', title: 'L\'installation décide de son stress', body: 'Un habitat spacieux, une litière non poussiéreuse et plusieurs cachettes suffisent à faire passer les premiers jours.' },
      { emoji: '🍊', title: 'Le cochon d\'Inde a besoin de vitamine C', body: 'Il ne la synthétise pas : un apport quotidien est indispensable. Les autres rongeurs ont chacun leurs besoins propres.' },
      { emoji: '🤝', title: 'Apprivoisez quelques minutes par jour', body: 'Main ouverte, friandise, jamais de saisie par le dessus : la confiance se construit en 2 à 3 semaines.' },
    ],
  },
  {
    key: 'adult', label: 'Adulte', maxMonths: 24,
    tips: [
      { emoji: '⚖️', title: 'Une pesée par mois vaut tous les examens', body: 'Chez un petit rongeur, la perte de poids est souvent le premier signe visible d\'un problème.' },
      { emoji: '🌬️', title: 'Les soucis respiratoires évoluent vite', body: 'Éternuements répétés, respiration bruyante ou nez humide : consultez dès les premiers signes, pas la semaine suivante.' },
      { emoji: '🎡', title: 'L\'ennui se voit dans le comportement', body: 'Tunnels, roue pleine adaptée à sa taille et fourrage à explorer préviennent les stéréotypies.' },
    ],
  },
  {
    key: 'senior', label: 'Senior', maxMonths: Infinity,
    tips: [
      { emoji: '🩺', title: 'Palpez-le régulièrement', body: 'Les masses mammaires sont fréquentes chez le rongeur âgé et souvent opérables quand elles sont prises tôt.' },
      { emoji: '🍚', title: 'Ramollissez sa nourriture si besoin', body: 'Quand la mastication devient difficile, humidifier les granulés maintient l\'apport et évite l\'amaigrissement.' },
      { emoji: '🌡️', title: 'Ni courant d\'air, ni coup de chaud', body: 'Un rongeur âgé supporte mal les écarts : gardez son habitat à température stable, loin des fenêtres.' },
    ],
  },
]

const FERRET_STAGES: LifeStage[] = [
  {
    key: 'baby', label: 'Fureton', maxMonths: 12,
    tips: [
      { emoji: '💉', title: 'La maladie de Carré est mortelle chez le furet', body: 'Primovaccination dès 8 semaines puis rappel annuel : c\'est le vaccin à ne pas manquer.' },
      { emoji: '😴', title: 'Jusqu\'à 18 h de sommeil par jour', body: 'C\'est normal — ce sont ses phases d\'éveil qui doivent être vives et curieuses.' },
      { emoji: '🦷', title: 'Le mordillement s\'éduque', body: 'Il joue avec la gueule : redirigez systématiquement vers un jouet, sans le brusquer ni le punir.' },
    ],
  },
  {
    key: 'adult', label: 'Adulte', maxMonths: 48,
    tips: [
      { emoji: '🚫', title: 'Les corps étrangers sont sa première urgence', body: 'Caoutchouc, mousse, bouchons : le furet avale tout. Sécurisez la pièce avant chaque sortie.' },
      { emoji: '🏃', title: 'Au moins 4 h hors cage par jour', body: 'Dans un espace vérifié : trous, machines, plantes toxiques et canapés repérés à l\'avance.' },
      { emoji: '🦟', title: 'Mêmes parasites qu\'un chat', body: 'Puces et vers se traitent avec des produits adaptés au furet, y compris pour un animal d\'intérieur.' },
    ],
  },
  {
    key: 'senior', label: 'Senior', maxMonths: Infinity,
    tips: [
      { emoji: '🩺', title: 'Surrénales et insulinome après 3-4 ans', body: 'Perte de poils symétrique, faiblesse de l\'arrière-train ou moments d\'absence justifient un bilan rapide.' },
      { emoji: '⚖️', title: 'Pesée mensuelle', body: 'Le furet âgé maigrit discrètement sous son pelage : la balance le voit avant vous.' },
      { emoji: '🛏️', title: 'Hamacs bas et rampes', body: 'Limitez les sauts en hauteur et rapprochez litière, eau et couchage de son espace de repos.' },
    ],
  },
]

const BIRD_STAGES: LifeStage[] = [
  {
    key: 'baby', label: 'Jeune', maxMonths: 12,
    tips: [
      { emoji: '🪵', title: 'Des perchoirs de diamètres variés', body: 'En bois naturel plutôt qu\'en plastique lisse : cela prévient les lésions plantaires et muscle ses pattes.' },
      { emoji: '🌤️', title: '10 à 12 h d\'obscurité par nuit', body: 'Un rythme jour/nuit régulier conditionne son comportement, sa mue et son équilibre hormonal.' },
      { emoji: '🍎', title: 'Un régime 100 % graines carence l\'oiseau', body: 'Introduisez tôt granulés, légumes et fruits : les habitudes alimentaires se figent avec l\'âge.' },
    ],
  },
  {
    key: 'adult', label: 'Adulte', maxMonths: 96,
    tips: [
      { emoji: '🔥', title: 'Le Téflon surchauffé tue les oiseaux', body: 'Poêles antiadhésives, fumée, bougies parfumées et aérosols : leur système respiratoire ne pardonne rien.' },
      { emoji: '🧠', title: 'L\'ennui provoque le picage', body: 'Fourrageage, jouets à détruire et interactions quotidiennes valent mieux que n\'importe quel traitement du plumage.' },
      { emoji: '⚠️', title: 'Un oiseau cache la maladie', body: 'Plumes ébouriffées, fientes modifiées ou silence inhabituel signifient souvent que ça dure déjà depuis un moment.' },
    ],
  },
  {
    key: 'senior', label: 'Senior', maxMonths: Infinity,
    tips: [
      { emoji: '🩺', title: 'Un bilan aviaire par an', body: 'Poids, bec, griffes et analyse sanguine chez un vétérinaire qui suit régulièrement des oiseaux.' },
      { emoji: '🦶', title: 'Perchoirs plus larges et plus bas', body: 'Réduisez les hauteurs de vol et de saut pour ménager articulations et pattes.' },
      { emoji: '⚖️', title: 'Pesée hebdomadaire', body: 'Quelques grammes comptent énormément chez un oiseau : une balance de cuisine suffit.' },
    ],
  },
]

const REPTILE_STAGES: LifeStage[] = [
  {
    key: 'baby', label: 'Juvénile', maxMonths: 24,
    tips: [
      { emoji: '🌡️', title: 'Le gradient thermique conditionne tout', body: 'Point chaud et zone fraîche, mesurés au thermomètre : sans la bonne température, il ne digère pas.' },
      { emoji: '☀️', title: 'Les UVB se remplacent tous les 6 à 12 mois', body: 'Le tube continue d\'éclairer bien après avoir cessé d\'émettre — d\'où les maladies osseuses chez les juvéniles.' },
      { emoji: '🍽️', title: 'Un juvénile mange bien plus souvent', body: 'Le rythme de nourrissage dépend de l\'espèce et chute nettement au passage à l\'âge adulte.' },
    ],
  },
  {
    key: 'adult', label: 'Adulte', maxMonths: 120,
    tips: [
      { emoji: '💧', title: 'Une hygrométrie inadaptée abîme les mues', body: 'Doigts et bout de queue sont les premiers touchés : surveillez chaque mue de près.' },
      { emoji: '🦴', title: 'Calcium et D3 pour les insectivores', body: 'La complémentation régulière évite des carences invisibles jusqu\'au jour où elles ne le sont plus.' },
      { emoji: '🧽', title: 'Hygiène du terrarium et des mains', body: 'Point d\'eau nettoyé quotidiennement et lavage des mains systématique après manipulation (salmonelles).' },
    ],
  },
  {
    key: 'senior', label: 'Senior', maxMonths: Infinity,
    tips: [
      { emoji: '🩺', title: 'Un contrôle annuel chez un vétérinaire NAC', body: 'Poids, qualité des mues et cavité buccale chez un praticien habitué aux reptiles.' },
      { emoji: '🌡️', title: 'Des paramètres encore plus stables', body: 'Un reptile âgé encaisse mal les variations : vérifiez régulièrement thermostat et sondes.' },
      { emoji: '🍽️', title: 'Des rations plus espacées', body: 'Le métabolisme ralentit ; conserver le rythme d\'un adulte jeune mène tout droit à l\'obésité.' },
    ],
  },
]

const OTHER_STAGES: LifeStage[] = [
  {
    key: 'baby', label: 'Jeune', maxMonths: 12,
    tips: [
      { emoji: '🔎', title: 'Trouvez un vétérinaire NAC dès maintenant', body: 'Tous les cabinets ne prennent pas les espèces exotiques : mieux vaut le savoir avant l\'urgence.' },
      { emoji: '📓', title: 'Notez tout dès le départ', body: 'Poids, alimentation et petits changements de comportement : c\'est ce qui rend une consultation efficace.' },
      { emoji: '🏠', title: 'L\'environnement avant tout', body: 'Chez la plupart des espèces exotiques, les maladies viennent d\'abord de conditions de vie inadaptées.' },
    ],
  },
  {
    key: 'adult', label: 'Adulte', maxMonths: 96,
    tips: [
      { emoji: '⚖️', title: 'Pesez-le régulièrement', body: 'Le poids reste l\'indicateur de santé le plus fiable, quelle que soit l\'espèce.' },
      { emoji: '🍽️', title: 'Vérifiez ses besoins spécifiques', body: 'Ration, température et hygrométrie varient énormément d\'une espèce à l\'autre : fiez-vous à une source vétérinaire.' },
      { emoji: '📅', title: 'Une visite de contrôle par an', body: 'Même sans symptôme : beaucoup d\'espèces masquent la douleur jusqu\'à un stade avancé.' },
    ],
  },
  {
    key: 'senior', label: 'Senior', maxMonths: Infinity,
    tips: [
      { emoji: '🩺', title: 'Passez à deux visites par an', body: 'Le suivi rapproché est ce qui change le plus le pronostic chez un animal âgé.' },
      { emoji: '🛏️', title: 'Simplifiez ses déplacements', body: 'Nourriture, eau et couchage à portée immédiate, sans obstacle ni hauteur à franchir.' },
      { emoji: '👀', title: 'Surveillez les petits changements', body: 'Moins d\'activité, appétit en baisse ou isolement méritent un avis, même s\'ils semblent anodins.' },
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

/** « Chiot de 4 mois », « Adulte » si l'âge est inconnu. */
export function describeStage(pet: { species: Species | string; breed?: string | null; birthDate?: string | null }): string {
  const stage = getLifeStage(resolveKind(pet), pet.birthDate)
  const months = ageInMonths(pet.birthDate)
  return months === null ? stage.label : `${stage.label} · ${formatAge(months)}`
}
