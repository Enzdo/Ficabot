<template>
  <div class="bg-hero pt-28 pb-20 sm:pt-32">
    <!-- Hero -->
    <section class="container-custom">
      <div class="max-w-2xl mb-12 lg:mb-16">
        <p class="text-sm font-semibold text-primary-600 mb-3">Contact</p>
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
          On vous répond dans la journée.
        </h1>
        <p class="text-base sm:text-lg text-gray-600">
          Une question sur l'app, un bug rencontré, ou simplement envie d'échanger — écrivez-nous, ou utilisez le formulaire ci-dessous.
        </p>
      </div>
    </section>

    <!-- Form + infos -->
    <section class="container-custom pb-20 lg:pb-28">
      <div class="grid lg:grid-cols-3 gap-6 lg:gap-8">
        <!-- Form -->
        <div class="card lg:col-span-2">
          <h2 class="text-xl font-bold text-gray-900 mb-6">Envoyez-nous un message</h2>

          <form @submit.prevent="submitForm" class="space-y-5">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nom complet *</label>
              <input
                v-model="form.name"
                type="text"
                required
                class="w-full px-4 py-3 border border-gray-200 rounded-mmd focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                placeholder="Marie Dupont"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <input
                v-model="form.email"
                type="email"
                required
                class="w-full px-4 py-3 border border-gray-200 rounded-mmd focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                placeholder="marie@exemple.fr"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Sujet *</label>
              <select
                v-model="form.subject"
                required
                class="w-full px-4 py-3 border border-gray-200 rounded-mmd focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
              >
                <option value="">Choisissez un sujet</option>
                <option value="info">Question sur l'app</option>
                <option value="bug">Signaler un bug</option>
                <option value="account">Gestion de mon compte</option>
                <option value="billing">Abonnement & facturation</option>
                <option value="other">Autre</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Message *</label>
              <textarea
                v-model="form.message"
                required
                rows="5"
                class="w-full px-4 py-3 border border-gray-200 rounded-mmd focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                placeholder="Décrivez votre demande..."
              ></textarea>
            </div>

            <div class="flex items-start gap-3">
              <input
                v-model="form.consent"
                type="checkbox"
                required
                class="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label class="text-sm text-gray-600">
                J'accepte que mes informations soient traitées conformément à la
                <NuxtLink to="/mentions-legales" class="text-primary-700 hover:underline">politique de confidentialité</NuxtLink>. *
              </label>
            </div>

            <button
              type="submit"
              :disabled="isSubmitting"
              class="btn-primary btn-lg w-full sm:w-auto disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span v-if="!isSubmitting">Envoyer</span>
              <span v-else>Envoi en cours…</span>
            </button>
          </form>

          <div v-if="showSuccess" class="mt-6 p-4 rounded-mmd border" style="background:#EBF3DE;border-color:#7EB13F">
            <p class="text-sm font-medium" style="color:#5C8A2A">
              Message envoyé ! Nous vous répondrons rapidement.
            </p>
          </div>
        </div>

        <!-- Sidebar infos -->
        <div class="space-y-6">
          <div class="card">
            <h3 class="text-base font-bold text-gray-900 mb-4">Nous joindre</h3>
            <ul class="space-y-3">
              <li>
                <a href="mailto:contact@ficana.com" class="flex items-center gap-3 text-sm text-gray-700 hover:text-primary-700 transition-colors">
                  <svg class="w-5 h-5 text-primary-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  contact@ficana.com
                </a>
              </li>
              <li class="flex items-center gap-3 text-sm text-gray-700">
                <svg class="w-5 h-5 text-primary-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Paris, France
              </li>
            </ul>
          </div>

          <div class="card">
            <h3 class="text-base font-bold text-gray-900 mb-4">Horaires support</h3>
            <ul class="space-y-2 text-sm text-gray-700">
              <li class="flex justify-between"><span>Lun — Ven</span><span class="font-medium text-gray-900">9h — 18h</span></li>
              <li class="flex justify-between"><span>Samedi</span><span class="font-medium text-gray-900">10h — 13h</span></li>
              <li class="flex justify-between text-gray-500"><span>Dimanche</span><span>Fermé</span></li>
            </ul>
          </div>

          <div class="card" style="background:#EBF3DE;border-color:rgba(126,177,63,0.25)">
            <h3 class="text-base font-bold text-gray-900 mb-3">Besoin d'aide rapide ?</h3>
            <p class="text-sm text-gray-700 mb-4">
              La plupart des questions trouvent leur réponse dans nos articles.
            </p>
            <NuxtLink to="/blog" class="btn-secondary text-sm">Consulter le blog</NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

useHead({
  title: 'Contact — Ficana',
  meta: [
    { name: 'description', content: 'Une question, un bug, une suggestion ? Écrivez à l\'équipe Ficana.' },
  ],
})

const form = ref({
  name: '',
  email: '',
  subject: '',
  message: '',
  consent: false,
})

const isSubmitting = ref(false)
const showSuccess = ref(false)

async function submitForm() {
  isSubmitting.value = true
  try {
    await new Promise((r) => setTimeout(r, 1200))
    form.value = { name: '', email: '', subject: '', message: '', consent: false }
    showSuccess.value = true
    setTimeout(() => (showSuccess.value = false), 5000)
  } finally {
    isSubmitting.value = false
  }
}
</script>
