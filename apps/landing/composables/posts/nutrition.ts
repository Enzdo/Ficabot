import type { BlogPost } from './types'

// [SEO-BLOG] Cluster "Nutrition" — 10 articles. Rempli par un agent.
export const nutritionPosts: BlogPost[] = [
  {
    slug: 'croquettes-ou-patee-choisir',
    title: 'Croquettes ou pâtée : que choisir pour son animal ?',
    excerpt: "Croquettes ou pâtée, chacune a ses atouts selon l'animal, son âge et son mode de vie. Voici comment trancher sans se tromper.",
    category: 'Nutrition',
    target: 'owner',
    author: 'Équipe Ficana',
    date: '8 Fév 2026',
    readTime: '5 min',
    image: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1469&q=80',
    content: `<p class="lead">La question revient à chaque achat : croquettes ou pâtée ? Les deux formats peuvent convenir à un chien ou à un chat, à condition de comprendre ce qu'ils apportent réellement et comment ils s'intègrent dans la ration quotidienne.</p>

<h2>Ce que contient chaque format</h2>
<p>Les croquettes sont une alimentation sèche, déshydratée, qui contient en moyenne 8 à 10 % d'eau. La pâtée, elle, en contient 70 à 80 %. Cette différence change beaucoup de choses au niveau de la digestion, du volume servi et de l'apport en eau libre.</p>
<p>Les deux formats peuvent être complets et équilibrés. Ce qui compte, c'est la qualité des ingrédients, le taux de protéines animales, la digestibilité et la mention <strong>"aliment complet"</strong> sur l'emballage.</p>

<h2>Les avantages et limites des croquettes</h2>
<p>Les croquettes sont pratiques, économiques sur la durée et se conservent plusieurs semaines une fois le sachet ouvert. Leur texture aide aussi à limiter le tartre, sans le remplacer le brossage.</p>
<ul>
  <li>Faciles à doser et à distribuer en libre-service ou en distributeur automatique</li>
  <li>Moins chères au kilo qu'une pâtée de qualité équivalente</li>
  <li>Apport en eau très faible, ce qui pose problème pour les chats peu buveurs</li>
  <li>Souvent plus riches en glucides, parfois mal tolérés par certains animaux</li>
</ul>

<h2>Les avantages et limites de la pâtée</h2>
<p>La pâtée est plus appétente, mieux acceptée par les animaux difficiles, et contribue à l'hydratation. Elle est particulièrement intéressante chez le chat, sujet aux problèmes urinaires, et chez l'animal âgé qui mange moins.</p>
<ul>
  <li>Apport en eau important, utile pour les reins et la vessie</li>
  <li>Texture adaptée aux dents fragiles ou aux suites de soins dentaires</li>
  <li>Conservation très courte une fois la barquette ouverte</li>
  <li>Coût plus élevé pour une ration quotidienne complète</li>
</ul>

<h2>Le mix : souvent le meilleur compromis</h2>
<p>Pour beaucoup de foyers, l'alternance croquettes le matin, pâtée le soir fonctionne bien. Elle combine la praticité du sec et l'hydratation de l'humide. Il faut alors ajuster les quantités pour ne pas dépasser les besoins caloriques de l'animal, sinon la prise de poids est rapide.</p>
<p>Si vous mélangez deux marques ou deux formats, faites une transition progressive sur sept à dix jours pour éviter les troubles digestifs. En cas de pathologie chronique, diabète, insuffisance rénale, allergies, l'avis du vétérinaire reste indispensable avant tout changement.</p>

<p>Il n'y a pas de format universellement meilleur. Le bon choix est celui qui convient à votre animal, à son état de santé et à votre quotidien, sans déséquilibrer la ration.</p>`
  },
  {
    slug: 'alimentation-barf-avantages-limites',
    title: 'Alimentation BARF : avantages, limites et transition',
    excerpt: "Le BARF séduit de plus en plus de propriétaires, mais cette ration crue demande méthode et rigueur. Voici les bases avant de se lancer.",
    category: 'Nutrition',
    target: 'owner',
    author: 'Équipe Ficana',
    date: '22 Fév 2026',
    readTime: '6 min',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1469&q=80',
    content: `<p class="lead">Le BARF, ou Biologically Appropriate Raw Food, consiste à nourrir son chien ou son chat avec une ration crue composée de viande, d'os charnus, d'abats et de légumes. Cette approche peut convenir, à condition d'en connaître les exigences réelles.</p>

<h2>Sur quoi repose le BARF</h2>
<p>L'idée est de se rapprocher de l'alimentation supposée naturelle des carnivores. La ration type contient en général 70 à 80 % de viande et d'os charnus, 10 % d'abats dont la moitié de foie, et le reste en légumes, parfois compléments d'huile ou d'algues.</p>
<p>Le BARF ne se résume pas à donner de la viande crue. Une ration mal construite expose à des carences en calcium, en taurine, en vitamines, ou à un excès de phosphore. Pour un usage durable, mieux vaut se faire accompagner par un vétérinaire nutritionniste.</p>

<h2>Les avantages observés</h2>
<ul>
  <li>Selles souvent plus petites et moins odorantes</li>
  <li>Pelage parfois plus brillant après quelques semaines</li>
  <li>Repas appétents, utiles pour les animaux difficiles</li>
  <li>Maîtrise totale des ingrédients pour les propriétaires attentifs</li>
</ul>
<p>Ces effets ne sont pas systématiques et dépendent beaucoup de la qualité des produits utilisés et de l'équilibre global de la ration sur la semaine.</p>

<h2>Les limites à connaître</h2>
<p>Le BARF n'est pas sans risque. La viande crue peut contenir des bactéries comme la salmonelle, la listeria ou des parasites. Cela pose un enjeu d'hygiène à la maison, en particulier dans les foyers avec jeunes enfants, personnes âgées ou immunodéprimées.</p>
<ul>
  <li>Coût et logistique : congélateur dédié, achats réguliers, préparation</li>
  <li>Risque de carence si la ration est mal équilibrée sur la durée</li>
  <li>Os crus mal choisis pouvant blesser le tube digestif</li>
  <li>Contre-indiqué chez certains animaux malades, jeunes ou immunodéprimés</li>
</ul>

<h2>Comment faire la transition</h2>
<p>Si vous décidez de passer au BARF, ne basculez pas du jour au lendemain. Comptez deux à quatre semaines de transition. Beaucoup de praticiens recommandent de commencer par une seule source de protéine, le temps de vérifier la tolérance digestive, avant d'introduire les abats puis les os charnus.</p>
<p>Quelques règles utiles dès le départ :</p>
<ul>
  <li>Acheter de la viande destinée à la consommation humaine ou en circuit dédié</li>
  <li>Décongeler au réfrigérateur, jamais à température ambiante</li>
  <li>Nettoyer gamelles et plans de travail après chaque repas</li>
  <li>Surveiller le poids, les selles et l'état du pelage pendant les premiers mois</li>
</ul>

<p>Le BARF peut être une bonne option, mais il demande du temps, de la rigueur et un suivi. Si vous hésitez, une ration ménagère cuite formulée par un vétérinaire reste une alternative intéressante, sans les contraintes du cru.</p>`
  },
  {
    slug: 'nourrir-chiot-etapes-croissance',
    title: 'Bien nourrir un chiot : les étapes clés de croissance',
    excerpt: "La croissance d'un chiot se joue en quelques mois seulement. Une alimentation adaptée évite de nombreux problèmes à l'âge adulte.",
    category: 'Nutrition',
    target: 'owner',
    author: 'Équipe Ficana',
    date: '8 Mar 2026',
    readTime: '5 min',
    image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1469&q=80',
    content: `<p class="lead">Un chiot ne se nourrit pas comme un chien adulte. Ses besoins en énergie, en protéines, en calcium et en phosphore sont spécifiques, et varient selon la taille adulte estimée. Voici comment accompagner sa croissance étape par étape.</p>

<h2>De la naissance au sevrage</h2>
<p>Pendant les trois à quatre premières semaines, le lait maternel couvre tous les besoins. Si l'allaitement n'est pas possible, on utilise un lait maternisé pour chiot, jamais du lait de vache, mal toléré et mal équilibré.</p>
<p>Le sevrage commence vers 3 à 4 semaines avec une bouillie tiède à base de croquettes chiot ramollies. Il se termine en général vers 7 à 8 semaines, âge auquel le chiot mange seul une alimentation solide adaptée.</p>

<h2>De 2 à 6 mois : la phase la plus intense</h2>
<p>C'est la période où le chiot prend le plus de poids. Il a besoin d'une alimentation très énergétique, riche en protéines animales de qualité, avec un rapport calcium/phosphore précis. Une croquette "chiot" ou "junior" de bonne qualité couvre ces besoins.</p>
<ul>
  <li>3 à 4 repas par jour jusqu'à 4 mois, puis 3 repas jusqu'à 6 mois</li>
  <li>Eau fraîche à disposition en permanence</li>
  <li>Quantités à ajuster chaque semaine selon le poids</li>
  <li>Pas de compléments en calcium sauf avis vétérinaire</li>
</ul>
<p>Chez les chiots de grande race, un excès d'énergie ou de calcium peut favoriser des troubles articulaires. Mieux vaut viser une croissance régulière plutôt que rapide.</p>

<h2>De 6 à 12 mois : ralentir progressivement</h2>
<p>La croissance ralentit. Les chiots de petite race atteignent leur poids adulte vers 8 à 10 mois, ceux de grande race vers 15 à 18 mois. On passe à deux repas par jour, en ajustant les quantités pour éviter la prise de gras.</p>
<p>Le passage à une alimentation adulte se fait au moment où la croissance est terminée, jamais avant. Pour un grand chien, c'est donc bien plus tard que pour un petit. Faites la transition sur une semaine en mélangeant progressivement les deux croquettes.</p>

<h2>Les erreurs fréquentes à éviter</h2>
<ul>
  <li>Donner les restes de table, source de déséquilibre et d'embonpoint</li>
  <li>Changer trop souvent de marque, ce qui fragilise le tube digestif</li>
  <li>Multiplier les friandises au-delà de 10 % de la ration quotidienne</li>
  <li>Sous-estimer l'eau, surtout chez les chiots nourris exclusivement aux croquettes</li>
</ul>

<p>Pesez votre chiot toutes les deux semaines et notez sa courbe. En cas de doute sur la croissance, sur la silhouette ou sur les selles, parlez-en à votre vétérinaire avant d'ajuster vous-même la ration. Un bon départ alimentaire facilite des années de santé stable.</p>`
  },
  {
    slug: 'nourrir-chaton-ce-quil-faut-savoir',
    title: "Bien nourrir un chaton : ce qu'il faut savoir",
    excerpt: "Un chaton triple son poids en quelques semaines. Son alimentation doit suivre, sans excès ni carence, pour bâtir un adulte solide.",
    category: 'Nutrition',
    target: 'owner',
    author: 'Équipe Ficana',
    date: '24 Mar 2026',
    readTime: '5 min',
    image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&auto=format&fit=crop&w=1469&q=80',
    content: `<p class="lead">Un chaton a des besoins très différents de ceux d'un chat adulte. Il grandit vite, dépense beaucoup et a un estomac petit. Bien gérer son alimentation pendant la première année conditionne en grande partie sa santé future.</p>

<h2>Les premières semaines</h2>
<p>Jusqu'à 4 semaines, le chaton dépend entièrement du lait maternel ou, à défaut, d'un lait maternisé pour chaton. Le lait de vache est à éviter : il provoque des diarrhées et n'apporte pas les nutriments adaptés.</p>
<p>Le sevrage débute vers la quatrième semaine. On propose alors une pâtée pour chaton, parfois mélangée à un peu de lait maternisé, puis on introduit progressivement des croquettes chaton humidifiées.</p>

<h2>De 2 à 6 mois : croissance rapide</h2>
<p>Sur cette période, le chaton mange peu à chaque repas mais souvent. Quatre à cinq repas par jour sont la norme. Son alimentation doit être très riche en protéines animales, en acides aminés essentiels comme la <strong>taurine</strong>, et en acides gras.</p>
<ul>
  <li>Croquettes ou pâtée portant la mention "chaton" ou "kitten"</li>
  <li>Eau fraîche à plusieurs endroits du logement</li>
  <li>Quantités revues toutes les deux semaines en fonction du poids</li>
  <li>Pas de lait, pas de restes de table, pas d'aliments salés ou sucrés</li>
</ul>

<h2>De 6 à 12 mois : stabilisation</h2>
<p>La croissance ralentit. On passe à trois repas par jour, puis deux vers la fin de la première année. Le chaton commence à ressembler à un chat adulte, mais ses besoins restent supérieurs jusqu'à 10 à 12 mois, parfois plus chez les grandes races comme le Maine Coon, qui finit sa croissance vers 18 à 24 mois.</p>
<p>Le passage à une alimentation adulte se fait quand la croissance est terminée, pas avant. La transition s'étale sur sept à dix jours en mélangeant progressivement les deux aliments.</p>

<h2>Hydratation et points de vigilance</h2>
<p>Le chat boit peu spontanément. Une alimentation 100 % croquettes augmente le risque de problèmes urinaires à long terme. Intégrer de la pâtée dans la journée, même partiellement, est une bonne habitude à prendre dès le plus jeune âge.</p>
<ul>
  <li>Surveiller le poids, l'appétit, les selles et la qualité du pelage</li>
  <li>Éviter les changements brusques d'aliment</li>
  <li>Limiter les friandises et privilégier des morceaux de viande cuite sans sel</li>
  <li>Consulter un vétérinaire en cas de perte d'appétit prolongée ou de diarrhée</li>
</ul>

<p>Un chaton bien nourri devient en général un chat adulte stable, avec un poids facile à maintenir et un pelage de bonne qualité. C'est sur ces premiers mois que se construisent les habitudes alimentaires sur lesquelles vous vous appuierez pendant toute sa vie.</p>`
  },
  {
    slug: 'alimentation-senior-apres-8-ans',
    title: 'Alimentation senior : adapter les repas après 8 ans',
    excerpt: "Après 8 ans, les besoins évoluent : moins d'énergie, plus de vigilance sur les organes. Voici comment ajuster la ration.",
    category: 'Nutrition',
    target: 'owner',
    author: 'Équipe Ficana',
    date: '10 Avr 2026',
    readTime: '5 min',
    image: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1469&q=80',
    content: `<p class="lead">Un chien ou un chat senior reste en forme longtemps si son alimentation suit son évolution. Les besoins changent, la silhouette aussi, et certains organes deviennent plus sensibles. Quelques ajustements suffisent souvent.</p>

<h2>Ce qui change avec l'âge</h2>
<p>À partir de 7 à 8 ans pour la plupart des chiens et 10 ans pour les chats, le métabolisme ralentit. L'animal bouge moins, dépense moins, et peut prendre du poids à ration égale. Dans le même temps, la masse musculaire diminue, ce qui plaide pour une alimentation plus riche en protéines de qualité, contrairement à une vieille croyance.</p>
<p>Les reins, le foie, les articulations et la denture deviennent plus sensibles. La ration doit en tenir compte, idéalement après un bilan vétérinaire pour repérer les pathologies débutantes.</p>

<h2>Les bons réflexes alimentaires</h2>
<ul>
  <li>Choisir un aliment "senior" ou "mature" adapté à l'espèce et à la taille</li>
  <li>Maintenir un apport en protéines correct, sauf indication médicale contraire</li>
  <li>Réduire l'apport calorique global de 10 à 20 % selon l'activité</li>
  <li>Privilégier la pâtée ou les croquettes humidifiées si la denture se fragilise</li>
</ul>
<p>Un animal senior peut aussi bénéficier d'apports ciblés comme les acides gras oméga 3, qui soutiennent les articulations et la peau. Ces compléments ne remplacent pas une ration équilibrée et doivent rester encadrés.</p>

<h2>Surveiller le poids et la silhouette</h2>
<p>La prise comme la perte de poids ont une valeur d'alerte chez l'animal âgé. Une perte progressive sans changement de ration justifie une consultation : insuffisance rénale, diabète, hyperthyroïdie chez le chat, ou cancer peuvent commencer ainsi.</p>
<p>À l'inverse, un surpoids accélère l'arthrose, fatigue le cœur et complique l'anesthésie en cas d'intervention. Repesez votre animal une fois par mois et notez la valeur. Un suivi écrit aide à repérer une tendance.</p>

<h2>Adapter la routine au quotidien</h2>
<ul>
  <li>Fractionner les repas en deux à trois prises plus petites</li>
  <li>Servir à hauteur si l'animal a du mal à se baisser</li>
  <li>Garder de l'eau fraîche à plusieurs endroits accessibles</li>
  <li>Limiter les changements brusques, plus difficiles à digérer</li>
</ul>

<p>Faire un bilan de santé annuel, voire semestriel après 10 ans, est utile pour ajuster la ration en lien avec le vétérinaire. L'alimentation senior n'est pas un produit, c'est une démarche d'observation et d'adaptation, à reconduire d'année en année.</p>`
  },
  {
    slug: 'chien-surpoids-comment-aider-mincir',
    title: "Mon chien est en surpoids : comment l'aider à mincir",
    excerpt: "Le surpoids touche un chien sur deux en France. Une perte de poids encadrée prolonge la vie et limite les douleurs articulaires.",
    category: 'Nutrition',
    target: 'owner',
    author: 'Équipe Ficana',
    date: '28 Avr 2026',
    readTime: '6 min',
    image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?ixlib=rb-4.0.3&auto=format&fit=crop&w=1469&q=80',
    content: `<p class="lead">Le surpoids est l'un des problèmes de santé les plus fréquents chez le chien. Il fatigue le cœur, aggrave l'arthrose, complique les anesthésies et raccourcit l'espérance de vie. Bonne nouvelle : il est réversible, avec méthode.</p>

<h2>Évaluer la situation sans se mentir</h2>
<p>Avant de modifier quoi que ce soit, il faut savoir où on en est. Le poids seul ne suffit pas. On utilise le score corporel, une grille en 9 points qui tient compte de la silhouette : côtes palpables, taille marquée vue de dessus, ventre relevé vu de profil.</p>
<p>Au-delà d'un score de 6 sur 9, on parle de surpoids. À 8 ou 9, d'obésité. Un vétérinaire peut vous aider à coter votre chien et à fixer un poids cible réaliste.</p>

<h2>Construire un plan de perte de poids</h2>
<p>L'objectif est une perte lente, autour de 1 à 2 % du poids par semaine. Trop rapide, la perte fatigue l'organisme et favorise la reprise. Trop lente, la motivation s'éteint.</p>
<ul>
  <li>Calculer la ration sur le poids cible, pas sur le poids actuel</li>
  <li>Peser la nourriture, ne jamais estimer "à l'œil"</li>
  <li>Choisir un aliment adapté, type "light" ou prescription vétérinaire</li>
  <li>Limiter les friandises à 10 % maximum de la ration quotidienne</li>
</ul>
<p>Pensez à tout ce qui passe par la gamelle, mais aussi en dehors : morceau de fromage le soir, fin de tartine au petit déjeuner, biscuit donné par les enfants. Ces apports invisibles font souvent toute la différence.</p>

<h2>Bouger plus, sans forcer</h2>
<p>L'exercice physique complète la diététique. Chez un chien en surpoids, on évite les efforts violents qui malmèneraient les articulations. On privilégie les promenades plus longues, plus régulières, et les jeux à intensité modérée.</p>
<ul>
  <li>Allonger progressivement la durée des sorties</li>
  <li>Multiplier les pauses olfactives, fatigantes mentalement</li>
  <li>Tester la marche en laisse longue ou la nage si possible</li>
  <li>Adapter l'effort à l'âge et aux pathologies présentes</li>
</ul>

<h2>Suivre et ajuster sur la durée</h2>
<p>Une pesée toutes les deux à quatre semaines permet de voir si le plan fonctionne. Si la perte est trop lente, on resserre la ration de 5 à 10 %. Si elle est trop rapide ou si le chien semble fatigué, on consulte.</p>
<p>Un chien obèse peut aussi présenter une pathologie sous-jacente : hypothyroïdie, maladie de Cushing, douleurs chroniques qui limitent l'activité. Un bilan vétérinaire avant le démarrage est indispensable, surtout après 7 ans.</p>

<p>Faire maigrir un chien demande du temps et de la régularité, pas d'efforts héroïques. Une fois le poids cible atteint, on adapte la ration pour le stabiliser. C'est souvent à ce moment que tout se joue sur le long terme.</p>`
  },
  {
    slug: 'allergies-alimentaires-identifier-declencheurs',
    title: 'Allergies alimentaires : identifier les déclencheurs',
    excerpt: "Démangeaisons, troubles digestifs récurrents : l'alimentation est parfois en cause. Le diagnostic suit une démarche précise.",
    category: 'Nutrition',
    target: 'owner',
    author: 'Équipe Ficana',
    date: '15 Mai 2026',
    readTime: '6 min',
    image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1469&q=80',
    content: `<p class="lead">Les allergies alimentaires sont moins fréquentes que les intolérances ou les allergies environnementales, mais elles existent. Quand on les soupçonne, il faut une démarche structurée pour ne pas tourner en rond.</p>

<h2>Reconnaître les signes</h2>
<p>Chez le chien et le chat, l'allergie alimentaire se manifeste surtout par la peau et le tube digestif. Les symptômes ne sont pas saisonniers, contrairement aux allergies aux pollens, et persistent tant que l'allergène est consommé.</p>
<ul>
  <li>Démangeaisons localisées : pattes, oreilles, ventre, base de la queue</li>
  <li>Otites à répétition, parfois sans autre signe cutané</li>
  <li>Vomissements ou diarrhées chroniques</li>
  <li>Selles molles fréquentes sans cause infectieuse</li>
</ul>
<p>Ces signes peuvent évoquer d'autres pathologies. Avant de modifier l'alimentation, mieux vaut écarter les parasites, les infections cutanées et les allergies environnementales en consultation.</p>

<h2>Les allergènes les plus souvent en cause</h2>
<p>Contrairement à une idée répandue, ce n'est pas le gluten qui est principalement en cause chez le chien et le chat. Les déclencheurs les plus fréquents sont les protéines animales courantes, présentes depuis longtemps dans l'alimentation industrielle.</p>
<ul>
  <li>Bœuf, poulet, agneau et produits laitiers chez le chien</li>
  <li>Poisson, bœuf et produits laitiers chez le chat</li>
  <li>Œuf et soja dans une moindre mesure</li>
  <li>Plus rarement : blé, maïs, riz</li>
</ul>

<h2>Le régime d'éviction : la seule méthode fiable</h2>
<p>Les tests sanguins ou cutanés ne sont pas fiables pour les allergies alimentaires. La référence reste le régime d'éviction, conduit sous suivi vétérinaire pendant 6 à 8 semaines.</p>
<p>On utilise un aliment à protéine unique, dite "nouvelle" pour l'animal (par exemple cheval, canard, kangourou), ou un aliment hydrolysé dans lequel les protéines sont fragmentées. Pendant toute la durée du régime, l'animal ne mange <strong>rien d'autre</strong> : pas de friandise, pas de reste de table, pas de médicament aromatisé.</p>
<ul>
  <li>Tenir un journal des symptômes pour suivre l'évolution</li>
  <li>Prévenir toute la famille pour éviter les écarts</li>
  <li>Vérifier la composition de tous les aliments donnés</li>
  <li>Ne pas multiplier les aliments testés en parallèle</li>
</ul>

<h2>Confirmer et organiser l'avenir</h2>
<p>Si les symptômes s'améliorent nettement, on procède à une provocation : on réintroduit l'ancien aliment pour voir si les signes reviennent. Si c'est le cas, le diagnostic est confirmé. On peut ensuite tester un à un les ingrédients suspects pour identifier le ou les déclencheurs précis.</p>
<p>Sur le long terme, l'animal vit très bien avec un aliment évitant l'allergène. Un nouvel épisode est possible si la composition change ; il faut donc lire les étiquettes à chaque achat. Une consultation de contrôle annuelle aide à ajuster la prise en charge.</p>

<p>Suspecter une allergie alimentaire est facile, la prouver demande de la rigueur. Avec une bonne méthode, on identifie le ou les coupables et on stabilise durablement l'animal.</p>`
  },
  {
    slug: 'friandises-lesquelles-sans-risque',
    title: 'Friandises : lesquelles sont vraiment sans risque',
    excerpt: "Toutes les friandises ne se valent pas. Voici lesquelles privilégier, lesquelles éviter, et comment les intégrer à la ration.",
    category: 'Nutrition',
    target: 'owner',
    author: 'Équipe Ficana',
    date: '3 Juin 2026',
    readTime: '4 min',
    image: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?ixlib=rb-4.0.3&auto=format&fit=crop&w=1469&q=80',
    content: `<p class="lead">Les friandises font partie de la vie d'un chien ou d'un chat. Elles servent à l'éducation, à créer du lien, ou simplement à faire plaisir. Encore faut-il choisir les bonnes et bien doser, sinon elles déséquilibrent la ration.</p>

<h2>La règle des 10 %</h2>
<p>Quelle que soit la friandise, elle ne devrait pas représenter plus de 10 % de l'apport calorique quotidien. Au-delà, elle déséquilibre la ration et favorise la prise de poids. Cela peut sembler peu : pour un petit chien de 5 kg, 10 % font à peine quelques grammes de friandise sèche.</p>
<p>Pensez à retirer cet équivalent de la gamelle si vous distribuez beaucoup de récompenses, surtout pendant les phases d'éducation intensives.</p>

<h2>Les friandises à privilégier</h2>
<ul>
  <li>Morceaux de viande maigre cuite, sans sel ni épices</li>
  <li>Petits dés de carotte, courgette ou haricot vert cuits</li>
  <li>Tranches de pomme ou de poire sans pépin, en petites quantités</li>
  <li>Friandises industrielles "monoprotéine" à composition courte</li>
  <li>Croquettes prélevées sur la ration et utilisées comme récompenses</li>
</ul>
<p>Pour le chat, des morceaux de poulet ou de poisson cuit sans assaisonnement font très bien l'affaire. Les friandises spécifiques au chat existent aussi, à choisir avec une composition lisible et un taux de cendres raisonnable.</p>

<h2>Les aliments à éviter, voire interdits</h2>
<p>Certains aliments humains sont toxiques pour les chiens et les chats, parfois à très faible dose. Mieux vaut les exclure totalement.</p>
<ul>
  <li>Chocolat, café, thé : toxiques pour le cœur et le système nerveux</li>
  <li>Raisin, raisin sec : insuffisance rénale même en petite quantité</li>
  <li>Oignon, ail, échalote : destruction des globules rouges</li>
  <li>Os cuits : risque de perforation digestive</li>
  <li>Pâte à pizza ou à pain crue, xylitol des bonbons sans sucre</li>
</ul>
<p>On évite aussi tout ce qui est gras, salé, sucré, frit ou très épicé. Une bouchée de charcuterie n'est pas anodine sur un petit gabarit.</p>

<h2>Bien utiliser les friandises au quotidien</h2>
<p>Une friandise gagne en valeur quand elle est rare. Distribuer en continu réduit l'effet de récompense et la motivation. Mieux vaut quelques moments choisis : retour à la maison, fin d'une séance d'éducation, soin bien accepté.</p>
<ul>
  <li>Couper les friandises en très petits morceaux pendant l'apprentissage</li>
  <li>Lire la composition : moins d'ingrédients, plus de lisibilité</li>
  <li>Vérifier la date limite et la conservation, surtout pour les produits naturels</li>
  <li>Adapter le choix aux dents et à l'âge de l'animal</li>
</ul>

<p>Une bonne friandise est utile, agréable et sans danger. Quelques produits bien choisis valent mieux qu'un placard rempli au hasard. En cas de doute sur un aliment, demandez à votre vétérinaire avant de tester.</p>`
  },
  {
    slug: 'hydratation-chat-pourquoi-boit-peu',
    title: "Hydratation du chat : pourquoi il boit si peu",
    excerpt: "Le chat boit naturellement peu, ce qui peut fragiliser ses reins et sa vessie. Quelques gestes simples améliorent durablement son hydratation.",
    category: 'Nutrition',
    target: 'owner',
    author: 'Équipe Ficana',
    date: '24 Juin 2026',
    readTime: '4 min',
    image: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1469&q=80',
    content: `<p class="lead">Le chat boit peu spontanément. Cette particularité a une origine biologique : descendant de félins de zones arides, il est conçu pour tirer son eau de ses proies. Une alimentation moderne à base de croquettes change la donne et impose d'y prêter attention.</p>

<h2>Pourquoi l'hydratation compte autant</h2>
<p>Une déshydratation même légère fatigue les reins, concentre les urines et favorise la formation de cristaux dans la vessie. Sur le long terme, ces déséquilibres expliquent en partie la fréquence des calculs urinaires et de l'insuffisance rénale chronique chez le chat âgé.</p>
<p>Un chat de 4 kg a besoin d'environ 200 à 250 ml d'eau par jour, alimentation comprise. Sur une ration 100 % croquettes, il devrait en boire la plus grande partie ; or beaucoup n'en boivent qu'une fraction.</p>

<h2>Repérer un manque d'hydratation</h2>
<ul>
  <li>Urines très foncées ou très peu fréquentes</li>
  <li>Selles sèches, parfois constipation</li>
  <li>Pelage terne, peau qui se rétracte lentement quand on la pince</li>
  <li>Léthargie, perte d'appétit chez l'animal âgé ou malade</li>
</ul>
<p>Ces signes ne sont pas spécifiques et peuvent évoquer d'autres pathologies. En cas de doute, surtout chez un chat âgé, une consultation est utile pour vérifier les reins.</p>

<h2>Améliorer l'hydratation au quotidien</h2>
<p>L'idée n'est pas de forcer le chat à boire, mais de multiplier les occasions et de réduire ses freins.</p>
<ul>
  <li>Plusieurs gamelles d'eau dans des pièces différentes</li>
  <li>Récipients larges et peu profonds, en céramique ou en verre</li>
  <li>Eau renouvelée au moins une fois par jour</li>
  <li>Fontaine à eau, souvent très bien acceptée par les chats</li>
  <li>Gamelles d'eau éloignées de la litière et de la gamelle de croquettes</li>
</ul>
<p>Beaucoup de chats préfèrent boire à distance de leur nourriture, héritage du comportement de prédation où l'eau était cherchée séparément de la proie.</p>

<h2>Le rôle de l'alimentation humide</h2>
<p>La pâtée contient 70 à 80 % d'eau, contre 8 à 10 % pour les croquettes. Intégrer une part de pâtée dans la ration quotidienne est probablement le levier le plus efficace pour améliorer l'hydratation d'un chat qui boit peu.</p>
<ul>
  <li>Un repas humide par jour suffit déjà à augmenter sensiblement l'apport en eau</li>
  <li>Pâtée de bonne qualité, formulée comme aliment complet</li>
  <li>Ajustement des quantités pour ne pas dépasser les besoins caloriques</li>
  <li>Transition progressive sur sept à dix jours pour éviter les selles molles</li>
</ul>

<p>L'hydratation du chat se travaille au long cours, par petites adaptations. Si votre animal a déjà eu des soucis urinaires ou rénaux, demandez à votre vétérinaire un plan personnalisé, parfois avec un aliment thérapeutique adapté.</p>`
  },
  {
    slug: 'complements-alimentaires-utiles-ou-marketing',
    title: 'Compléments alimentaires : utiles ou pur marketing ?',
    excerpt: "Les compléments envahissent les rayons. Certains sont vraiment utiles, d'autres beaucoup moins. Voici comment trier sans se ruiner.",
    category: 'Nutrition',
    target: 'owner',
    author: 'Équipe Ficana',
    date: '20 Nov 2026',
    readTime: '5 min',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1469&q=80',
    content: `<p class="lead">Articulations, pelage, digestion, stress : pour chaque problème, on trouve aujourd'hui un complément alimentaire. Certains ont un intérêt réel, d'autres relèvent surtout de l'argumentaire commercial. Voici quelques repères.</p>

<h2>Ce qu'est, et ce que n'est pas, un complément</h2>
<p>Un complément alimentaire vient en plus d'une ration équilibrée. Il ne remplace ni l'alimentation, ni un traitement vétérinaire. Si un animal mange un aliment complet et équilibré, il n'a en théorie pas besoin de compléments en routine.</p>
<p>Les compléments ne sont pas des médicaments. Leur cadre réglementaire est moins strict, et les allégations peuvent être nombreuses sans preuve scientifique solide. La méfiance s'impose face aux promesses miracles.</p>

<h2>Les compléments avec un intérêt établi</h2>
<ul>
  <li><strong>Oméga 3</strong> (EPA, DHA) : soutien articulaire, peau, pelage, parfois cardio</li>
  <li><strong>Glucosamine et chondroïtine</strong> : confort articulaire chez les chiens arthrosiques</li>
  <li><strong>Probiotiques</strong> ciblés : utiles après une diarrhée ou un traitement antibiotique</li>
  <li><strong>Vitamines et minéraux</strong> en cas de ration ménagère mal équilibrée</li>
</ul>
<p>Même dans ces catégories, la qualité varie beaucoup. Privilégiez les marques qui indiquent clairement les dosages, l'origine des matières premières et les indications, plutôt que celles qui se contentent d'un emballage attractif.</p>

<h2>Les compléments dont l'utilité est plus discutable</h2>
<p>Certains produits surfent sur des tendances sans démontrer un bénéfice clair chez le chien ou le chat. C'est souvent le cas des "cocktails" à dizaines d'ingrédients, dosés trop bas pour avoir un effet réel.</p>
<ul>
  <li>Mélanges "détox" sans indication précise</li>
  <li>Compléments "anti-stress" aux preuves limitées</li>
  <li>Multivitamines donnés en routine à un animal nourri d'un aliment complet</li>
  <li>Produits non spécifiques destinés à l'humain et adaptés au chien sans contrôle</li>
</ul>

<h2>Bien utiliser un complément</h2>
<p>Un complément n'est intéressant que s'il répond à un besoin réel. Avant d'en introduire un, posez-vous quelques questions simples :</p>
<ul>
  <li>Quel problème précis je veux adresser, et a-t-il été identifié ?</li>
  <li>Mon animal mange-t-il déjà un aliment complet et équilibré ?</li>
  <li>Le produit est-il adapté à son espèce, son poids et son état de santé ?</li>
  <li>Ai-je un avis vétérinaire, surtout en cas de maladie chronique ?</li>
</ul>
<p>Donner plusieurs compléments en même temps complique le suivi et augmente le risque d'interaction. Mieux vaut un produit ciblé, donné sur une période définie, avec une évaluation des effets au bout de quelques semaines.</p>

<p>Les compléments alimentaires peuvent rendre service, à condition de ne pas leur demander ce qu'ils ne peuvent pas faire. Ils ne soignent pas, ils n'évitent pas un bilan vétérinaire, et ils ne compensent pas une alimentation déséquilibrée. Utilisés avec discernement, ils ont leur place dans une approche globale de la santé de votre animal.</p>`
  }
]
