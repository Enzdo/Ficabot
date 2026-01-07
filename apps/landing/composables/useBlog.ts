export const useBlog = () => {
  const posts = [
    // ARTICLES POUR PROFESSIONNELS (Vétérinaires)
    {
      slug: 'reduire-absenteisme-cabinet-veterinaire',
      title: 'Comment réduire de 30% l\'absentéisme dans votre cabinet vétérinaire ?',
      excerpt: 'Les "no-shows" impactent directement votre chiffre d\'affaires. Découvrez les stratégies digitales éprouvées pour diviser par deux les rendez-vous non honorés.',
      category: 'Gestion de cabinet',
      target: 'pro',
      author: 'Dr. Sophie Martin',
      date: '5 Jan 2026',
      readTime: '6 min',
      image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=2068&q=80',
      content: `
        <p class="lead">L'absentéisme des clients (ou "no-show") est l'un des fléaux majeurs des cliniques vétérinaires modernes. Au-delà de la perte financière sèche, c'est toute l'organisation de l'équipe soignante qui en pâtit. Pourtant, des solutions simples existent.</p>

        <h2>L'impact caché des rendez-vous manqués</h2>
        <p>Un rendez-vous non honoré n'est pas seulement un créneau vide. C'est un temps de préparation perdu pour vos ASV, une désorganisation du flux de travail et, souvent, une opportunité manquée pour un autre animal nécessitant des soins urgents. En moyenne, une clinique sans système de rappel automatique enregistre un taux d'absentéisme compris entre 10% et 15%.</p>

        <h2>La solution n°1 : Le rappel automatisé multicanal</h2>
        <p>La mémoire de vos clients est faillible, pas celle de vos serveurs. L'automatisation est la clé. Une stratégie efficace repose sur la règle du "J-7 / J-1" :</p>
        <ul>
          <li><strong>À J-7 (Email) :</strong> Un rappel informatif avec les consignes pré-consultation (ex: mise à jeun).</li>
          <li><strong>À J-1 (SMS) :</strong> Un rappel court et percutant directement dans la poche du client. Le taux de lecture des SMS dépasse les 95% dans les 3 minutes suivant la réception.</li>
        </ul>
        <p>Avec <strong>Ficabot Pro</strong>, ces scénarios sont pré-configurés. Nos cliniques partenaires constatent une chute de l'absentéisme sous la barre des 5% dès le premier mois.</p>

        <h2>Faciliter l'annulation et la replanification</h2>
        <p>Paradoxalement, faciliter l'annulation réduit l'absentéisme. Si un client peut annuler en un clic via son application ou un lien SMS, il libère le créneau instantanément, le rendant disponible pour une urgence ou une liste d'attente. C'est le principe de la "flexibilité responsable".</p>

        <h2>L'éducation client via le carnet de santé digital</h2>
        <p>Un client engagé est un client présent. En utilisant un carnet de santé numérique partagé comme Ficabot, le propriétaire reçoit des notifications contextuelles ("Max doit faire son rappel de vaccin dans 2 semaines"). Il ne subit plus le rendez-vous comme une contrainte administrative, mais le comprend comme une étape nécessaire du parcours de soin de son animal.</p>

        <div class="bg-primary-50 p-6 rounded-xl border-l-4 border-primary-500 my-8">
          <h3 class="text-primary-800 font-bold mb-2">Le conseil de l'expert</h3>
          <p class="text-primary-700 m-0">N'hésitez pas à afficher votre politique d'annulation en salle d'attente et sur votre site web. La transparence renforce le respect mutuel entre le praticien et le propriétaire.</p>
        </div>
      `
    },
    {
      slug: 'digitalisation-clinique-veterinaire-2026',
      title: 'Digitalisation vétérinaire : Pourquoi vous ne pouvez plus attendre',
      excerpt: 'Agenda en ligne, dossier cloud, communication asynchrone... La digitalisation n\'est plus une option mais une attente fondamentale de votre patientèle en 2026.',
      category: 'Technologie',
      target: 'pro',
      author: 'Dr. Marc Dubois',
      date: '12 Jan 2026',
      readTime: '5 min',
      image: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      content: `
        <p class="lead">Le secteur vétérinaire vit sa révolution numérique. Ce qui était considéré comme "futuriste" il y a 5 ans est aujourd'hui le standard attendu par les propriétaires d'animaux, majoritairement habitués aux services type Doctolib ou Uber.</p>

        <h2>1. L'attente d'instantanéité</h2>
        <p>Vos clients ne veulent plus attendre l'ouverture du standard à 8h30 pour prendre rendez-vous. Ils consultent l'état de santé de leur animal le soir, le week-end. Offrir la prise de rendez-vous en ligne 24/7, c'est capter cette demande au moment où elle s'exprime.</p>

        <h2>2. La fin du dossier papier</h2>
        <p>Le dossier médical papier est une relique. Il est difficilement partageable (avec des confrères ou des spécialistes), fragile et encombrant. Le dossier cloud sécurisé permet :</p>
        <ul>
          <li>Un accès instantané à l'historique complet, où que vous soyez dans la clinique.</li>
          <li>Une sauvegarde automatique et sécurisée (RGPD).</li>
          <li>Un partage sélectif avec le propriétaire pour le rassurer et l'impliquer.</li>
        </ul>

        <h2>3. La communication asynchrone pour gagner du temps</h2>
        <p>Le téléphone est un "voleur de temps". Il interrompt vos consultations et stresse vos équipes. Une messagerie sécurisée dédiée, comme celle intégrée à Ficabot Pro, permet de traiter les demandes non urgentes (demande de renouvellement, question post-opératoire simple) entre deux consultations, calmement et efficacement.</p>

        <h2>Conclusion</h2>
        <p>Digitaliser n'est pas déshumaniser. Au contraire, en automatisant les tâches à faible valeur ajoutée, vous libérez du temps de cerveau et de cœur pour ce qui compte vraiment : le soin de l'animal et l'écoute du propriétaire.</p>
      `
    },
    {
      slug: 'fidelisation-client-veterinaire',
      title: 'Au-delà du soin : comment fidéliser votre clientèle durablement ?',
      excerpt: 'La compétence médicale ne suffit plus. Découvrez comment construire une "expérience client" mémorable qui transformera vos patients en ambassadeurs.',
      category: 'Marketing',
      target: 'pro',
      author: 'Julie Blanc (ASV)',
      date: '18 Jan 2026',
      readTime: '4 min',
      image: 'https://images.unsplash.com/photo-1599443015574-be5fe8a05783?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      content: `
        <p class="lead">Dans un contexte de concurrence accrue et de "corporatisation" des cliniques, l'indépendant doit jouer sur ses forces : la proximité et la relation humaine augmentée.</p>

        <h2>L'expérience "Avant / Pendant / Après"</h2>
        <p>La consultation ne se limite pas aux 20 minutes passées dans votre salle d'examen.</p>
        <ul>
          <li><strong>Avant :</strong> Facilité de réservation, rappels rassurants.</li>
          <li><strong>Pendant :</strong> Écoute active, manipulation douce (Fear Free), pédagogie.</li>
          <li><strong>Après :</strong> C'est souvent là que le bât blesse. Un simple message "Comment va Luna ce matin ?" envoyé automatiquement le lendemain d'une chirurgie a un impact émotionnel immense.</li>
        </ul>

        <h2>Le rôle du digital dans l'émotionnel</h2>
        <p>Cela peut sembler contradictoire, mais le digital permet de renforcer l'émotionnel. Envoyer une notification d'anniversaire pour l'animal, partager une courbe de poids encourageante, féliciter pour une bonne observance du traitement... Ces "micro-interactions" via une application comme Ficabot tissent un lien quotidien, bien plus fort qu'une visite annuelle.</p>
      `
    },

    // ARTICLES POUR PARTICULIERS (Propriétaires)
    {
      slug: 'calendrier-vaccination-chien-chat',
      title: 'Vaccination : Le guide complet pour protéger votre compagnon',
      excerpt: 'Maladies de Carré, Parvovirose, Leucose... Quels sont les vaccins obligatoires et recommandés ? On vous explique tout pour ne jamais rater un rappel.',
      category: 'Santé',
      target: 'owner',
      author: 'Dr. Thomas Bernard',
      date: '8 Jan 2026',
      readTime: '7 min',
      image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      content: `
        <p class="lead">La vaccination est l'acte de prévention le plus important pour la santé de votre animal. Elle le protège contre des maladies graves, souvent mortelles, et parfois transmissibles à l'homme (zoonoses).</p>

        <h2>Les vaccins essentiels chez le Chien</h2>
        <p>On parle souvent du vaccin "CHPPiL". Voici ce qu'il signifie :</p>
        <ul>
          <li><strong>C (Carré) :</strong> Maladie virale très contagieuse et souvent mortelle.</li>
          <li><strong>H (Hépatite de Rubarth) :</strong> Atteinte grave du foie.</li>
          <li><strong>P (Parvovirose) :</strong> Gastro-entérite hémorragique foudroyante, surtout chez le chiot.</li>
          <li><strong>Pi (Parainfluenza) :</strong> Une des causes de la toux du chenil.</li>
          <li><strong>L (Leptospirose) :</strong> Maladie bactérienne grave transmissible à l'homme par l'urine.</li>
        </ul>
        <p>Le vaccin contre la <strong>Rage</strong> est obligatoire pour voyager à l'étranger et pour les chiens de catégorie.</p>

        <h2>Et pour le Chat ?</h2>
        <p>Même un chat d'appartement doit être vacciné ! Le Typhus (virus très résistant transportable sous vos chaussures) et le Coryza (grippe du chat) sont les incontournables. Pour les chats sortants, la Leucose (FeLV) est indispensable car elle se transmet par bagarre ou contact.</p>

        <h2>Pourquoi faire des rappels ?</h2>
        <p>L'immunité n'est pas éternelle. Comme pour nous, elle diminue avec le temps. Le premier rappel annuel est CRUCIAL. Ensuite, selon le mode de vie de votre animal et le type de vaccin, votre vétérinaire adaptera le protocole (tous les ans ou tous les 3 ans).</p>

        <div class="bg-green-50 p-6 rounded-xl border-l-4 border-green-500 my-8">
          <h3 class="text-green-800 font-bold mb-2">L'astuce Ficabot</h3>
          <p class="text-green-700 m-0">Ne notez plus les dates sur un post-it ! Enregistrez les vaccins de votre animal dans l'application Ficabot. Nous calculons automatiquement la date du prochain rappel et vous notifions 1 mois avant, puis 1 semaine avant.</p>
        </div>
      `
    },
    {
      slug: 'comprendre-langage-chat',
      title: 'Il remue la queue, il est heureux ? Décrypter le langage secret de votre chat',
      excerpt: 'Les chats ne communiquent pas comme les chiens. Apprenez à lire les signaux subtils de votre félin pour renforcer votre complicité.',
      category: 'Comportement',
      target: 'owner',
      author: 'Sophie L., Comportementaliste',
      date: '15 Jan 2026',
      readTime: '5 min',
      image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      content: `
        <p class="lead">On dit souvent que les chats sont mystérieux. En réalité, ils sont très bavards... mais ils parlent avec leur corps ! Contrairement au chien, un chat qui remue la queue n'est pas forcément content.</p>

        <h2>La queue : le baromètre de l'humeur</h2>
        <ul>
          <li><strong>Dressée vers le haut :</strong> "Bonjour ! Je suis content de te voir." C'est un signe amical.</li>
          <li><strong>Qui fouette l'air sèchement :</strong> "Attention, je suis agacé." Arrêtez immédiatement de le caresser.</li>
          <li><strong>Hérissée (comme un goupillon) :</strong> "J'ai peur !" Il tente de se grossir face à une menace.</li>
        </ul>

        <h2>Les oreilles et les yeux</h2>
        <p>Des oreilles tournées vers l'avant indiquent de la curiosité. Plaquées en arrière ("oreilles d'avion"), elles signent la peur ou l'agression imminente.</p>
        <p>Le <strong>clignement lent des yeux</strong> est l'équivalent félin d'un bisou. Si votre chat vous regarde et ferme doucement les yeux, il vous dit "Je t'aime et je te fais confiance". Essayez de lui répondre de la même manière !</p>

        <h2>Le ronronnement n'est pas toujours synonyme de joie</h2>
        <p>Si le ronronnement exprime souvent le bien-être, il peut aussi servir à s'apaiser soi-même en cas de douleur ou de stress intense. Un chat blessé peut ronronner. Observez toujours le contexte global.</p>
      `
    },
    {
      slug: 'carnet-sante-numerique-avantages',
      title: '3 raisons de passer au carnet de santé numérique pour votre animal',
      excerpt: 'Perte du carnet papier, urgence vétérinaire en vacances, suivi du poids... Découvrez pourquoi le format digital est plus sûr pour votre compagnon.',
      category: 'Pratique',
      target: 'owner',
      author: 'L\'équipe Ficabot',
      date: '20 Jan 2026',
      readTime: '3 min',
      image: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      content: `
        <p class="lead">Le carnet de santé papier est fragile. Il se perd, s'abîme, ou pire, on l'oublie le jour où on en a le plus besoin (en week-end ou en vacances). Passer au numérique, c'est sécuriser la vie de votre animal.</p>

        <h2>1. Vos données accessibles partout, tout le temps</h2>
        <p>Imaginez : vous êtes en vacances dans le Sud et votre chien se blesse. Vous devez consulter un vétérinaire d'urgence qui ne connaît pas son historique. Avec Ficabot, vous sortez votre smartphone et vous avez accès instantanément :</p>
        <ul>
          <li>À son numéro de puce (I-CAD).</li>
          <li>À ses derniers vaccins (sont-ils à jour pour la pension ?).</li>
          <li>À ses antécédents médicaux et allergies (très important pour éviter une erreur médicamenteuse).</li>
        </ul>

        <h2>2. Un suivi de santé proactif</h2>
        <p>Un carnet papier est passif. Il dort dans un tiroir. Un carnet numérique est actif : il vous rappelle les vermifuges, il trace la courbe de poids de votre chat pour détecter une obésité débutante, il vous alerte d'une anomalie. C'est un véritable assistant personnel.</p>

        <h2>3. Centraliser toute la "tribu"</h2>
        <p>Chien, chat, lapin... Avoir 3 carnets différents, c'est l'enfer administratif. Ficabot permet de créer un profil pour chaque animal de la maison au sein de la même interface. Vous visualisez la santé de toute la famille en un coup d'œil.</p>
      `
    }
  ]

  const getPostBySlug = (slug: string) => {
    return posts.find(p => p.slug === slug)
  }

  const getPostsByTarget = (target: 'pro' | 'owner') => {
    return posts.filter(p => p.target === target)
  }

  return {
    posts,
    getPostBySlug,
    getPostsByTarget
  }
}
