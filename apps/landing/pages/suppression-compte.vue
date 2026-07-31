<template>
  <div class="bg-hero pt-28 pb-20 sm:pt-32 lg:pt-36">
    <article class="container-custom max-w-3xl">
      <p class="text-sm font-semibold text-primary-600 mb-3">Votre compte</p>
      <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-3">
        Supprimer votre compte et vos données
      </h1>
      <p class="text-sm text-gray-500 mb-10">
        Application <strong class="text-gray-700">Ficabot</strong> — éditée par [À COMPLÉTER : raison sociale]
      </p>

      <div class="prose-doc">
        <p>
          Vous pouvez supprimer votre compte Ficabot à tout moment, et avec lui l'ensemble des données associées à vous et à vos animaux. Aucune justification ne vous sera demandée. Deux méthodes sont possibles.
        </p>

        <section id="methode-app">
          <h2>Méthode 1 — Depuis l'application (immédiat)</h2>
          <ol class="steps">
            <li>Ouvrez l'application Ficabot et connectez-vous.</li>
            <li>Rendez-vous dans l'onglet <strong>Profil</strong>.</li>
            <li>Tout en bas du menu, appuyez sur <strong>Supprimer mon compte</strong>.</li>
            <li>Confirmez la suppression dans la fenêtre qui s'affiche.</li>
          </ol>
          <p>
            La suppression est effective immédiatement. Vous êtes déconnecté et le compte ne peut plus être utilisé pour se connecter.
          </p>
        </section>

        <section id="methode-email">
          <h2>Méthode 2 — Par email</h2>
          <p>
            Si vous n'avez plus accès à l'application ou à votre appareil, écrivez à
            <a href="mailto:contact@ficana.com?subject=Demande%20de%20suppression%20de%20compte%20Ficabot" class="text-primary-700 hover:underline">contact@ficana.com</a>
            avec pour objet « Demande de suppression de compte ».
          </p>
          <p>
            <strong>Envoyez votre message depuis l'adresse email associée à votre compte</strong> : c'est ce qui nous permet de vérifier que la demande vient bien de vous. Si ce n'est pas possible, indiquez l'adresse email du compte concerné, nous vous contacterons pour confirmer votre identité avant toute suppression.
          </p>
          <p>
            Votre demande est traitée sous 30 jours au maximum, conformément au RGPD. Nous vous confirmons la suppression par email.
          </p>
        </section>

        <section id="donnees-supprimees">
          <h2>Données supprimées</h2>
          <p>La suppression du compte efface définitivement :</p>
          <ul>
            <li>Votre profil : nom, prénom, adresse email, téléphone, photo de profil, ville et position enregistrée.</li>
            <li>Les fiches de tous vos animaux : nom, espèce, race, date de naissance, poids et photos.</li>
            <li>Leur carnet de santé complet : vaccins, traitements, documents médicaux, rendez-vous vétérinaires.</li>
            <li>Le suivi quotidien : symptômes, repas, activités, historique de poids, dépenses, rappels et listes de courses.</li>
            <li>L'historique de vos conversations avec l'assistant et les pré-diagnostics générés.</li>
            <li>Les liens de partage que vous aviez créés : ils cessent immédiatement de fonctionner.</li>
          </ul>
          <p>
            <strong>Cette opération est irréversible.</strong> Nous ne pouvons pas restaurer un compte supprimé, ni les données qu'il contenait. Si vous souhaitez conserver le carnet de santé de vos animaux, exportez-le ou demandez-nous une copie de vos données <em>avant</em> de lancer la suppression.
          </p>
        </section>

        <section id="donnees-conservees">
          <h2>Données conservées après suppression</h2>
          <ul>
            <li><strong>Documents comptables</strong> (le cas échéant) : conservés 10 ans, comme l'impose le Code de commerce. Ils ne contiennent aucune donnée relative à vos animaux.</li>
            <li><strong>Sauvegardes chiffrées</strong> : nos sauvegardes sont purgées par rotation, sous [À COMPLÉTER : durée, ex. 30 jours] au maximum. Elles ne sont restaurées qu'en cas d'incident technique majeur.</li>
            <li><strong>Journaux techniques anonymisés</strong> : conservés à des fins de sécurité, sans lien avec votre identité.</li>
          </ul>
        </section>

        <section id="autres-droits">
          <h2>Vous préférez une autre solution ?</h2>
          <p>
            La suppression du compte n'est pas la seule option. Vous pouvez aussi nous demander une copie de vos données, la correction d'une information inexacte, ou la suppression d'un seul animal sans toucher au reste de votre compte. Écrivez-nous à
            <a href="mailto:contact@ficana.com" class="text-primary-700 hover:underline">contact@ficana.com</a>.
          </p>
          <p>
            Le détail de vos droits figure dans notre
            <NuxtLink to="/confidentialite" class="text-primary-700 hover:underline">politique de confidentialité</NuxtLink>.
          </p>
        </section>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Supprimer votre compte — Ficabot',
  meta: [
    {
      name: 'description',
      content:
        "Comment supprimer votre compte Ficabot et l'ensemble de vos données, depuis l'application ou par email.",
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
.prose-doc :deep(ol.steps) {
  list-style: decimal;
  padding-left: 1.5rem;
  margin-bottom: 1rem;
}
.prose-doc :deep(li) {
  font-size: 0.95rem;
  line-height: 1.75;
  color: #4D4038;
  margin-bottom: 0.25rem;
}
.prose-doc :deep(strong) {
  color: #1A1614;
  font-weight: 600;
}
</style>
