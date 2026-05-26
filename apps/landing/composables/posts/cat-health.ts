import type { BlogPost } from './types'

// [SEO-BLOG] Cluster "Santé chat" — 10 articles.
export const catHealthPosts: BlogPost[] = [
  {
    slug: 'vaccins-essentiels-chat-rcp-leucose-rage',
    title: 'Vaccins essentiels du chat : RCP, leucose et rage',
    excerpt: "Quels vaccins sont vraiment nécessaires pour un chat, et lesquels dépendent de son mode de vie. Un point clair pour faire les bons choix avec votre vétérinaire.",
    category: 'Santé chat',
    target: 'owner',
    author: 'Dr. Sophie Martin',
    date: '8 Fév 2026',
    readTime: '5 min',
    image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&auto=format&fit=crop&w=1469&q=80',
    content: `<p class="lead">La vaccination reste l'un des moyens les plus simples de protéger un chat des maladies infectieuses graves. Toutes les injections ne se valent pas, et le protocole adapté dépend de l'âge, du mode de vie et de l'environnement de votre animal.</p>

<h2>Le vaccin RCP : la base pour tous les chats</h2>
<p>Le sigle RCP regroupe trois maladies contre lesquelles tout chat devrait être protégé, qu'il vive en appartement ou avec accès à l'extérieur. Le R correspond à la rhinotrachéite, une infection virale qui se traduit par de l'éternuement, de la fièvre et des écoulements oculaires. Le C désigne le calicivirus, responsable d'ulcères dans la bouche et de troubles respiratoires. Le P, enfin, concerne la panleucopénie, parfois appelée typhus du chat, une maladie souvent mortelle chez les chatons.</p>
<p>La primovaccination commence en général vers huit semaines, avec un rappel à douze semaines, puis un an plus tard. Ensuite, le protocole varie selon les recommandations européennes : tous les un à trois ans selon les composants. Même un chat strictement d'intérieur reste exposé, car ces virus peuvent entrer par les vêtements ou les chaussures.</p>

<h2>La leucose féline : indispensable pour les chats sortant</h2>
<p>La leucose, ou FeLV, est un virus qui affaiblit le système immunitaire et favorise l'apparition de tumeurs. Elle se transmet par contact rapproché entre chats : léchage, partage de gamelles, morsures lors de bagarres. Le vaccin est fortement recommandé pour :</p>
<ul>
<li>les chats qui sortent, même rarement</li>
<li>les chats vivant dans un foyer multi-chats avec un statut inconnu</li>
<li>les chats de refuge ou récemment adoptés</li>
</ul>
<p>Avant la première injection, votre vétérinaire effectuera souvent un test sanguin rapide pour s'assurer que l'animal n'est pas déjà porteur. Vacciner un chat infecté n'apporte aucun bénéfice.</p>

<h2>La rage : un vaccin parfois obligatoire</h2>
<p>En France métropolitaine, la rage n'est plus présente, mais le vaccin reste exigé dans plusieurs situations. Il devient obligatoire pour voyager hors de France avec un passeport européen, pour franchir certaines frontières, pour entrer en pension, ou si vous vivez dans un département où la réglementation locale l'impose. Le vaccin est généralement administré à partir de trois mois, avec une validité d'un à trois ans selon le produit utilisé.</p>
<p>Si vous prévoyez un voyage, anticipez : un rappel récent peut être exigé, et certains pays demandent un délai minimum entre la vaccination et le départ.</p>

<h2>Adapter le protocole au mode de vie</h2>
<p>Tous les chats n'ont pas besoin du même protocole vaccinal. Un chat d'intérieur jeune et en bonne santé peut suivre un programme allégé. À l'inverse, un chat sortant, vivant en collectivité ou voyageant beaucoup, bénéficiera d'une couverture plus large. Votre vétérinaire ajustera les rappels en fonction des risques réels, et non d'un schéma standard appliqué à tous.</p>
<p>Pensez aussi à signaler tout changement de situation : déménagement, adoption d'un nouveau chat, séjour en garderie. Cela peut modifier la stratégie de prévention.</p>

<p>La vaccination reste un sujet à discuter avec votre vétérinaire, en fonction du contexte de votre chat. Un suivi régulier et un carnet de santé à jour facilitent ces décisions au fil des années.</p>`,
  },
  {
    slug: 'fiv-pif-maladies-chat',
    title: 'FIV et PIF : comprendre les grandes maladies du chat',
    excerpt: "Deux maladies souvent confondues, mais aux mécanismes très différents. Voici ce qu'il faut savoir pour reconnaître les signes et accompagner votre chat.",
    category: 'Santé chat',
    target: 'owner',
    author: 'Dr. Marc Dubois',
    date: '22 Fév 2026',
    readTime: '6 min',
    image: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1469&q=80',
    content: `<p class="lead">FIV et PIF font partie des maladies infectieuses du chat les plus redoutées. Elles partagent une origine virale et peuvent toutes deux mettre en jeu la vie de l'animal, mais leur mode de transmission, leur évolution et leurs traitements n'ont rien en commun.</p>

<h2>La FIV : un virus qui affaiblit l'immunité</h2>
<p>La FIV, ou virus de l'immunodéficience féline, est souvent comparée au VIH humain. Le parallèle s'arrête à la famille virale : la FIV ne se transmet pas à l'humain. Elle infecte uniquement les chats, principalement par morsure lors de bagarres. Les chats mâles non castrés qui sortent et défendent un territoire sont les plus exposés.</p>
<p>Après la contamination, le chat peut rester apparemment en bonne santé pendant des années. Le virus attaque progressivement les défenses immunitaires, ce qui favorise des infections secondaires : gingivites chroniques, abcès qui cicatrisent mal, infections respiratoires à répétition, perte de poids inexpliquée. Un test sanguin permet de poser le diagnostic en quelques minutes au cabinet.</p>
<p>Il n'existe pas de traitement curatif. Un chat FIV+ peut toutefois vivre longtemps avec un suivi régulier, une alimentation adaptée et un mode de vie en intérieur pour éviter les contaminations croisées et les infections opportunistes.</p>

<h2>La PIF : une maladie longtemps incurable</h2>
<p>La PIF, ou péritonite infectieuse féline, est causée par une mutation d'un coronavirus très répandu chez le chat. La majorité des chats croisent ce coronavirus sans jamais développer la maladie. Chez une petite minorité, généralement de jeunes chats ou des chats stressés, le virus mute et déclenche une réaction inflammatoire grave.</p>
<p>Les symptômes varient selon la forme :</p>
<ul>
<li>Forme humide : accumulation de liquide dans l'abdomen ou le thorax, ventre gonflé, gêne respiratoire</li>
<li>Forme sèche : amaigrissement, fièvre persistante, atteintes oculaires ou neurologiques</li>
</ul>
<p>Pendant longtemps, la PIF était considérée comme une condamnation. Depuis quelques années, des traitements antiviraux (à base de GS-441524) ont changé la donne et permettent aujourd'hui une rémission dans une majorité de cas, sous suivi vétérinaire spécialisé.</p>

<h2>Comment limiter les risques</h2>
<p>Pour la FIV, la prévention passe par la stérilisation, qui réduit les bagarres et les morsures, et par un test au moment de l'adoption ou avant de faire cohabiter plusieurs chats. Il n'existe pas de vaccin disponible en France.</p>
<p>Pour la PIF, il n'y a pas de moyen sûr d'empêcher la mutation virale. On peut cependant limiter le terrain favorable en réduisant les sources de stress : surpopulation, changements brutaux, sevrage trop précoce. Une hygiène stricte des litières dans les élevages et les refuges aide à limiter la circulation du coronavirus.</p>

<h2>Quand consulter</h2>
<p>Un chat qui maigrit sans raison, qui a de la fièvre persistante, dont l'abdomen gonfle ou qui présente des troubles oculaires ou neurologiques doit être examiné rapidement. Plus le diagnostic est posé tôt, plus la prise en charge est efficace, particulièrement pour la PIF.</p>
<p>Évitez de poser un diagnostic vous-même à partir d'informations trouvées en ligne. Ces deux maladies ressemblent à beaucoup d'autres affections, et seul un examen clinique complété d'analyses permet de trancher. En cas de doute, consultez votre vétérinaire sans attendre.</p>

<p>FIV et PIF restent sérieuses, mais elles ne sont plus des sentences. Un dépistage précoce et un suivi rigoureux changent considérablement le pronostic.</p>`,
  },
  {
    slug: 'calculs-urinaires-chat-prevention-soins',
    title: 'Calculs urinaires du chat : prévention et soins',
    excerpt: "Les troubles urinaires touchent de nombreux chats, parfois en urgence. Comprendre les facteurs de risque permet d'agir tôt et d'éviter les rechutes.",
    category: 'Santé chat',
    target: 'owner',
    author: 'Dr. Camille Roussel',
    date: '10 Mar 2026',
    readTime: '5 min',
    image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?ixlib=rb-4.0.3&auto=format&fit=crop&w=1469&q=80',
    content: `<p class="lead">Un chat qui passe beaucoup de temps dans sa litière sans uriner, qui miaule en se soulageant ou qui laisse des gouttes de sang : ces signes doivent toujours alerter. Les troubles urinaires bas, et notamment les calculs, sont fréquents chez le chat et peuvent devenir une urgence vitale.</p>

<h2>Pourquoi les chats sont concernés</h2>
<p>L'anatomie du chat le rend vulnérable aux problèmes urinaires. Les mâles ont un urètre étroit, ce qui favorise les obstructions. À cela s'ajoute un comportement de boisson souvent limité : descendant d'un ancêtre désertique, le chat boit peu et concentre fortement ses urines. Cette concentration favorise la formation de cristaux, puis de calculs.</p>
<p>Les types de calculs les plus courants sont les struvites et les oxalates de calcium. Leur formation dépend du pH urinaire, de l'alimentation, de l'hydratation et parfois d'une prédisposition génétique. Certains chats développent aussi une cystite idiopathique, c'est-à-dire une inflammation de la vessie sans cause infectieuse, souvent liée au stress.</p>

<h2>Reconnaître les signes</h2>
<p>Les symptômes des troubles urinaires se ressemblent souvent, qu'il s'agisse de calculs, de cystite ou d'infection :</p>
<ul>
<li>visites fréquentes à la litière, parfois sans résultat</li>
<li>miaulements ou postures inhabituelles pendant la miction</li>
<li>sang visible dans les urines</li>
<li>léchage excessif de la zone génitale</li>
<li>uriner hors de la litière</li>
</ul>
<p>Chez un mâle, l'absence totale d'urines pendant plusieurs heures est une urgence absolue. Un blocage urinaire peut entraîner une insuffisance rénale aiguë et un décès en 24 à 48 heures sans prise en charge.</p>

<h2>Le diagnostic et les traitements</h2>
<p>Le vétérinaire commence par un examen clinique, complété par une analyse d'urine et souvent une échographie ou une radiographie. Ces examens permettent de localiser et de caractériser les calculs.</p>
<p>Selon les cas, le traitement passe par une alimentation médicale spécifique capable de dissoudre certains calculs (struvites), une intervention chirurgicale pour retirer les pierres, ou un sondage en urgence en cas d'obstruction. La cystite idiopathique se traite plutôt par une réduction du stress, des compléments et une réorganisation de l'environnement.</p>

<h2>Prévenir les récidives</h2>
<p>Une fois le problème résolu, l'objectif est d'éviter qu'il ne revienne. Quelques mesures simples font une vraie différence :</p>
<ul>
<li>augmenter l'apport en eau : passer à une alimentation humide, multiplier les points d'eau, tester une fontaine à eau</li>
<li>respecter une alimentation adaptée, parfois sur prescription, pour réguler le pH urinaire</li>
<li>maintenir un poids stable, car l'obésité favorise les troubles</li>
<li>nettoyer régulièrement la litière et en proposer plusieurs (idéalement une par chat plus une)</li>
<li>limiter les sources de stress : changements brutaux, conflits entre chats, environnement instable</li>
</ul>
<p>Pour un chat à risque, des contrôles d'urine réguliers permettent de détecter une récidive avant les premiers symptômes visibles.</p>

<p>Les troubles urinaires ne sont jamais à banaliser chez le chat. Devant le moindre signe, mieux vaut consulter rapidement, et surtout, ne pas attendre quand il s'agit d'un mâle. Votre vétérinaire reste le meilleur interlocuteur pour mettre en place une stratégie sur la durée.</p>`,
  },
  {
    slug: 'mon-chat-boit-beaucoup-consulter',
    title: 'Mon chat boit beaucoup : faut-il consulter ?',
    excerpt: "Une augmentation de la soif n'est jamais anodine chez le chat. Voici les causes les plus fréquentes et le bon moment pour prendre rendez-vous.",
    category: 'Santé chat',
    target: 'owner',
    author: 'Dr. Antoine Mercier',
    date: '28 Mar 2026',
    readTime: '4 min',
    image: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?ixlib=rb-4.0.3&auto=format&fit=crop&w=1469&q=80',
    content: `<p class="lead">Vous avez remarqué que votre chat vide sa gamelle d'eau plus vite que d'habitude, ou qu'il vous demande à boire au robinet. Cette augmentation de la soif, appelée polydipsie, mérite d'être prise au sérieux : elle est souvent le premier signe d'une maladie sous-jacente.</p>

<h2>Combien boit normalement un chat</h2>
<p>En moyenne, un chat adulte consomme environ 50 ml d'eau par kilo et par jour, en comptant l'eau présente dans son alimentation. Un chat nourri exclusivement aux croquettes boira davantage qu'un chat nourri aux pâtées, qui en contiennent jusqu'à 80 % d'eau.</p>
<p>Avant de s'inquiéter, on cherche à objectiver la consommation. Pendant deux à trois jours, mesurez la quantité d'eau mise dans la gamelle le matin et celle qui reste le soir. Si la consommation dépasse régulièrement 100 ml par kilo et par jour, il est temps de consulter.</p>

<h2>Les causes les plus fréquentes</h2>
<p>Plusieurs maladies se manifestent par une soif excessive, souvent accompagnée d'une augmentation du volume des urines. Les plus courantes chez le chat sont :</p>
<ul>
<li>l'insuffisance rénale chronique, fréquente chez le chat âgé</li>
<li>le diabète sucré, plus souvent chez les chats en surpoids</li>
<li>l'hyperthyroïdie, classique après 10 ans</li>
<li>certaines infections urinaires ou inflammations rénales</li>
<li>des effets secondaires médicamenteux, notamment corticoïdes ou diurétiques</li>
</ul>
<p>Plus rarement, une polydipsie peut être d'origine comportementale, surtout après un changement important dans l'environnement.</p>

<h2>Les signes à observer en parallèle</h2>
<p>La soif augmentée prend tout son sens quand on l'associe à d'autres observations. Notez si vous remarquez :</p>
<ul>
<li>une perte de poids progressive malgré un appétit conservé</li>
<li>un appétit fortement augmenté ou au contraire diminué</li>
<li>des urines plus volumineuses, parfois hors de la litière</li>
<li>un pelage qui devient terne, un chat moins propre</li>
<li>des vomissements, une fatigue inhabituelle</li>
</ul>
<p>Ces éléments aident le vétérinaire à orienter rapidement les examens. Notez aussi depuis quand le changement a été observé : une semaine, un mois, plusieurs mois.</p>

<h2>Quels examens prévoir</h2>
<p>La consultation commence par un examen clinique complet : poids, état de la bouche, palpation de l'abdomen, prise de température. Une prise de sang et une analyse d'urine sont presque toujours réalisées. Selon les résultats, des examens complémentaires peuvent être proposés, notamment une mesure de la T4 pour rechercher une hyperthyroïdie ou une échographie abdominale.</p>
<p>Le diagnostic est souvent posé rapidement, et plus la prise en charge est précoce, plus le pronostic est favorable. C'est particulièrement vrai pour l'insuffisance rénale et le diabète, qui se stabilisent bien quand ils sont détectés tôt.</p>

<p>Ne tardez pas si la soif de votre chat augmente nettement, surtout s'il a plus de 8 ans. Un rendez-vous chez votre vétérinaire permet d'écarter rapidement les causes graves, ou de mettre en place un traitement adapté avant que la maladie ne s'aggrave.</p>`,
  },
  {
    slug: 'chat-senior-suivi-rapproche-10-ans',
    title: 'Le chat senior : pourquoi un suivi rapproché après 10 ans',
    excerpt: "Passé 10 ans, beaucoup de maladies évoluent en silence chez le chat. Un bilan annuel devient un outil clé pour les détecter tôt.",
    category: 'Santé chat',
    target: 'owner',
    author: 'Dr. Sophie Martin',
    date: '15 Avr 2026',
    readTime: '5 min',
    image: 'https://images.unsplash.com/photo-1561948955-570b270e7c36?ixlib=rb-4.0.3&auto=format&fit=crop&w=1469&q=80',
    content: `<p class="lead">Un chat qui dort un peu plus, qui maigrit doucement ou qui boit davantage est souvent jugé "normal pour son âge". Pourtant, ces signes correspondent parfois aux premiers symptômes de maladies fréquentes chez le chat senior. Un suivi médical rapproché à partir de 10 ans permet de les repérer avant qu'elles ne deviennent invalidantes.</p>

<h2>Quand un chat est-il considéré comme senior</h2>
<p>Les vétérinaires considèrent généralement qu'un chat est senior à partir de 10 ans, et gériatrique vers 15 ans. Ces seuils sont indicatifs : un chat de gouttière en bonne santé peut rester très actif à 13 ans, tandis qu'un autre montrera des signes de vieillissement dès 9 ans.</p>
<p>Ce qui change vraiment, c'est la probabilité d'apparition de plusieurs maladies chroniques : insuffisance rénale, hyperthyroïdie, diabète, arthrose, tumeurs. Elles évoluent souvent lentement, ce qui rend leur détection précoce difficile sans bilan systématique.</p>

<h2>Les signes à ne pas mettre sur le compte de l'âge</h2>
<p>Voici les changements qui méritent toujours une consultation, même sans urgence apparente :</p>
<ul>
<li>perte de poids, même légère mais progressive</li>
<li>augmentation de la soif et du volume des urines</li>
<li>appétit modifié, à la hausse ou à la baisse</li>
<li>vomissements répétés</li>
<li>pelage terne, toilettage moins soigneux</li>
<li>changement de comportement : isolement, irritabilité, désorientation</li>
<li>difficulté à sauter, raideur après le repos</li>
</ul>
<p>Aucun de ces signes n'est "normal avec l'âge". Ils traduisent souvent une maladie identifiable et prenable en charge.</p>

<h2>Que comprend un bilan senior</h2>
<p>Un bilan adapté au chat senior va plus loin qu'un examen classique. En général, il comprend :</p>
<ul>
<li>un examen clinique complet, avec poids, température, palpation thyroïdienne et abdominale, examen buccal</li>
<li>une prise de sang explorant la fonction rénale, le foie, la glycémie et la T4</li>
<li>une analyse d'urine avec mesure de la densité</li>
<li>une mesure de la pression artérielle, souvent sous-estimée</li>
</ul>
<p>Ce bilan est généralement proposé une fois par an entre 10 et 12 ans, puis deux fois par an après. Il permet de suivre l'évolution des paramètres dans le temps, ce qui est souvent plus informatif qu'une valeur isolée.</p>

<h2>Adapter l'environnement et le quotidien</h2>
<p>Au-delà des examens, quelques ajustements du quotidien améliorent réellement la qualité de vie du chat âgé. Privilégiez des litières à bords bas, faciles d'accès, plus nombreuses dans la maison. Multipliez les couchages chauds et confortables, à différents niveaux. Si votre chat saute moins, installez des marches ou des rampes pour ses lieux favoris.</p>
<p>Côté alimentation, des croquettes ou pâtées senior peuvent être adaptées, mais ce choix se discute avec le vétérinaire selon les maladies présentes. Une alimentation humide reste souvent préférable pour soutenir la fonction rénale.</p>

<p>Vieillir n'est pas une maladie, mais c'est une période où la prévention prend tout son sens. Un suivi régulier, des bilans annuels, et un peu d'attention aux petits changements permettent souvent à un chat senior de profiter de longues années en bonne santé.</p>`,
  },
  {
    slug: 'hygiene-dentaire-chat-pourquoi-crucial',
    title: "Hygiène dentaire du chat : pourquoi c'est crucial",
    excerpt: "Mauvaise haleine, tartre, gingivite : les problèmes dentaires concernent la majorité des chats adultes. Quelques gestes simples changent vraiment la donne.",
    category: 'Santé chat',
    target: 'owner',
    author: 'Dr. Marc Dubois',
    date: '5 Mai 2026',
    readTime: '5 min',
    image: 'https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1469&q=80',
    content: `<p class="lead">On parle souvent de l'alimentation, des vaccins ou des vermifuges, mais l'hygiène dentaire reste l'un des grands oubliés chez le chat. Pourtant, à partir de 3 ans, plus de la moitié des chats présentent une maladie parodontale plus ou moins avancée.</p>

<h2>Comment se forment les problèmes dentaires</h2>
<p>Après chaque repas, une fine couche bactérienne se dépose sur les dents : c'est la plaque dentaire. Si elle n'est pas retirée, elle se minéralise en quelques jours et devient du tartre, dur et jaunâtre. Le tartre irrite la gencive, provoque une inflammation appelée gingivite, puis une atteinte plus profonde des tissus de soutien de la dent : la parodontite.</p>
<p>Chez le chat, on rencontre aussi des lésions plus spécifiques, comme les résorptions dentaires. Ces lésions très douloureuses détruisent progressivement la dent et ne se voient pas toujours à l'œil nu. Elles touchent un chat sur deux à un moment de sa vie.</p>

<h2>Reconnaître les signes</h2>
<p>Un chat qui a mal aux dents ne le montre pas toujours clairement. Voici les éléments qui doivent alerter :</p>
<ul>
<li>mauvaise haleine persistante</li>
<li>tartre visible, gencives rouges</li>
<li>salivation excessive, parfois teintée de sang</li>
<li>diminution de l'appétit, surtout pour les croquettes</li>
<li>mastication d'un seul côté, chute de croquettes hors de la bouche</li>
<li>amaigrissement progressif</li>
</ul>
<p>Beaucoup de chats continuent à manger malgré une douleur réelle. L'absence de plainte ne signifie pas l'absence de problème.</p>

<h2>Le détartrage chez le vétérinaire</h2>
<p>Une fois le tartre installé, aucun produit ne le fait disparaître à la maison. Le détartrage se réalise sous anesthésie générale, ce qui permet un nettoyage complet, un examen précis de chaque dent et, si besoin, des radiographies pour évaluer les racines.</p>
<p>L'anesthésie peut inquiéter, surtout chez un chat âgé. En pratique, le risque est très limité avec un bilan préanesthésique adapté et un protocole moderne. Et les bénéfices sont majeurs : disparition de la douleur chronique, amélioration de l'appétit, et souvent un chat plus tonique dans les semaines qui suivent.</p>

<h2>Prévenir au quotidien</h2>
<p>L'objectif est de ralentir la formation de la plaque. Plusieurs approches existent, à combiner selon ce que votre chat accepte :</p>
<ul>
<li>le brossage des dents, idéal mais peu de chats l'acceptent ; à introduire progressivement, avec un dentifrice spécifique chat</li>
<li>les croquettes à effet mécanique, spécifiquement conçues pour réduire la plaque</li>
<li>les produits à base d'enzymes (gels, solutions à ajouter dans l'eau)</li>
<li>les friandises dentaires, en complément et non en remplacement</li>
</ul>
<p>Le plus efficace reste un contrôle annuel de la bouche par votre vétérinaire, qui repérera tôt les lésions et adaptera la prévention.</p>

<p>Une bouche saine, ce sont des années de confort et d'appétit en plus. Ne reportez pas un détartrage sous prétexte que votre chat "mange encore bien" : la douleur dentaire est l'une des plus discrètes, et l'une des plus invalidantes.</p>`,
  },
  {
    slug: 'vermifuger-chat-interieur-exterieur',
    title: "Vermifuger son chat d'intérieur, d'extérieur ou les deux",
    excerpt: "Faut-il vermifuger un chat qui ne sort jamais ? À quelle fréquence pour un chasseur ? Le protocole dépend vraiment du mode de vie.",
    category: 'Santé chat',
    target: 'owner',
    author: 'Dr. Camille Roussel',
    date: '28 Mai 2026',
    readTime: '4 min',
    image: 'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1469&q=80',
    content: `<p class="lead">Vermifuger son chat fait partie des gestes de prévention de base, mais le rythme et le produit à choisir varient selon le mode de vie. Inutile de surtraiter un chat strictement d'intérieur, et risqué de sous-estimer les besoins d'un chat qui chasse.</p>

<h2>Pourquoi vermifuger</h2>
<p>Plusieurs parasites internes peuvent coloniser le tube digestif du chat : vers ronds (ascaris), vers plats (ténias), ankylostomes. Certains se transmettent par ingestion d'œufs présents dans l'environnement, d'autres par la chasse, d'autres encore par les puces. Les symptômes sont souvent discrets : amaigrissement, poil terne, diarrhée passagère, vomissements. Chez le chaton, l'infestation peut être plus sévère et entraîner un retard de croissance.</p>
<p>Au-delà de la santé du chat, certains parasites peuvent contaminer l'humain, en particulier les enfants. La vermifugation joue donc aussi un rôle de santé publique.</p>

<h2>Le chat d'intérieur strict</h2>
<p>On entend parfois qu'un chat qui ne sort jamais n'a pas besoin de vermifuge. C'est une simplification. Même sans accès à l'extérieur, un chat peut être exposé à des œufs apportés par les chaussures, par les autres animaux du foyer, ou par les insectes (mouches, cafards) qui transportent des parasites.</p>
<p>Pour un chat d'intérieur sans contact avec d'autres animaux, deux à trois vermifugations par an suffisent en général. Si vous avez plusieurs animaux ou de jeunes enfants, on monte plutôt à quatre fois par an.</p>

<h2>Le chat avec accès à l'extérieur</h2>
<p>Un chat qui sort, et a fortiori qui chasse, est beaucoup plus exposé. Les rongeurs et les oiseaux sont des sources fréquentes de contamination, notamment pour les ténias. Le rythme recommandé est plus soutenu : une vermifugation tous les un à trois mois, selon l'intensité de l'activité de chasse et la présence d'autres animaux dans le foyer.</p>
<p>Le choix du vermifuge a aussi son importance. Tous les produits ne couvrent pas les mêmes parasites. Pour un chat chasseur, on privilégie un vermifuge actif sur les vers plats, ce qui n'est pas toujours le cas des produits les plus simples vendus en libre-service.</p>

<h2>Cas particuliers à connaître</h2>
<p>Plusieurs situations demandent un protocole adapté :</p>
<ul>
<li>chatons : vermifugation toutes les 2 semaines de 3 à 8 semaines, puis tous les mois jusqu'à 6 mois</li>
<li>chattes gestantes et allaitantes : protocole spécifique à voir avec le vétérinaire</li>
<li>chats vivant en collectivité (refuge, élevage) : rythme rapproché</li>
<li>chats voyageant à l'étranger : certains pays exigent un vermifuge contre l'échinocoque dans les jours précédant l'entrée</li>
</ul>
<p>Les puces et les vers vont aussi souvent de pair. Un chat infesté de puces a un risque accru de contracter un ténia. Associer un antiparasitaire externe à la vermifugation est souvent recommandé.</p>

<h2>Quel produit et où l'acheter</h2>
<p>Les vermifuges existent en comprimés, pâtes, ou pipettes à appliquer sur la peau. Le choix dépend de ce que votre chat accepte le mieux. Demandez conseil à votre vétérinaire plutôt que de prendre le premier produit en rayon : un vermifuge mal adapté peut laisser passer des parasites.</p>

<p>Une vermifugation régulière et bien choisie évite la plupart des infestations. En cas de doute sur le rythme ou le produit, faites le point une fois par an avec votre vétérinaire, en lui décrivant précisément le mode de vie de votre chat.</p>`,
  },
  {
    slug: 'mon-chat-vomit-regulierement-causes',
    title: 'Mon chat vomit régulièrement : les causes possibles',
    excerpt: "Le vomissement est fréquent chez le chat, mais pas anodin quand il devient régulier. Voici comment distinguer un vomissement banal d'un signe à explorer.",
    category: 'Santé chat',
    target: 'owner',
    author: 'Dr. Antoine Mercier',
    date: '18 Juin 2026',
    readTime: '5 min',
    image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1469&q=80',
    content: `<p class="lead">Un chat qui vomit de temps en temps fait partie du quotidien de nombreux propriétaires. Mais lorsque les vomissements deviennent réguliers, hebdomadaires voire quotidiens, ils méritent toujours une exploration. Il ne s'agit pas d'une fatalité.</p>

<h2>Ce qu'on appelle un vomissement "normal"</h2>
<p>Un chat en bonne santé peut vomir occasionnellement, par exemple après avoir mangé trop vite ou après un toilettage prolongé qui aboutit à une boule de poils. Si cela arrive une à deux fois par mois, sans autre signe, et que le chat reprend immédiatement son comportement habituel, ce n'est généralement pas inquiétant.</p>
<p>Au-delà, on parle de vomissements chroniques. La règle souvent retenue est qu'au-delà d'un vomissement par semaine sur plusieurs semaines, ou de plusieurs vomissements rapprochés, il faut consulter.</p>

<h2>Les causes les plus fréquentes</h2>
<p>Les vomissements chroniques du chat peuvent avoir des origines très variées :</p>
<ul>
<li>boules de poils : à suspecter chez les chats à poils longs ou très toiletteurs</li>
<li>alimentation inadaptée : changement brutal, intolérance, qualité variable</li>
<li>maladies digestives chroniques : MICI (maladies inflammatoires), lymphome digestif</li>
<li>insuffisance rénale, hyperthyroïdie, diabète</li>
<li>corps étranger : fils, élastiques, restes de plante</li>
<li>parasites internes</li>
</ul>
<p>Chez un chat de plus de 10 ans qui vomit régulièrement, on cherche systématiquement une maladie de fond. Le vomissement "de boules de poils" est souvent invoqué à tort.</p>

<h2>Ce qu'il faut observer</h2>
<p>Avant la consultation, quelques informations facilitent le diagnostic. Notez :</p>
<ul>
<li>la fréquence : combien de fois par semaine</li>
<li>le moment : avant ou après le repas, à jeun le matin</li>
<li>le contenu : aliments digérés, non digérés, liquide jaune, présence de poils, sang</li>
<li>les signes associés : perte de poids, diarrhée, baisse d'appétit, fatigue</li>
<li>les changements récents : alimentation, environnement, nouveau produit ménager, plante</li>
</ul>
<p>Une vidéo prise au moment de la crise peut aussi aider le vétérinaire, notamment pour différencier un vomissement d'une régurgitation.</p>

<h2>Quels examens prévoir</h2>
<p>Le bilan dépend des hypothèses. Le plus souvent, il comprend un examen clinique complet, une prise de sang explorant les organes principaux et une analyse d'urine. Selon les cas, on ajoute une échographie abdominale pour examiner l'estomac, l'intestin, le foie et le pancréas, voire une endoscopie avec biopsies si une maladie digestive chronique est suspectée.</p>
<p>Les traitements sont très différents selon la cause. Une alimentation hypoallergénique peut suffire dans certains cas, alors qu'une maladie inflammatoire demandera des médicaments anti-inflammatoires ou immunosuppresseurs.</p>

<h2>Quand consulter en urgence</h2>
<p>Certains signes ne souffrent pas d'attente :</p>
<ul>
<li>vomissements répétés en quelques heures</li>
<li>présence de sang frais ou de marc de café</li>
<li>chat abattu, qui ne boit plus</li>
<li>douleur abdominale visible</li>
<li>chat qui a accès à des plantes toxiques, des médicaments, des produits ménagers</li>
</ul>
<p>Un chat qui ne mange plus pendant 24 heures peut développer rapidement des complications hépatiques. Mieux vaut consulter rapidement.</p>

<p>Les vomissements réguliers ne sont jamais "juste un caractère de chat". Ils traduisent souvent un problème identifiable, et leur prise en charge améliore nettement le confort de vie de l'animal. En cas de doute, votre vétérinaire reste le bon interlocuteur.</p>`,
  },
  {
    slug: 'sterilisation-chat-ce-que-ca-change',
    title: "La stérilisation du chat : ce que ça change vraiment",
    excerpt: "Comportement, santé, poids : la stérilisation modifie plusieurs aspects de la vie du chat. Un point honnête sur les bénéfices et les vigilances.",
    category: 'Santé chat',
    target: 'owner',
    author: 'Dr. Sophie Martin',
    date: '14 Juil 2026',
    readTime: '5 min',
    image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&auto=format&fit=crop&w=1469&q=80',
    content: `<p class="lead">La stérilisation du chat est l'une des interventions les plus courantes en médecine vétérinaire. Au-delà de la question des portées non désirées, elle modifie réellement le comportement, le métabolisme et la santé à long terme. Voici ce qu'on observe en pratique.</p>

<h2>En quoi consiste l'intervention</h2>
<p>Chez le mâle, on parle de castration : les deux testicules sont retirés sous anesthésie générale par une petite incision. L'intervention est rapide et la récupération généralement très simple, sans points de suture externes.</p>
<p>Chez la femelle, on parle d'ovariectomie ou d'ovario-hystérectomie selon que l'on retire les ovaires seuls ou avec l'utérus. L'intervention est plus longue, par voie abdominale, avec quelques points à retirer après une dizaine de jours.</p>
<p>L'âge recommandé se situe en général entre 5 et 7 mois, avant les premières chaleurs pour les femelles. Une stérilisation plus précoce est possible dans certains cas, en concertation avec le vétérinaire.</p>

<h2>Ce qui change côté comportement</h2>
<p>La stérilisation fait disparaître les comportements liés aux hormones sexuelles. Chez le mâle, on observe en général :</p>
<ul>
<li>une nette diminution des marquages urinaires</li>
<li>moins de fugues et de bagarres territoriales</li>
<li>une réduction des miaulements et de l'agressivité liée aux femelles</li>
</ul>
<p>Chez la femelle, on supprime les chaleurs, parfois bruyantes, et les comportements associés (frottements, vocalisations, agitation). Le caractère général du chat reste le même : un chat joueur reste joueur, un chat câlin reste câlin.</p>

<h2>Les bénéfices sur la santé</h2>
<p>Les bénéfices médicaux sont nombreux et bien documentés :</p>
<ul>
<li>suppression du risque de tumeurs ovariennes, utérines et testiculaires</li>
<li>réduction très forte du risque de tumeurs mammaires si la stérilisation est précoce</li>
<li>moins d'infections utérines (pyomètre) chez la femelle âgée</li>
<li>moins de blessures, d'abcès et donc de transmission de la FIV chez les mâles qui sortent</li>
</ul>
<p>L'espérance de vie moyenne d'un chat stérilisé est plus élevée que celle d'un chat entier, principalement par diminution des accidents, des bagarres et des maladies infectieuses.</p>

<h2>Le point de vigilance : le poids</h2>
<p>Après stérilisation, les besoins énergétiques diminuent d'environ 20 à 30 %, alors que l'appétit a tendance à augmenter dans les semaines qui suivent. Sans ajustement, beaucoup de chats prennent du poids, ce qui favorise à terme le diabète, les troubles urinaires et l'arthrose.</p>
<p>Quelques mesures simples limitent ce risque :</p>
<ul>
<li>passer à une alimentation spécifique pour chat stérilisé</li>
<li>respecter les rations indiquées et peser la quantité quotidienne</li>
<li>fractionner les repas plutôt que laisser en libre-service</li>
<li>encourager l'activité par le jeu, les arbres à chat, les jouets distributeurs</li>
</ul>
<p>Le poids se contrôle facilement à la maison, une fois par mois sur le pèse-personne (en se pesant avec et sans le chat).</p>

<h2>Et après l'opération</h2>
<p>La récupération est rapide. Le chat rentre généralement le jour même ou le lendemain. Pendant une dizaine de jours, on limite les sauts importants, on surveille la cicatrice et on respecte la collerette ou le t-shirt de protection si le vétérinaire en a posé. Les premiers jours, l'appétit peut être un peu diminué, ce qui est normal.</p>

<p>La stérilisation reste un acte médical : elle se prépare et se discute. Votre vétérinaire est le mieux placé pour évaluer le bon moment et le bon protocole en fonction du mode de vie de votre chat.</p>`,
  },
  {
    slug: 'insuffisance-renale-chronique-chat-age',
    title: 'Insuffisance rénale chronique : la maladie n°1 du chat âgé',
    excerpt: "L'insuffisance rénale touche un chat sur trois après 12 ans. Un dépistage précoce et une prise en charge adaptée permettent souvent de gagner plusieurs années.",
    category: 'Santé chat',
    target: 'owner',
    author: 'Dr. Marc Dubois',
    date: '20 Nov 2026',
    readTime: '6 min',
    image: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1469&q=80',
    content: `<p class="lead">L'insuffisance rénale chronique est la maladie la plus fréquente chez le chat âgé. Elle évolue lentement, souvent sur plusieurs années, et reste longtemps silencieuse. Plus elle est détectée tôt, plus la prise en charge peut prolonger une bonne qualité de vie.</p>

<h2>Ce qui se passe dans les reins</h2>
<p>Les reins filtrent le sang en permanence et évacuent les déchets via les urines. Avec l'âge, un certain nombre de néphrons (les unités fonctionnelles du rein) cessent de fonctionner. Tant que la moitié environ continue à travailler, le chat ne montre aucun signe. Au-delà, les déchets s'accumulent et provoquent les premiers symptômes.</p>
<p>La maladie est dite chronique parce qu'elle évolue progressivement et qu'elle est irréversible. On ne "guérit" pas l'insuffisance rénale, mais on peut ralentir son évolution et compenser les conséquences.</p>

<h2>Les premiers signes</h2>
<p>Les symptômes sont longtemps discrets. Les plus précoces sont :</p>
<ul>
<li>une soif augmentée et des urines plus volumineuses</li>
<li>une perte de poids progressive</li>
<li>un appétit qui fluctue</li>
<li>un pelage moins entretenu</li>
</ul>
<p>À des stades plus avancés, on observe des vomissements, une déshydratation, une mauvaise haleine, parfois des ulcères dans la bouche et une grande fatigue. Une hypertension artérielle s'installe souvent, avec des conséquences sur les yeux (cécité brutale) et le cœur.</p>

<h2>Comment poser le diagnostic</h2>
<p>Le diagnostic repose sur une combinaison d'examens :</p>
<ul>
<li>prise de sang : urée, créatinine, et surtout SDMA, un marqueur plus précoce</li>
<li>analyse d'urine : densité, présence de protéines</li>
<li>mesure de la pression artérielle</li>
<li>parfois échographie rénale</li>
</ul>
<p>Le SDMA est un outil intéressant car il permet souvent de détecter l'atteinte rénale plus tôt que la créatinine seule. Chez les chats de plus de 8 ans, un bilan annuel comprenant ces examens est très utile, même en l'absence de symptômes.</p>

<h2>La prise en charge au quotidien</h2>
<p>Une fois le diagnostic posé, la prise en charge repose sur plusieurs axes :</p>
<ul>
<li>une alimentation rénale spécifique, plus pauvre en phosphore et en protéines de qualité contrôlée</li>
<li>une hydratation maximale : pâtées, fontaine, eau fraîche en plusieurs points</li>
<li>des médicaments pour réguler la pression artérielle, soutenir la fonction rénale, limiter les protéines dans les urines</li>
<li>des perfusions sous-cutanées à domicile pour les stades avancés</li>
</ul>
<p>L'alimentation est l'un des leviers les plus puissants. Le passage à une alimentation rénale, accepté progressivement, peut prolonger nettement l'espérance de vie. Si votre chat est réticent, on essaie plusieurs textures, plusieurs marques, on réchauffe légèrement la pâtée.</p>

<h2>Suivre et adapter</h2>
<p>Une fois la maladie installée, des contrôles réguliers sont indispensables, en général tous les 3 à 6 mois selon le stade. On surveille l'évolution des paramètres sanguins, le poids, la pression artérielle et la qualité de vie. Le traitement s'ajuste en permanence.</p>
<p>Un chat en insuffisance rénale peut vivre plusieurs années avec une bonne qualité de vie si la maladie est suivie de près. Au stade terminal, en revanche, des choix difficiles peuvent se poser. Aborder ces sujets tôt avec le vétérinaire évite de devoir décider dans l'urgence.</p>

<p>L'insuffisance rénale n'est pas une fatalité silencieuse. Un bilan annuel après 8 ans, une attention aux petits changements de comportement et un suivi régulier permettent souvent d'agir tôt. Si vous remarquez une augmentation de la soif ou une perte de poids, prenez rendez-vous sans attendre.</p>`,
  },
]
