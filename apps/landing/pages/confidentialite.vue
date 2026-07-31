<template>
  <div class="bg-hero pt-28 pb-20 sm:pt-32 lg:pt-36">
    <article class="container-custom max-w-3xl">
      <p class="text-sm font-semibold text-primary-600 mb-3">Légal</p>
      <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-3">
        Politique de confidentialité
      </h1>
      <p class="text-sm text-gray-500 mb-2">
        Applicable à l'application mobile <strong class="text-gray-700">Ficabot</strong> (Android — <code>com.ficabot.fr</code>) et au site ficana.com.
      </p>
      <p class="text-sm text-gray-500 mb-10">
        Dernière mise à jour : <span class="font-medium text-gray-700">[À COMPLÉTER : date de mise en ligne]</span>
      </p>

      <nav class="card mb-10">
        <p class="text-sm font-semibold text-gray-900 mb-3">Sommaire</p>
        <ol class="space-y-1.5 text-sm text-gray-700 list-decimal list-inside marker:text-primary-600">
          <li><a href="#responsable" class="hover:text-primary-700">Qui est responsable de vos données</a></li>
          <li><a href="#donnees" class="hover:text-primary-700">Données que nous collectons</a></li>
          <li><a href="#permissions" class="hover:text-primary-700">Permissions de l'application</a></li>
          <li><a href="#finalites" class="hover:text-primary-700">Pourquoi nous les utilisons</a></li>
          <li><a href="#ia" class="hover:text-primary-700">Utilisation de l'intelligence artificielle</a></li>
          <li><a href="#partage" class="hover:text-primary-700">Partage des données</a></li>
          <li><a href="#conservation" class="hover:text-primary-700">Durée de conservation</a></li>
          <li><a href="#suppression" class="hover:text-primary-700">Supprimer votre compte et vos données</a></li>
          <li><a href="#securite" class="hover:text-primary-700">Sécurité</a></li>
          <li><a href="#droits" class="hover:text-primary-700">Vos droits (RGPD)</a></li>
          <li><a href="#enfants" class="hover:text-primary-700">Enfants</a></li>
          <li><a href="#modifications" class="hover:text-primary-700">Modifications</a></li>
          <li><a href="#contact" class="hover:text-primary-700">Contact</a></li>
        </ol>
      </nav>

      <div class="prose-doc">
        <p>
          Ficabot est un carnet de santé numérique pour animaux de compagnie. Cette politique explique quelles données personnelles nous collectons, pourquoi, avec qui elles sont partagées, et comment vous en gardez le contrôle. Nous ne vendons aucune donnée et n'affichons aucune publicité.
        </p>

        <section id="responsable">
          <h2>1. Qui est responsable de vos données</h2>
          <ul>
            <li><strong>Responsable du traitement :</strong> [À COMPLÉTER : raison sociale]</li>
            <li><strong>Adresse :</strong> [À COMPLÉTER : adresse du siège social]</li>
            <li><strong>Email de contact :</strong> <a href="mailto:contact@ficana.com" class="text-primary-700 hover:underline">contact@ficana.com</a></li>
            <li><strong>Délégué à la protection des données (DPO) :</strong> [À COMPLÉTER : nom et email, ou « non désigné »]</li>
          </ul>
        </section>

        <section id="donnees">
          <h2>2. Données que nous collectons</h2>

          <h3>Données de compte</h3>
          <ul>
            <li>Adresse email, mot de passe (stocké sous forme de empreinte chiffrée, jamais en clair).</li>
            <li>Prénom, nom, photo de profil, numéro de téléphone et langue, si vous les renseignez.</li>
            <li>Identifiant Google, si vous choisissez de vous connecter avec Google.</li>
          </ul>

          <h3>Données relatives à vos animaux</h3>
          <ul>
            <li>Nom, espèce, race, sexe, date de naissance, poids et photos de l'animal.</li>
            <li>Carnet de santé : vaccins, traitements, documents médicaux, rendez-vous vétérinaires.</li>
            <li>Suivi quotidien : symptômes, repas, activités, poids, dépenses, rappels, listes de courses.</li>
            <li>Conversations avec l'assistant et pré-diagnostics générés dans l'application.</li>
          </ul>

          <h3>Localisation</h3>
          <ul>
            <li>Ville saisie à l'inscription, et/ou position approximative ou précise de l'appareil si vous l'autorisez.</li>
            <li>Utilisée uniquement pour afficher la météo locale et adapter les conseils. Aucun suivi en arrière-plan : la position n'est jamais collectée lorsque l'application est fermée.</li>
          </ul>

          <h3>Données techniques</h3>
          <ul>
            <li>Adresse IP, type d'appareil et journaux de connexion, à des fins de sécurité et de diagnostic.</li>
            <li>Jeton de notification push, si vous acceptez les notifications.</li>
          </ul>

          <h3>Ce que nous ne collectons pas</h3>
          <ul>
            <li>Aucune donnée de paiement : Ficabot n'enregistre ni carte bancaire ni coordonnées bancaires. Les éventuels achats passent par Google Play, qui gère seul la transaction.</li>
            <li>Aucun SDK publicitaire, aucun traceur tiers à des fins marketing, aucune revente de données.</li>
            <li>Aucun accès à vos contacts, à vos SMS ni à l'ensemble de votre galerie : seules les photos que vous sélectionnez explicitement sont importées.</li>
          </ul>
        </section>

        <section id="permissions">
          <h2>3. Permissions de l'application</h2>
          <ul>
            <li><strong>Localisation (approximative et précise) :</strong> pour obtenir la météo de votre position et adapter les conseils de sortie, d'hydratation ou de prévention. Facultative : vous pouvez la refuser et saisir une ville manuellement.</li>
            <li><strong>Photos / stockage :</strong> pour choisir une photo de votre animal ou joindre un document à son carnet de santé. Seuls les fichiers que vous sélectionnez sont lus.</li>
            <li><strong>Notifications :</strong> pour vous envoyer les rappels que vous avez vous-même programmés (vaccins, rendez-vous, traitements). Facultative et révocable à tout moment.</li>
          </ul>
          <p>
            Toutes ces permissions peuvent être retirées à tout moment dans les réglages Android, sans perdre l'accès au reste de l'application.
          </p>
        </section>

        <section id="finalites">
          <h2>4. Pourquoi nous les utilisons</h2>
          <ul>
            <li><strong>Fournir le service :</strong> créer et gérer votre compte, tenir le carnet de santé de vos animaux, synchroniser vos données entre vos appareils. <em>Base légale : exécution du contrat.</em></li>
            <li><strong>Personnaliser les conseils :</strong> adapter les recommandations au profil de votre animal et à la météo locale. <em>Base légale : exécution du contrat et, pour la géolocalisation, votre consentement.</em></li>
            <li><strong>Vous envoyer des rappels :</strong> notifications et emails liés à la santé de votre animal. <em>Base légale : votre consentement.</em></li>
            <li><strong>Sécuriser la plateforme :</strong> prévenir les accès frauduleux et les abus. <em>Base légale : intérêt légitime.</em></li>
            <li><strong>Répondre à nos obligations :</strong> comptabilité, demandes des autorités. <em>Base légale : obligation légale.</em></li>
          </ul>
        </section>

        <section id="ia">
          <h2>5. Utilisation de l'intelligence artificielle</h2>
          <p>
            L'assistant conversationnel et la fonction de pré-diagnostic s'appuient sur des modèles d'intelligence artificielle fournis par <strong>Anthropic</strong>, <strong>OpenAI</strong> et <strong>Google</strong>. Lorsque vous posez une question, le contenu de votre message et les informations pertinentes sur votre animal (espèce, âge, poids, symptômes décrits) sont transmis à ces prestataires pour produire une réponse.
          </p>
          <ul>
            <li>Ces échanges se font via leurs interfaces professionnelles, qui n'utilisent pas vos contenus pour entraîner leurs modèles.</li>
            <li>Votre nom, votre email et vos coordonnées ne leur sont pas transmis.</li>
            <li>Ces prestataires sont établis aux États-Unis : le transfert est encadré par les clauses contractuelles types de la Commission européenne.</li>
          </ul>
          <p>
            <strong>Important :</strong> les réponses de l'assistant sont une aide à l'information et ne constituent en aucun cas un diagnostic ou une prescription vétérinaire. Elles ne remplacent pas la consultation d'un vétérinaire.
          </p>
        </section>

        <section id="partage">
          <h2>6. Partage des données</h2>
          <p>Vos données ne sont accessibles qu'à vous, et transmises uniquement aux prestataires techniques strictement nécessaires au fonctionnement du service :</p>
          <ul>
            <li><strong>Render</strong> — hébergement du serveur et de la base de données, région Francfort (Union européenne).</li>
            <li><strong>Anthropic, OpenAI, Google</strong> — génération des réponses de l'assistant (voir section 5).</li>
            <li><strong>WeatherAPI et Open-Meteo</strong> — prévisions météo. Seules des coordonnées géographiques leur sont transmises, sans aucun identifiant vous concernant.</li>
            <li><strong>Resend</strong> — envoi des emails transactionnels (vérification de compte, réinitialisation de mot de passe).</li>
            <li><strong>Expo</strong> — acheminement des notifications push.</li>
            <li><strong>Google Play</strong> — distribution de l'application et gestion des éventuels achats.</li>
          </ul>
          <p>
            Si vous choisissez de partager le carnet de santé d'un animal avec un vétérinaire ou un proche, les données concernées ne deviennent accessibles qu'aux personnes à qui vous transmettez le lien de partage. Vous pouvez révoquer ce partage à tout moment depuis l'application.
          </p>
          <p>
            Nous ne vendons, ne louons et n'échangeons aucune donnée personnelle. Nous pouvons être amenés à divulguer des données si la loi nous y oblige ou pour défendre nos droits en justice.
          </p>
        </section>

        <section id="conservation">
          <h2>7. Durée de conservation</h2>
          <ul>
            <li><strong>Compte et données des animaux :</strong> conservés tant que votre compte est actif, puis supprimés [À COMPLÉTER : délai, ex. 3 ans] après votre dernière connexion.</li>
            <li><strong>Journaux techniques :</strong> [À COMPLÉTER : durée, ex. 12 mois].</li>
            <li><strong>Documents comptables :</strong> 10 ans, conformément au Code de commerce.</li>
          </ul>
        </section>

        <section id="suppression">
          <h2>8. Supprimer votre compte et vos données</h2>
          <p>Vous pouvez supprimer votre compte à tout moment, de deux façons :</p>
          <ul>
            <li><strong>Depuis l'application :</strong> onglet Profil → Supprimer mon compte, en bas du menu.</li>
            <li><strong>Par email :</strong> envoyez une demande à <a href="mailto:contact@ficana.com" class="text-primary-700 hover:underline">contact@ficana.com</a> depuis l'adresse associée à votre compte.</li>
          </ul>
          <p>
            La suppression du compte entraîne l'effacement définitif de votre profil, des fiches de vos animaux, de leurs photos, de leur carnet de santé et de l'historique de vos conversations. L'opération est irréversible et prend effet sous 30 jours au plus tard, sauf pour les données que la loi nous oblige à conserver (documents comptables). Les sauvegardes chiffrées sont purgées dans un délai maximal de [À COMPLÉTER : durée, ex. 30 jours].
          </p>
          <p>
            Le détail de la procédure figure sur notre page dédiée :
            <NuxtLink to="/suppression-compte" class="text-primary-700 hover:underline">supprimer votre compte et vos données</NuxtLink>.
          </p>
        </section>

        <section id="securite">
          <h2>9. Sécurité</h2>
          <ul>
            <li>Toutes les communications entre l'application et nos serveurs sont chiffrées (HTTPS/TLS).</li>
            <li>Les mots de passe sont stockés sous forme d'empreintes cryptographiques (scrypt) et ne sont jamais lisibles, y compris par nous.</li>
            <li>Le jeton de connexion est conservé sur votre appareil dans l'espace sécurisé du système (Android Keystore).</li>
            <li>L'accès aux données de production est restreint aux personnes qui en ont strictement besoin.</li>
          </ul>
          <p>
            Aucun système n'est infaillible : en cas de violation de données susceptible d'engendrer un risque pour vos droits, nous vous informerons et notifierons la CNIL dans les 72 heures, conformément au RGPD.
          </p>
        </section>

        <section id="droits">
          <h2>10. Vos droits (RGPD)</h2>
          <ul>
            <li><strong>Accès :</strong> obtenir une copie des données que nous détenons sur vous.</li>
            <li><strong>Rectification :</strong> corriger des informations inexactes.</li>
            <li><strong>Effacement :</strong> demander la suppression de vos données.</li>
            <li><strong>Limitation :</strong> restreindre certains traitements.</li>
            <li><strong>Portabilité :</strong> récupérer vos données dans un format structuré et lisible.</li>
            <li><strong>Opposition :</strong> vous opposer à un traitement fondé sur notre intérêt légitime.</li>
            <li><strong>Retrait du consentement :</strong> à tout moment, sans effet sur les traitements déjà réalisés.</li>
          </ul>
          <p>
            Pour exercer ces droits, écrivez à <a href="mailto:contact@ficana.com" class="text-primary-700 hover:underline">contact@ficana.com</a>. Nous répondons sous 30 jours. Si vous estimez que vos droits ne sont pas respectés, vous pouvez saisir la <a href="https://www.cnil.fr" target="_blank" rel="noopener" class="text-primary-700 hover:underline">CNIL</a>.
          </p>
        </section>

        <section id="enfants">
          <h2>11. Enfants</h2>
          <p>
            Ficabot n'est pas destiné aux personnes de moins de 15 ans et nous ne collectons pas sciemment leurs données. Si vous êtes parent ou tuteur et pensez qu'un enfant nous a transmis des informations personnelles, écrivez-nous : nous les supprimerons sans délai.
          </p>
        </section>

        <section id="modifications">
          <h2>12. Modifications</h2>
          <p>
            Cette politique peut être mise à jour pour refléter des évolutions du service ou de la réglementation. La date de dernière mise à jour figure en haut de page. En cas de changement significatif, vous serez informé dans l'application ou par email avant son entrée en vigueur.
          </p>
        </section>

        <section id="contact">
          <h2>13. Contact</h2>
          <p>
            Pour toute question relative à cette politique ou à vos données personnelles :
          </p>
          <ul>
            <li><strong>Email :</strong> <a href="mailto:contact@ficana.com" class="text-primary-700 hover:underline">contact@ficana.com</a></li>
            <li><strong>Courrier :</strong> [À COMPLÉTER : adresse postale]</li>
          </ul>
          <p>
            Voir aussi nos <NuxtLink to="/mentions-legales" class="text-primary-700 hover:underline">mentions légales</NuxtLink> et nos <NuxtLink to="/cgv" class="text-primary-700 hover:underline">CGU &amp; CGV</NuxtLink>.
          </p>
        </section>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Politique de confidentialité — Ficabot',
  meta: [
    {
      name: 'description',
      content:
        "Politique de confidentialité de l'application Ficabot : données collectées, permissions, partage, conservation et suppression de compte.",
    },
  ],
})
</script>

<style scoped>
.prose-doc :deep(h2) {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1A1614;
  margin-top: 2.5rem;
  margin-bottom: 1rem;
  letter-spacing: -0.01em;
  scroll-margin-top: 6rem;
}
.prose-doc :deep(h3) {
  font-size: 1rem;
  font-weight: 600;
  color: #1A1614;
  margin-top: 1.75rem;
  margin-bottom: 0.5rem;
}
.prose-doc :deep(p) {
  font-size: 0.95rem;
  line-height: 1.75;
  color: #4D4038;
  margin-bottom: 1rem;
}
.prose-doc :deep(ul) {
  list-style: disc;
  padding-left: 1.5rem;
  margin-bottom: 1rem;
}
.prose-doc :deep(ul li) {
  font-size: 0.95rem;
  line-height: 1.75;
  color: #4D4038;
  margin-bottom: 0.25rem;
}
.prose-doc :deep(strong) {
  color: #1A1614;
  font-weight: 600;
}
.prose-doc :deep(code) {
  font-size: 0.875rem;
}
</style>
