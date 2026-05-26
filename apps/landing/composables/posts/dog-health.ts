import type { BlogPost } from './types'

// [SEO-BLOG] Cluster "Santé chien" — 10 articles. Rempli par un agent.
export const dogHealthPosts: BlogPost[] = [
  {
    slug: 'calendrier-vaccination-chiot-chien-adulte',
    title: 'Calendrier de vaccination du chiot et du chien adulte',
    excerpt: 'Un repère clair des âges et des rappels pour ne plus rien oublier, du premier vaccin du chiot aux rappels annuels du chien adulte.',
    category: 'Santé chien',
    target: 'owner',
    author: 'Équipe Ficana',
    date: '8 Fév 2026',
    readTime: '6 min',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1469&q=80',
    content: `
<p class="lead">La vaccination est l'un des piliers de la santé de votre chien. Elle protège contre des maladies graves, parfois mortelles, et reste souvent obligatoire pour voyager ou fréquenter une pension. Voici un calendrier clair pour suivre les bons rendez-vous, du chiot au chien adulte.</p>

<h2>Les premières semaines du chiot</h2>
<p>Avant huit semaines, le chiot est en partie protégé par les anticorps transmis par sa mère. Ces anticorps diminuent ensuite progressivement, ce qui ouvre une fenêtre de vulnérabilité. La primovaccination commence donc généralement entre <strong>6 et 8 semaines</strong>, avec des rappels rapprochés pour construire une immunité solide.</p>
<p>Le schéma habituel suit ces étapes :</p>
<ul>
<li>Première injection vers 6 à 8 semaines (maladie de Carré, parvovirose, hépatite de Rubarth, parainfluenza).</li>
<li>Deuxième injection 3 à 4 semaines plus tard, souvent avec la leptospirose.</li>
<li>Troisième injection vers 16 semaines, importante pour les races sensibles à la parvovirose.</li>
<li>Premier rappel à un an, puis rappels selon le protocole du vétérinaire.</li>
</ul>
<p>La rage n'est obligatoire que dans certains cas (voyages, chiens de catégorie, pensions), mais elle se pratique à partir de 12 semaines, avec un délai d'incubation à respecter avant tout déplacement à l'étranger.</p>

<h2>Les vaccins du chien adulte</h2>
<p>Une fois adulte, votre chien a besoin de rappels réguliers. La fréquence dépend du vaccin, du mode de vie et des recommandations européennes les plus récentes. Certains vaccins se font tous les ans, d'autres tous les trois ans.</p>
<ul>
<li><strong>Leptospirose</strong> : rappel annuel, surtout pour les chiens qui se baignent ou vivent à la campagne.</li>
<li><strong>Toux du chenil</strong> : conseillée pour les chiens qui fréquentent d'autres congénères, les pensions ou les concours.</li>
<li><strong>Maladie de Carré, parvovirose, hépatite</strong> : rappel tous les un à trois ans selon le protocole.</li>
<li><strong>Rage</strong> : rappel annuel ou triennal selon le vaccin utilisé.</li>
</ul>

<h2>Adapter le calendrier au mode de vie</h2>
<p>Tous les chiens n'ont pas les mêmes besoins. Un chien de chasse exposé aux rongeurs, un chien qui voyage régulièrement ou un chien vivant en appartement ne sont pas soumis aux mêmes risques. Lors de la consultation annuelle, votre vétérinaire évalue ces facteurs et ajuste les vaccins.</p>
<p>Quelques situations à signaler :</p>
<ul>
<li>Voyages prévus à l'étranger, même pour quelques jours.</li>
<li>Mise en pension, élevage, expositions canines.</li>
<li>Vie en zone humide, contact fréquent avec d'autres chiens.</li>
<li>Chien âgé, immunodéprimé ou sous traitement lourd.</li>
</ul>

<h2>Effets secondaires et bons réflexes</h2>
<p>Dans la grande majorité des cas, la vaccination se passe sans incident. Une légère fatigue, une perte d'appétit ou une petite douleur au point d'injection sont fréquentes pendant 24 à 48 heures. Une réaction plus marquée (gonflement du museau, vomissements, abattement important) doit conduire à rappeler rapidement votre vétérinaire.</p>
<p>Notez chaque injection dans le carnet de santé ou dans une application de suivi : type de vaccin, date, numéro de lot. Cela vous évitera de chercher l'information au mauvais moment, notamment avant un voyage.</p>

<p>La vaccination n'est pas un acte anodin, mais elle reste la protection la plus efficace contre des maladies redoutables. En cas de doute sur un rappel ou sur la pertinence d'un vaccin, parlez-en lors de la prochaine visite : votre vétérinaire connaît votre chien et son environnement.</p>
`
  },
  {
    slug: 'vermifuger-chien-frequence-produit',
    title: 'Vermifuger son chien : fréquence et choix du produit',
    excerpt: 'Quand vermifuger, à quelle fréquence, et comment choisir le bon produit selon l\'âge et le mode de vie de votre chien.',
    category: 'Santé chien',
    target: 'owner',
    author: 'Équipe Ficana',
    date: '4 Mar 2026',
    readTime: '5 min',
    image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1469&q=80',
    content: `
<p class="lead">Vermifuger son chien est un geste simple, mais souvent mal calibré. Trop espacé, il laisse la porte ouverte à des parasites internes. Mal choisi, il peut être inefficace contre certains vers. Voici comment poser un protocole clair et adapté.</p>

<h2>Pourquoi vermifuger régulièrement</h2>
<p>Le chien attrape des parasites internes de multiples façons : en reniflant des excréments, en mangeant de l'herbe, en chassant un rongeur, en avalant une puce porteuse de ténia, ou simplement en buvant dans une flaque. Certains vers sont aussi transmissibles à l'humain, en particulier aux enfants. La vermifugation protège donc à la fois votre chien et votre foyer.</p>
<p>Les parasites les plus courants sont les vers ronds (ascaris, ankylostomes, trichures) et les vers plats (ténias, dipylidium). Tous ne provoquent pas les mêmes symptômes, et beaucoup passent inaperçus pendant des semaines.</p>

<h2>Quelle fréquence selon l'âge</h2>
<p>Le rythme dépend surtout de l'âge et du mode de vie. Pour la majorité des chiens, voici un repère utile :</p>
<ul>
<li><strong>Chiot</strong> : tous les 15 jours jusqu'à 2 mois, puis tous les mois jusqu'à 6 mois.</li>
<li><strong>Chien adulte</strong> : quatre fois par an, soit tous les 3 mois.</li>
<li><strong>Chien à risque</strong> (chasse, contact enfants, vie en collectivité) : tous les mois.</li>
<li><strong>Chienne gestante</strong> : avant la saillie, puis avant la mise bas, puis pendant l'allaitement.</li>
</ul>
<p>Un vermifuge ne protège pas dans la durée. Il agit le jour de la prise et élimine les parasites présents à ce moment-là. C'est pour cela que la régularité compte plus que la dose.</p>

<h2>Choisir le bon produit</h2>
<p>Tous les vermifuges ne se valent pas. Certains traitent uniquement les vers ronds, d'autres couvrent vers ronds et vers plats. Un produit acheté en grande surface peut suffire pour une routine simple, mais sera insuffisant pour un chien exposé.</p>
<p>Quelques points à vérifier avec votre vétérinaire :</p>
<ul>
<li>Spectre du produit : couvre-t-il les vers ronds et plats ?</li>
<li>Forme : comprimé appétent, pâte orale, pipette spot-on selon le caractère du chien.</li>
<li>Compatibilité avec d'autres traitements (antiparasitaires externes, médicaments en cours).</li>
<li>Précautions pour les races sensibles (Colley, Berger australien, Border Collie) à cause du gène MDR1.</li>
</ul>
<p>Pour les chiens qui régurgitent les comprimés, il existe des présentations en pâte ou injectables sur prescription. Mieux vaut un produit bien donné qu'un protocole théoriquement parfait mais que votre chien recrache.</p>

<h2>Reconnaître une infestation</h2>
<p>Beaucoup de chiens infestés ne montrent aucun signe. Quand des symptômes apparaissent, ils ressemblent à ceci :</p>
<ul>
<li>Diarrhée, parfois avec du sang ou des glaires.</li>
<li>Vomissements, parfois contenant des vers visibles.</li>
<li>Ventre gonflé chez le chiot, poil terne.</li>
<li>Démangeaisons anales, le chien se traîne sur l'arrière-train.</li>
<li>Perte de poids inexpliquée malgré un bon appétit.</li>
</ul>
<p>Si vous observez l'un de ces signes, consultez votre vétérinaire avant de donner un vermifuge au hasard. Un examen ou une analyse de selles permet d'identifier le parasite et de choisir le traitement adapté.</p>

<p>La vermifugation est l'un des gestes les plus efficaces pour préserver la santé digestive de votre chien. Notez chaque prise dans son carnet ou dans une application de suivi, et ajustez le rythme à mesure que son mode de vie change. En cas de doute sur un produit ou un dosage, votre vétérinaire reste le bon interlocuteur.</p>
`
  },
  {
    slug: 'detecter-otite-chien-signes-premiers-gestes',
    title: 'Détecter une otite chez le chien : signes et premiers gestes',
    excerpt: 'Apprenez à repérer une otite avant qu\'elle ne s\'installe, à faire les bons gestes à la maison et à savoir quand consulter.',
    category: 'Santé chien',
    target: 'owner',
    author: 'Équipe Ficana',
    date: '28 Mar 2026',
    readTime: '5 min',
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1469&q=80',
    content: `
<p class="lead">L'otite est l'un des motifs de consultation les plus fréquents chez le chien. Souvent douloureuse, elle peut se compliquer rapidement si elle n'est pas prise en charge. Savoir la repérer tôt évite beaucoup de désagréments à votre animal.</p>

<h2>Pourquoi le chien est sujet aux otites</h2>
<p>Le conduit auditif du chien forme un coude, ce qui favorise la stagnation de la cire, de l'humidité et des débris. Certaines races sont plus exposées que d'autres : chiens à oreilles tombantes (Cocker, Basset, Cavalier King Charles), races à conduits étroits (Shar-Pei) ou chiens qui se baignent souvent. Les allergies alimentaires ou environnementales sont aussi une cause majeure d'otites chroniques.</p>
<p>Une otite n'est pas toujours due à une infection. Elle peut être déclenchée par un corps étranger (épillet en été), un parasite (gale auriculaire), une réaction allergique ou une simple humidité résiduelle après le bain.</p>

<h2>Les signes qui doivent alerter</h2>
<p>Les symptômes d'une otite sont souvent évidents quand on sait quoi regarder :</p>
<ul>
<li>Le chien secoue la tête de façon répétée.</li>
<li>Il se gratte fréquemment une oreille, parfois jusqu'au sang.</li>
<li>Il penche la tête d'un côté.</li>
<li>Une odeur forte se dégage du conduit.</li>
<li>Un écoulement brun, jaune ou noir est visible.</li>
<li>L'oreille est rouge, chaude, parfois gonflée.</li>
<li>Le chien grogne ou se dérobe quand vous touchez sa tête.</li>
</ul>
<p>Dans les formes plus avancées, on peut voir une perte d'équilibre, des yeux qui bougent involontairement ou une baisse d'appétit. Ce sont des signes d'otite interne, plus sérieuse, qui nécessite une consultation rapide.</p>

<h2>Les bons gestes à la maison</h2>
<p>Avant de manipuler l'oreille, observez calmement votre chien et évitez d'introduire quoi que ce soit dans le conduit. Pas de coton-tige, pas de produit ménager, pas d'huile improvisée : ces gestes aggravent souvent la situation.</p>
<p>Ce que vous pouvez faire :</p>
<ul>
<li>Nettoyer le pavillon visible avec une compresse propre légèrement humide.</li>
<li>Utiliser un nettoyant auriculaire vétérinaire si vous en avez déjà à la maison, en suivant la notice.</li>
<li>Sécher délicatement après un bain ou une baignade.</li>
<li>Noter depuis quand les symptômes sont apparus et leur évolution.</li>
</ul>
<p>Si le conduit est très rouge, douloureux, ou si vous voyez du sang, ne nettoyez pas et prenez rendez-vous. Un tympan abîmé contre-indique la plupart des produits du commerce.</p>

<h2>Quand consulter sans attendre</h2>
<p>Une otite mal soignée peut évoluer vers une otite chronique, beaucoup plus difficile à traiter, voire vers une surdité partielle. Consultez rapidement si :</p>
<ul>
<li>Les symptômes durent plus de 48 heures.</li>
<li>L'odeur est très forte ou l'écoulement abondant.</li>
<li>Votre chien est abattu, ne mange plus ou a de la fièvre.</li>
<li>Il perd l'équilibre ou tient la tête penchée en permanence.</li>
<li>Vous suspectez un épillet (après une promenade dans les hautes herbes).</li>
</ul>
<p>Le vétérinaire examinera le conduit à l'otoscope et pourra prélever un échantillon pour identifier l'agent en cause. Le traitement varie selon qu'il s'agit d'une infection bactérienne, fongique, d'une gale ou d'une allergie sous-jacente.</p>

<p>En cas de doute sur l'état des oreilles de votre chien, mieux vaut consulter tôt : une otite débutante se soigne en quelques jours, alors qu'une forme installée demande parfois plusieurs semaines de traitement.</p>
`
  },
  {
    slug: 'torsion-estomac-grand-chien-urgence-vitale',
    title: "La torsion d'estomac chez le grand chien : une urgence vitale",
    excerpt: 'Reconnaître les premiers signes du syndrome dilatation-torsion d\'estomac peut sauver la vie de votre chien. Voici ce qu\'il faut savoir.',
    category: 'Santé chien',
    target: 'owner',
    author: 'Équipe Ficana',
    date: '21 Avr 2026',
    readTime: '6 min',
    image: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1469&q=80',
    content: `
<p class="lead">Le syndrome dilatation-torsion d'estomac, souvent appelé "retournement d'estomac", est l'une des urgences les plus redoutées chez le grand chien. Sans prise en charge dans les heures qui suivent, l'issue est presque toujours fatale. Connaître les signes et les bons réflexes peut sauver votre chien.</p>

<h2>Ce qui se passe dans l'organisme</h2>
<p>L'estomac se remplit de gaz et de liquide, gonfle, puis pivote sur lui-même. Cette torsion bloque les entrées et sorties de l'estomac et comprime les gros vaisseaux qui passent à proximité. Le retour du sang vers le cœur s'effondre, et la circulation se dégrade très vite. En quelques heures, des tissus de l'estomac peuvent se nécroser.</p>
<p>Les grands chiens à thorax profond sont les plus exposés : Dogue Allemand, Setter, Boxer, Berger Allemand, Doberman, Weimaraner, Saint-Bernard. Le risque augmente avec l'âge, le stress, et certaines habitudes alimentaires.</p>

<h2>Les signes qui ne trompent pas</h2>
<p>Une torsion d'estomac s'installe en général dans les heures qui suivent un repas. Les symptômes apparaissent rapidement :</p>
<ul>
<li>Ventre qui se gonfle visiblement, tendu comme un ballon.</li>
<li>Tentatives répétées de vomir, sans rien produire ou avec de la mousse.</li>
<li>Hypersalivation, le chien bave abondamment.</li>
<li>Agitation, incapacité à trouver une position confortable.</li>
<li>Respiration rapide et superficielle.</li>
<li>Gencives pâles, muqueuses qui virent au gris.</li>
<li>Affaiblissement brutal, parfois effondrement.</li>
</ul>
<p>Si vous reconnaissez ces signes, considérez qu'il s'agit d'une urgence absolue. Chaque minute compte.</p>

<h2>Que faire dans l'urgence</h2>
<p>Il n'existe aucune solution maison pour traiter une torsion d'estomac. La seule réponse est chirurgicale. Voici ce que vous pouvez faire pour gagner du temps :</p>
<ul>
<li>Appelez immédiatement votre vétérinaire ou la clinique d'urgence la plus proche.</li>
<li>Décrivez précisément les symptômes pour qu'ils anticipent votre arrivée.</li>
<li>Transportez votre chien sans le forcer à marcher, en le portant si nécessaire.</li>
<li>Évitez de lui donner à boire, à manger, ou tout médicament.</li>
<li>Restez calme : votre chien ressent votre stress.</li>
</ul>
<p>Sur place, l'équipe vétérinaire stabilisera votre chien (perfusion, antidouleur, décompression de l'estomac) avant l'intervention chirurgicale. Cette chirurgie permet de remettre l'estomac en place et de le fixer à la paroi abdominale pour éviter une récidive (gastropexie).</p>

<h2>Réduire le risque au quotidien</h2>
<p>On ne peut pas éliminer totalement le risque, mais certaines habitudes le diminuent nettement :</p>
<ul>
<li>Diviser la ration en deux ou trois repas par jour plutôt qu'un seul gros repas.</li>
<li>Éviter l'exercice intense dans l'heure qui précède et qui suit le repas.</li>
<li>Surélever ou non la gamelle selon les recommandations actuelles : la question est encore débattue, demandez l'avis de votre vétérinaire.</li>
<li>Limiter la consommation d'eau brutale après un effort.</li>
<li>Choisir une alimentation adaptée, à base de croquettes de bonne taille et peu de céréales fermentescibles.</li>
</ul>
<p>Chez les races très exposées, une gastropexie préventive peut être proposée, souvent lors de la stérilisation. Cette intervention ne supprime pas la dilatation, mais empêche la torsion, ce qui change radicalement le pronostic.</p>

<p>Si vous avez un grand chien, prenez le temps de repérer où se trouve la clinique d'urgence la plus proche de chez vous et notez son numéro. En cas de doute face à un ventre gonflé et des tentatives de vomir improductives, ne temporisez pas : foncez chez le vétérinaire.</p>
`
  },
  {
    slug: 'arthrose-chien-age-reconnaitre-soulager',
    title: 'Arthrose du chien âgé : la reconnaître et la soulager',
    excerpt: 'L\'arthrose touche un chien senior sur cinq. Voici les signes à repérer et les solutions concrètes pour préserver son confort de vie.',
    category: 'Santé chien',
    target: 'owner',
    author: 'Équipe Ficana',
    date: '14 Mai 2026',
    readTime: '6 min',
    image: 'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1469&q=80',
    content: `
<p class="lead">L'arthrose s'installe souvent sans bruit chez le chien qui vieillit. Une raideur le matin, une réticence à sauter dans la voiture, et l'on attribue tout cela à l'âge. Pourtant, c'est une maladie articulaire que l'on peut soulager efficacement, à condition de la repérer tôt.</p>

<h2>Ce qu'est vraiment l'arthrose</h2>
<p>L'arthrose est une usure progressive du cartilage qui recouvre les os au niveau des articulations. Sans ce cartilage, les os frottent les uns contre les autres, ce qui provoque une inflammation, de la douleur, et des modifications osseuses (becs de perroquet, ostéophytes). Le mouvement devient pénible, puis évité.</p>
<p>Cette maladie est chronique et évolutive. On ne la guérit pas, mais on ralentit son évolution et on en atténue les symptômes. Les chiens de grande taille, les races prédisposées (Labrador, Berger Allemand, Rottweiler) et les chiens en surpoids sont les plus touchés.</p>

<h2>Les signes à observer</h2>
<p>Le chien ne se plaint pas avec des mots, mais son comportement parle pour lui. Soyez attentif aux changements progressifs :</p>
<ul>
<li>Raideur le matin ou après une longue sieste, qui s'estompe en bougeant.</li>
<li>Réticence à monter les escaliers, à sauter dans le canapé ou la voiture.</li>
<li>Démarche plus lente, foulée raccourcie.</li>
<li>Boiterie intermittente, parfois changeante d'un membre à l'autre.</li>
<li>Léchage insistant d'une articulation (coude, genou, hanche).</li>
<li>Changement de caractère : irritabilité, retrait, moins d'envie de jouer.</li>
<li>Difficulté à se lever ou à s'asseoir.</li>
</ul>
<p>Le froid et l'humidité accentuent souvent ces signes. À l'inverse, un peu de mouvement doux les améliore : c'est typique de l'arthrose.</p>

<h2>Soulager au quotidien</h2>
<p>La prise en charge repose toujours sur plusieurs leviers combinés. Aucun seul outil ne suffit, mais l'effet cumulé change vraiment la vie du chien.</p>
<ul>
<li><strong>Le poids</strong> : un chien en surpoids souffre deux fois plus. Une perte de 5 à 10 % du poids améliore parfois la mobilité plus que n'importe quel médicament.</li>
<li><strong>L'activité</strong> : promenades régulières, courtes et adaptées. Mieux vaut deux sorties de 20 minutes qu'une grande balade épuisante.</li>
<li><strong>Le couchage</strong> : un panier orthopédique, dans un endroit chaud et sans courant d'air, à l'écart des sauts.</li>
<li><strong>Les sols</strong> : des tapis sur le carrelage évitent les glissades qui réveillent la douleur.</li>
<li><strong>Les rampes</strong> : une petite rampe pour la voiture ou le canapé préserve les articulations.</li>
</ul>

<h2>Les traitements possibles</h2>
<p>Votre vétérinaire peut proposer plusieurs options, à combiner selon l'évolution :</p>
<ul>
<li>Anti-inflammatoires sur prescription, en cure ou au long cours, avec un suivi régulier des reins et du foie.</li>
<li>Chondroprotecteurs (glucosamine, chondroïtine, harpagophyton) en complément.</li>
<li>Injections intra-articulaires d'acide hyaluronique ou de plasma riche en plaquettes dans certains cas.</li>
<li>Physiothérapie, balnéothérapie, laser, qui donnent souvent de très bons résultats.</li>
<li>Adaptation de l'alimentation avec des croquettes spécifiques riches en oméga 3.</li>
</ul>
<p>Évitez de donner des médicaments humains (paracétamol, ibuprofène) qui sont toxiques pour le chien. Même à faible dose, ils peuvent provoquer des lésions graves.</p>

<p>L'arthrose n'empêche pas un chien d'avoir de belles années devant lui, à condition d'agir tôt et de maintenir un suivi régulier avec votre vétérinaire. Notez l'évolution dans un carnet de suivi : c'est un repère précieux pour ajuster les traitements et garder votre chien confortable jusqu'au bout.</p>
`
  },
  {
    slug: 'soins-dentaires-chien-prevenir-tartre',
    title: 'Soins dentaires du chien : prévenir le tartre au quotidien',
    excerpt: 'Le tartre touche 80 % des chiens dès trois ans. Quelques habitudes simples permettent de préserver une bouche saine sur le long terme.',
    category: 'Santé chien',
    target: 'owner',
    author: 'Équipe Ficana',
    date: '6 Juin 2026',
    readTime: '5 min',
    image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1469&q=80',
    content: `
<p class="lead">Une mauvaise haleine, des gencives qui saignent ou un chien qui mange moins bien : ces signes sont souvent attribués à l'âge, alors qu'ils traduisent une maladie parodontale en cours. Prévenir le tartre est l'un des soins les plus rentables que vous puissiez offrir à votre chien.</p>

<h2>Pourquoi le tartre est un vrai sujet</h2>
<p>Le tartre se forme à partir de la plaque dentaire, une fine couche invisible faite de salive, de restes alimentaires et de bactéries. En quelques jours, cette plaque se minéralise et devient le tartre brun-jaune qu'on observe sur les dents. Il ne se retire plus avec une brosse : seul un détartrage vétérinaire en vient à bout.</p>
<p>Le problème n'est pas seulement esthétique. Les bactéries du tartre attaquent les gencives, déchaussent les dents, et peuvent passer dans la circulation. Une parodontite chronique fragilise le cœur, les reins et le foie sur le long terme.</p>

<h2>Les signes d'une bouche en mauvaise santé</h2>
<p>Pensez à regarder la bouche de votre chien chaque semaine. Ouvrez doucement, soulevez la babine, observez les gencives et les dents du fond. Les signaux d'alerte :</p>
<ul>
<li>Haleine forte, qui dépasse la simple odeur de croquette.</li>
<li>Gencives rouges, gonflées ou qui saignent au contact.</li>
<li>Tartre visible, surtout sur les molaires et la canine supérieure.</li>
<li>Salivation excessive, parfois teintée de sang.</li>
<li>Difficulté à manger des aliments durs, ou mastication d'un seul côté.</li>
<li>Dent qui bouge, dent cassée, dent qui tombe.</li>
<li>Patte qui frotte la mâchoire de façon répétée.</li>
</ul>

<h2>Les bons gestes au quotidien</h2>
<p>La meilleure prévention reste mécanique : il faut désorganiser la plaque avant qu'elle ne se minéralise. Plusieurs outils existent, à combiner selon votre chien.</p>
<ul>
<li><strong>Le brossage</strong> : c'est la méthode la plus efficace. Idéalement deux à trois fois par semaine, avec une brosse adaptée et un dentifrice vétérinaire (jamais de dentifrice humain, qui contient du fluor et du xylitol toxiques).</li>
<li><strong>Les lamelles à mâcher</strong> : utiles si elles sont données quotidiennement, en complément. Choisissez des produits validés par les recommandations vétérinaires.</li>
<li><strong>L'alimentation</strong> : certaines croquettes spécifiques ont une texture et une composition qui freinent la plaque.</li>
<li><strong>Les solutions à ajouter dans l'eau</strong> : moins efficaces seules, mais intéressantes en complément.</li>
<li><strong>Les jouets à mâcher</strong> : adaptés à la taille et à la mâchoire du chien, en évitant les os trop durs qui cassent les dents.</li>
</ul>

<h2>Quand programmer un détartrage</h2>
<p>Même avec une bonne routine, certains chiens accumulent du tartre. C'est plus marqué chez les petites races (Yorkshire, Caniche, Bichon, Chihuahua), souvent dès 3 ou 4 ans. Le détartrage se fait sous anesthésie générale, car il faut nettoyer aussi sous la gencive et passer la sonde sur chaque dent.</p>
<p>La fréquence dépend du chien :</p>
<ul>
<li>Petites races et chiens à mâchoire courte : tous les 1 à 2 ans souvent.</li>
<li>Grandes races avec bonne hygiène : tous les 3 à 5 ans.</li>
<li>Chien âgé avec parodontite installée : à évaluer au cas par cas.</li>
</ul>
<p>Un bilan dentaire annuel lors de la visite de vaccination permet de décider sans attendre que la situation se dégrade.</p>

<p>Prendre soin de la bouche de son chien demande quelques minutes par semaine, mais épargne souvent des extractions dentaires douloureuses plus tard. Si vous ne savez pas par où commencer, demandez à votre vétérinaire de vous montrer le geste de brossage lors d'une consultation : c'est plus simple qu'il n'y paraît.</p>
`
  },
  {
    slug: 'coupures-plaies-blessures-bons-reflexes-maison',
    title: 'Coupures, plaies, blessures : les bons réflexes à la maison',
    excerpt: 'Une coupure de coussinet, une griffure, une plaie qui saigne : voici les gestes simples à connaître avant de partir chez le vétérinaire.',
    category: 'Santé chien',
    target: 'owner',
    author: 'Équipe Ficana',
    date: '29 Juin 2026',
    readTime: '5 min',
    image: 'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1469&q=80',
    content: `
<p class="lead">Un éclat de verre lors d'une promenade, une bagarre avec un autre chien, une chute sur du grillage : les petites blessures sont fréquentes. Savoir réagir calmement permet de limiter les complications et d'éviter une infection qui transformera une plaie banale en consultation d'urgence.</p>

<h2>Évaluer la gravité de la plaie</h2>
<p>Toutes les blessures ne se gèrent pas de la même façon. Avant de toucher la plaie, observez :</p>
<ul>
<li>La taille et la profondeur : superficielle, ou jusqu'au muscle ?</li>
<li>L'origine : objet propre, morsure, brûlure, écrasement ?</li>
<li>Le saignement : continu, par à-coups, ou stoppé ?</li>
<li>La localisation : coussinet, oreille, abdomen, articulation ?</li>
<li>Le comportement du chien : alerte ou prostré ?</li>
</ul>
<p>Certaines plaies semblent anodines mais nécessitent toujours un avis vétérinaire : morsures (risque infectieux élevé), plaies pénétrantes, plaies au niveau des yeux, plaies abdominales, brûlures étendues. À l'inverse, une petite égratignure superficielle peut souvent être gérée à la maison.</p>

<h2>Les gestes immédiats</h2>
<p>Avant tout, mettez-vous en sécurité. Un chien blessé, même très doux d'ordinaire, peut mordre par réflexe de douleur. Si nécessaire, glissez une serviette autour de sa tête ou improvisez une muselière souple.</p>
<p>Ensuite, suivez cet ordre :</p>
<ul>
<li>Calmez votre chien en lui parlant doucement, sans précipitation.</li>
<li>Stoppez le saignement en appuyant fermement avec une compresse propre pendant 3 à 5 minutes sans soulever pour vérifier.</li>
<li>Une fois le saignement contrôlé, rincez la plaie à l'eau claire ou au sérum physiologique.</li>
<li>Désinfectez avec un antiseptique adapté (chlorhexidine diluée, polyvidone iodée).</li>
<li>Couvrez la plaie avec une compresse stérile maintenue par une bande non collante.</li>
</ul>
<p>Évitez l'alcool, l'eau oxygénée pure ou les huiles essentielles : ils irritent les tissus et ralentissent la cicatrisation.</p>

<h2>Soigner sur la durée</h2>
<p>Pour une petite plaie superficielle, le suivi à la maison est généralement suffisant :</p>
<ul>
<li>Nettoyer une à deux fois par jour avec un antiseptique doux.</li>
<li>Changer le pansement quand il est sale ou humide.</li>
<li>Empêcher le chien de lécher avec une collerette : la salive empêche la cicatrisation et amène des bactéries.</li>
<li>Vérifier chaque jour la couleur des bords (rosée, propre) et l'absence d'écoulement.</li>
<li>Limiter l'activité, surtout pour les plaies aux pattes.</li>
</ul>
<p>Une plaie évolue normalement vers une fermeture nette en 5 à 10 jours. Une rougeur qui s'étend, un gonflement chaud, du pus, une mauvaise odeur ou de la fièvre signalent une infection et imposent une consultation rapide.</p>

<h2>Quand consulter sans hésiter</h2>
<p>Il vaut mieux consulter une fois de trop qu'une fois de trop tard. Rendez-vous chez le vétérinaire si :</p>
<ul>
<li>La plaie mesure plus de 2 centimètres ou bâille (les bords ne se rejoignent pas).</li>
<li>Le saignement ne s'arrête pas après 10 minutes de pression.</li>
<li>Il s'agit d'une morsure, même petite.</li>
<li>La plaie est sale, terreuse ou contient un corps étranger.</li>
<li>Elle se situe près d'un œil, d'une articulation, du ventre ou du thorax.</li>
<li>Votre chien est abattu, fébrile ou refuse de manger.</li>
<li>Vous n'êtes simplement pas sûr de l'évolution.</li>
</ul>
<p>Pensez aussi au statut vaccinal antitétanique de votre chien (rare mais utile pour les plaies souillées) et à la date du dernier rappel antirabique en cas de morsure ou de contact avec un animal inconnu.</p>

<p>Une trousse de premiers soins simple suffit : compresses stériles, bande, antiseptique, ciseaux à bouts ronds, sérum physiologique, collerette. Préparée à l'avance, elle vous fera gagner un temps précieux le jour où votre chien rentrera de balade avec une patte qui saigne.</p>
`
  },
  {
    slug: 'mon-chien-tousse-faut-il-sinquieter',
    title: "Mon chien tousse : faut-il vraiment s'inquiéter ?",
    excerpt: 'Une toux passagère ou un signe de maladie cardiaque ? Apprenez à distinguer les différents types de toux et à savoir quand consulter.',
    category: 'Santé chien',
    target: 'owner',
    author: 'Équipe Ficana',
    date: '22 Juil 2026',
    readTime: '5 min',
    image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1469&q=80',
    content: `
<p class="lead">Un chien qui tousse, ce n'est pas anodin. La toux est un symptôme, pas une maladie, et elle peut traduire des choses très différentes selon son type, sa durée et le contexte. Avant de paniquer ou de minimiser, prenez le temps de l'observer.</p>

<h2>Reconnaître les différents types de toux</h2>
<p>Le mot "toux" recouvre des réalités très variées. Décrire précisément ce que vous entendez aide énormément le vétérinaire à orienter le diagnostic.</p>
<ul>
<li><strong>Toux sèche et rauque</strong>, qui ressemble à un objet coincé dans la gorge : souvent une trachéo-bronchite (toux du chenil), surtout après un séjour en collectivité.</li>
<li><strong>Toux grasse</strong>, accompagnée de glaires ou de bruits humides : suggère une atteinte des poumons (bronchite, pneumonie).</li>
<li><strong>Toux qui finit par un haut-le-cœur</strong> ou un rejet de mousse blanche : souvent associée à une irritation trachéale.</li>
<li><strong>Toux nocturne ou au repos</strong>, qui réveille le chien : à prendre au sérieux, elle peut traduire une atteinte cardiaque.</li>
<li><strong>Toux à l'effort</strong> uniquement : possible problème respiratoire ou cardiaque selon le contexte.</li>
<li><strong>Toux brutale en pleine balade</strong> : pensez à un corps étranger (épillet, brin d'herbe inhalé).</li>
</ul>

<h2>Les causes les plus fréquentes</h2>
<p>La toux du chien a quatre grandes origines : respiratoire, cardiaque, infectieuse ou mécanique. Voici les situations les plus courantes :</p>
<ul>
<li><strong>Toux du chenil</strong> : contagieuse, souvent contractée en pension, au parc ou en exposition. La toux est sèche, en quintes, le chien reste en bonne forme générale.</li>
<li><strong>Collapsus trachéal</strong> : fréquent chez les petites races (Yorkshire, Caniche, Chihuahua), il provoque une toux sèche typique en "klaxon".</li>
<li><strong>Insuffisance cardiaque</strong> : chez le chien âgé, surtout les Cavalier King Charles, Caniches et petites races. La toux est souvent nocturne et accompagnée d'une fatigue à l'effort.</li>
<li><strong>Bronchite chronique</strong> : toux quotidienne installée, plus marquée le matin.</li>
<li><strong>Pneumonie</strong> : toux grasse, fièvre, abattement, perte d'appétit.</li>
<li><strong>Corps étranger</strong> : toux brutale, parfois avec saignement, après une promenade.</li>
<li><strong>Allergies</strong> : toux saisonnière, souvent associée à des démangeaisons.</li>
</ul>

<h2>Ce que vous pouvez observer à la maison</h2>
<p>Avant la consultation, recueillez le maximum d'informations utiles. C'est souvent là que se cache la clé du diagnostic :</p>
<ul>
<li>Depuis quand votre chien tousse-t-il ?</li>
<li>La toux est-elle plus marquée à un moment précis (nuit, matin, effort, excitation) ?</li>
<li>Y a-t-il un facteur déclenchant (pension, sortie en forêt, contact avec d'autres chiens) ?</li>
<li>Comment est sa respiration au repos ? Comptez le nombre de mouvements par minute (normal : 15 à 30).</li>
<li>Mange-t-il et boit-il normalement ? Joue-t-il comme d'habitude ?</li>
<li>Y a-t-il du sang, des glaires, un écoulement nasal ?</li>
</ul>
<p>Une courte vidéo de la toux est extrêmement utile pour votre vétérinaire : la toux ne se produit presque jamais au moment de la consultation.</p>

<h2>Quand consulter</h2>
<p>Toutes les toux ne sont pas urgentes, mais certaines doivent vous conduire chez le vétérinaire rapidement :</p>
<ul>
<li>Toux qui persiste plus de 3 à 5 jours.</li>
<li>Toux qui s'aggrave d'un jour à l'autre.</li>
<li>Toux associée à une difficulté respiratoire ou à des gencives qui virent au bleu.</li>
<li>Toux nocturne chez un chien âgé.</li>
<li>Toux avec du sang.</li>
<li>Toux après une promenade en zone d'épillets (été surtout).</li>
<li>Chien abattu, qui mange moins ou perd du poids.</li>
</ul>
<p>Le vétérinaire pourra ausculter le cœur et les poumons, demander une radio thoracique, une analyse de sang ou parfois une échographie cardiaque selon les résultats.</p>

<p>Une toux occasionnelle après un effort ou un peu d'excitation n'est pas forcément alarmante. En revanche, une toux qui s'installe doit toujours être explorée. En cas de doute, contactez votre vétérinaire pour décrire les symptômes : il saura si une consultation s'impose dans l'immédiat.</p>
`
  },
  {
    slug: 'diabete-chien-symptomes-accompagnement',
    title: 'Le diabète chez le chien : symptômes et accompagnement',
    excerpt: 'Le diabète canin est plus fréquent qu\'on ne le pense. Voici comment le reconnaître et vivre au quotidien avec un chien diabétique.',
    category: 'Santé chien',
    target: 'owner',
    author: 'Équipe Ficana',
    date: '18 Août 2026',
    readTime: '6 min',
    image: 'https://images.unsplash.com/photo-1583511655826-05700d52f4d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1469&q=80',
    content: `
<p class="lead">Le diabète du chien n'est pas une fatalité. Avec un suivi rigoureux, un chien diabétique peut vivre des années dans de bonnes conditions. Mais le diagnostic intervient souvent tardivement, car les premiers signes passent inaperçus. Mieux les connaître permet d'agir plus tôt.</p>

<h2>Ce qu'est le diabète chez le chien</h2>
<p>Le diabète sucré du chien est dû à un défaut de production d'insuline par le pancréas. Sans insuline, le sucre apporté par l'alimentation reste dans le sang au lieu de nourrir les cellules. L'organisme cherche alors de l'énergie dans les graisses et les muscles, ce qui explique la perte de poids paradoxale malgré un bon appétit.</p>
<p>Le diabète canin ressemble davantage au diabète de type 1 humain : il nécessite des injections quotidiennes d'insuline. Il touche le plus souvent les chiens d'âge moyen à âgé, avec une prédisposition chez les femelles non stérilisées, certaines races (Caniche, Teckel, Bichon, Beagle) et les chiens en surpoids.</p>

<h2>Les signes à repérer</h2>
<p>Les symptômes s'installent en quelques semaines, parfois quelques mois. Quatre signes sont très évocateurs :</p>
<ul>
<li><strong>Polyurie</strong> : votre chien urine plus souvent et en plus grande quantité. Il peut demander à sortir la nuit ou avoir des accidents.</li>
<li><strong>Polydipsie</strong> : il boit beaucoup plus qu'avant, vide sa gamelle plusieurs fois par jour.</li>
<li><strong>Polyphagie</strong> : il a faim en permanence, réclame avec insistance.</li>
<li><strong>Amaigrissement</strong> : malgré l'appétit, il maigrit visiblement.</li>
</ul>
<p>D'autres signes peuvent s'ajouter : poil terne, fatigue, infections urinaires à répétition, cataracte qui s'installe rapidement (le chien voit moins bien, se cogne dans les meubles). Une cataracte d'apparition brutale chez un chien adulte doit toujours faire évoquer un diabète.</p>

<h2>Le diagnostic et la mise en route du traitement</h2>
<p>Le diagnostic repose sur une prise de sang et une analyse d'urine. Le vétérinaire mesure la glycémie, recherche du sucre dans les urines, et complète parfois par un bilan rénal et hépatique. Une fois le diagnostic posé, le traitement commence sans tarder.</p>
<p>La base du traitement, c'est l'insuline en injection sous-cutanée, généralement deux fois par jour à heures fixes, juste après le repas. Le vétérinaire choisit le type d'insuline et la dose de départ, puis ajuste sur plusieurs semaines à l'aide de courbes de glycémie.</p>
<p>Les premiers jours sont impressionnants, mais l'injection est plus simple qu'il n'y paraît. Votre vétérinaire vous formera au geste : aiguille très fine, peu douloureuse, et la plupart des chiens s'y habituent vite, surtout si elle s'accompagne d'une récompense.</p>

<h2>Vivre avec un chien diabétique</h2>
<p>Le quotidien d'un chien diabétique repose sur une grande régularité. Quelques règles à intégrer :</p>
<ul>
<li>Repas à heures fixes, en quantité fixe, avec une alimentation adaptée (croquettes vétérinaires "diabétiques" en général).</li>
<li>Pas de friandises sucrées, pas de restes de table sucrés.</li>
<li>Injection après le repas, jamais avant : si le chien n'a pas mangé, contactez le vétérinaire avant d'injecter.</li>
<li>Activité physique régulière, du même type chaque jour. Les efforts intenses inhabituels peuvent faire chuter la glycémie.</li>
<li>Conservation de l'insuline au réfrigérateur, sans la secouer (rouler doucement le flacon entre les mains).</li>
<li>Stérilisation systématique des femelles non stérilisées : les hormones féminines déstabilisent le diabète.</li>
</ul>

<h2>Reconnaître une hypoglycémie</h2>
<p>L'urgence à connaître absolument est l'hypoglycémie, quand le taux de sucre devient trop bas. Elle peut survenir si la dose d'insuline est trop forte, si le chien n'a pas assez mangé ou s'il a fait un effort inhabituel. Les signes :</p>
<ul>
<li>Faiblesse, démarche titubante.</li>
<li>Tremblements.</li>
<li>Désorientation, regard fixe.</li>
<li>Convulsions dans les cas graves.</li>
</ul>
<p>Si votre chien est encore conscient, frottez du miel ou du sirop de glucose sur ses gencives, puis contactez immédiatement le vétérinaire. Gardez toujours du miel à portée de main : c'est le geste qui peut sauver votre chien en quelques minutes.</p>

<p>Le diabète demande un engagement réel, mais il devient vite une routine. Avec un bon suivi, des bilans sanguins réguliers et un peu d'organisation, votre chien peut conserver une vie pleine et confortable. En cas de doute sur une dose ou un comportement inhabituel, votre vétérinaire reste votre repère.</p>
`
  },
  {
    slug: 'coup-de-chaleur-chien-prevenir-reagir',
    title: 'Coup de chaleur chez le chien : prévenir et réagir vite',
    excerpt: 'Le coup de chaleur tue chaque été des chiens en quelques minutes. Voici les bons gestes pour le prévenir et savoir comment réagir.',
    category: 'Santé chien',
    target: 'owner',
    author: 'Équipe Ficana',
    date: '20 Nov 2026',
    readTime: '5 min',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1469&q=80',
    content: `
<p class="lead">Le chien ne transpire pas comme nous. Il évacue la chaleur principalement par halètement, ce qui devient vite insuffisant en cas de forte température. Le coup de chaleur peut survenir en quelques minutes seulement et reste l'une des principales causes de mortalité estivale chez le chien.</p>

<h2>Pourquoi le chien y est si sensible</h2>
<p>La température corporelle normale du chien tourne autour de 38,5 °C. Au-delà de 40 °C, l'organisme se met en difficulté. À 42 °C, des lésions graves apparaissent dans les organes : foie, reins, cerveau, intestins. Le coup de chaleur n'est donc pas un simple coup de mou, c'est une urgence absolue.</p>
<p>Certains chiens sont particulièrement exposés :</p>
<ul>
<li>Races brachycéphales (Bouledogue, Carlin, Boxer, Cavalier King Charles) dont les voies respiratoires sont déjà étroites.</li>
<li>Chiens en surpoids ou peu sportifs.</li>
<li>Chiens âgés, chiots, chiens malades.</li>
<li>Chiens à pelage long ou très foncé.</li>
<li>Chiens à robe noire exposés au soleil.</li>
</ul>
<p>Mais aucun chien n'est à l'abri, même un Husky en pleine forme peut faire un coup de chaleur dans une voiture stationnée au soleil.</p>

<h2>Les situations à risque</h2>
<p>Le coup de chaleur n'arrive pas seulement les jours de canicule. Plusieurs contextes le favorisent :</p>
<ul>
<li>Chien laissé dans une voiture, même quelques minutes, même à l'ombre, même vitres entrouvertes. La température y grimpe extrêmement vite.</li>
<li>Promenade en plein milieu de journée par temps chaud.</li>
<li>Course derrière un vélo ou un cheval sans pause ni eau.</li>
<li>Chien enfermé dans une véranda, un grenier, un cabanon.</li>
<li>Trajet en cage ou en caisse de transport mal ventilée.</li>
<li>Effort intense par temps lourd et humide.</li>
</ul>

<h2>Reconnaître les signes</h2>
<p>Les premiers signes apparaissent souvent en silence. Apprenez à les repérer avant que la situation ne s'aggrave :</p>
<ul>
<li>Halètement très intense, langue pendante, salivation excessive.</li>
<li>Gencives rouge vif, voire violacées.</li>
<li>Démarche titubante, désorientation.</li>
<li>Refus de bouger, ou au contraire agitation inhabituelle.</li>
<li>Vomissements, diarrhée parfois sanglante.</li>
<li>Tremblements, faiblesse.</li>
<li>Perte de connaissance dans les formes graves.</li>
</ul>
<p>À ce stade, chaque minute compte. La survie dépend de la rapidité du refroidissement et de la prise en charge vétérinaire.</p>

<h2>Les bons gestes immédiats</h2>
<p>Si vous suspectez un coup de chaleur, agissez sans attendre. L'objectif est de faire baisser la température du chien progressivement, puis de l'amener chez le vétérinaire le plus vite possible.</p>
<ul>
<li>Mettre le chien à l'ombre, dans un endroit aéré.</li>
<li>Mouiller son corps avec de l'eau fraîche (pas glacée) : pattes, ventre, intérieur des cuisses, cou.</li>
<li>Utiliser un ventilateur ou créer un courant d'air.</li>
<li>Lui proposer à boire s'il est conscient, en petites quantités, sans le forcer.</li>
<li>Prendre sa température si possible, et appeler le vétérinaire en chemin.</li>
</ul>
<p>Évitez les chocs thermiques brutaux : pas de glaçons sur le corps, pas de bain dans l'eau glacée. Un refroidissement trop rapide peut provoquer une vasoconstriction qui aggrave la situation.</p>
<p>Même si votre chien semble aller mieux, consultez. Les complications (insuffisance rénale, troubles de la coagulation, œdème cérébral) peuvent apparaître plusieurs heures après l'incident.</p>

<h2>Prévenir au quotidien</h2>
<p>La prévention est simple, mais elle demande de la discipline en été :</p>
<ul>
<li>Sortir tôt le matin et tard le soir, jamais entre 11 h et 18 h par forte chaleur.</li>
<li>Toujours avoir de l'eau fraîche disponible, à l'extérieur comme à l'intérieur.</li>
<li>Ne jamais laisser le chien dans une voiture, même brièvement.</li>
<li>Vérifier la température du goudron avec le dos de la main : s'il vous brûle, il brûle aussi les coussinets.</li>
<li>Prévoir un tapis rafraîchissant ou une serviette mouillée à la maison.</li>
<li>Adapter l'activité physique aux conditions du jour.</li>
</ul>

<p>Un coup de chaleur évolue parfois en quelques minutes, et il n'existe aucun traitement maison qui remplace une consultation. En cas de doute pendant l'été, contactez votre vétérinaire sans attendre : mieux vaut un appel inutile qu'un retard de prise en charge.</p>
`
  }
]
