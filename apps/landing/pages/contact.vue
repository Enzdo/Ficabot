<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
    <!-- Hero Section -->
    <section class="section">
      <div class="container-custom">
        <div class="text-center max-w-4xl mx-auto mb-16">
          <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Contactez
            <span class="gradient-text">Votre Assistant Virtuel</span>
          </h1>
          <p class="text-xl text-gray-600 mb-8">
            Une question ? Une démo ? Notre équipe est là pour vous accompagner dans votre transition digitale.
          </p>
          <div class="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
            <div class="flex items-center gap-2">
              <Icon name="lucide:clock" class="w-4 h-4" />
              <span>Réponse sous 24h</span>
            </div>
            <div class="flex items-center gap-2">
              <Icon name="lucide:map-pin" class="w-4 h-4" />
              <span>Basé en France</span>
            </div>
            <div class="flex items-center gap-2">
              <Icon name="lucide:users" class="w-4 h-4" />
              <span>100+ cliniques partenaires</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact Form & Info -->
    <section class="section pb-20">
      <div class="container-custom">
        <div class="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          
          <!-- Contact Form -->
          <div class="bg-white rounded-2xl shadow-xl p-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">
              Envoyez-nous un message
            </h2>
            
            <form @submit.prevent="submitForm" class="space-y-6">
              <!-- Nom -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Nom complet *
                </label>
                <input
                  v-model="form.name"
                  type="text"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Dr. Martin Dupont"
                />
              </div>

              <!-- Email -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Email professionnel *
                </label>
                <input
                  v-model="form.email"
                  type="email"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="martin@clinique-veterinaire.fr"
                />
              </div>

              <!-- Téléphone -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <input
                  v-model="form.phone"
                  type="tel"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="06 12 34 56 78"
                />
              </div>

              <!-- Sujet -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Sujet *
                </label>
                <select
                  v-model="form.subject"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Sélectionnez un sujet</option>
                  <option value="demo">Demande de démo</option>
                  <option value="pricing">Information sur les tarifs</option>
                  <option value="technical">Support technique</option>
                  <option value="partnership">Partenariat</option>
                  <option value="other">Autre</option>
                </select>
              </div>

              <!-- Message -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  v-model="form.message"
                  required
                  rows="5"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Décrivez votre projet ou vos questions..."
                ></textarea>
              </div>

              <!-- Consentement RGPD -->
              <div class="flex items-start">
                <input
                  v-model="form.consent"
                  type="checkbox"
                  required
                  class="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label class="ml-3 text-sm text-gray-600">
                  J'accepte que mes informations soient traitées conformément à la 
                  <a href="#" class="text-primary-600 hover:underline">politique de confidentialité</a>
                  *
                </label>
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                :disabled="isSubmitting"
                class="w-full btn-primary py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="!isSubmitting">Envoyer le message</span>
                <span v-else class="flex items-center justify-center gap-2">
                  <Icon name="lucide:loader-2" class="w-5 h-5 animate-spin" />
                  Envoi en cours...
                </span>
              </button>
            </form>

            <!-- Success Message -->
            <div v-if="showSuccess" class="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div class="flex items-center gap-3">
                <Icon name="lucide:check-circle" class="w-5 h-5 text-green-600" />
                <p class="text-green-800">
                  Message envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.
                </p>
              </div>
            </div>
          </div>

          <!-- Contact Information -->
          <div class="space-y-8">
            <!-- Contact Cards -->
            <div class="bg-white rounded-2xl shadow-xl p-8">
              <h3 class="text-xl font-bold text-gray-900 mb-6">
                Nos coordonnées
              </h3>
              
              <div class="space-y-4">
                <a href="mailto:contact@votre-assistant-virtuel.fr" class="flex items-center gap-3 text-gray-600 hover:text-primary-600 transition-colors">
                  <Icon name="lucide:mail" class="w-5 h-5" />
                  <span>contact@votre-assistant-virtuel.fr</span>
                </a>
                
                <a href="tel:+33612345678" class="flex items-center gap-3 text-gray-600 hover:text-primary-600 transition-colors">
                  <Icon name="lucide:phone" class="w-5 h-5" />
                  <span>06 12 34 56 78</span>
                </a>
                
                <div class="flex items-center gap-3 text-gray-600">
                  <Icon name="lucide:map-pin" class="w-5 h-5" />
                  <span>Paris, France</span>
                </div>
              </div>
            </div>

            <!-- Horaires -->
            <div class="bg-white rounded-2xl shadow-xl p-8">
              <h3 class="text-xl font-bold text-gray-900 mb-6">
                Horaires de disponibilité
              </h3>
              
              <div class="space-y-2 text-gray-600">
                <div class="flex justify-between">
                  <span>Lundi - Vendredi</span>
                  <span class="font-medium">9h - 18h</span>
                </div>
                <div class="flex justify-between">
                  <span>Samedi</span>
                  <span class="font-medium">9h - 12h</span>
                </div>
                <div class="flex justify-between">
                  <span>Dimanche</span>
                  <span class="font-medium">Fermé</span>
                </div>
              </div>
            </div>

            <!-- Why Contact Us -->
            <div class="bg-gradient-to-r from-primary-50 to-purple-50 rounded-2xl p-8">
              <h3 class="text-xl font-bold text-gray-900 mb-4">
                Pourquoi nous contacter ?
              </h3>
              
              <ul class="space-y-3 text-gray-700">
                <li class="flex items-start gap-3">
                  <Icon name="lucide:check" class="w-5 h-5 text-primary-600 mt-0.5" />
                  <span>Démo personnalisée de 30 minutes</span>
                </li>
                <li class="flex items-start gap-3">
                  <Icon name="lucide:check" class="w-5 h-5 text-primary-600 mt-0.5" />
                  <span>Accompagnement gratuit à la migration</span>
                </li>
                <li class="flex items-start gap-3">
                  <Icon name="lucide:check" class="w-5 h-5 text-primary-600 mt-0.5" />
                  <span>Support technique prioritaire</span>
                </li>
                <li class="flex items-start gap-3">
                  <Icon name="lucide:check" class="w-5 h-5 text-primary-600 mt-0.5" />
                  <span>Formation de toute votre équipe</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
// SEO
useHead({
  title: 'Contact - Votre Assistant Virtuel',
  meta: [
    { name: 'description', content: 'Contactez votre assistant virtuel pour une démo personnalisée, du support technique ou toute question sur nos solutions de gestion vétérinaire.' }
  ]
})

// Form state
const form = ref({
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
  consent: false
})

const isSubmitting = ref(false)
const showSuccess = ref(false)

// Submit form
const submitForm = async () => {
  isSubmitting.value = true
  
  try {
    // Simuler l'envoi du formulaire
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Réinitialiser le formulaire
    form.value = {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
      consent: false
    }
    
    showSuccess.value = true
    
    // Cacher le message de succès après 5 secondes
    setTimeout(() => {
      showSuccess.value = false
    }, 5000)
    
  } catch (error) {
    console.error('Erreur lors de l\'envoi du formulaire:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>
