<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-surface-900">Paramètres</h1>
        <p class="text-surface-500 mt-1">Configurez votre clinique et votre compte</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-2 mb-6 border-b border-surface-200 overflow-x-auto">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="[
          'px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px',
          activeTab === tab.id 
            ? 'border-primary-600 text-primary-600' 
            : 'border-transparent text-surface-500 hover:text-surface-700'
        ]"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Status Message -->
    <div v-if="message" :class="['mb-4 px-4 py-3 rounded-xl text-sm', messageType === 'success' ? 'bg-success-50 text-success-700' : 'bg-danger-50 text-danger-700']">
      {{ message }}
    </div>

    <!-- Clinic Settings -->
    <div v-if="activeTab === 'clinic'" class="space-y-6">
      <div class="card">
        <h3 class="font-semibold text-surface-900 mb-4">Informations de la clinique</h3>
        <form @submit.prevent="saveClinicInfo" class="space-y-4">
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="label">Nom de la clinique</label>
              <input v-model="clinicInfo.name" type="text" class="input" />
            </div>
            <div>
              <label class="label">Numéro SIRET</label>
              <input v-model="clinicInfo.siret" type="text" class="input" />
            </div>
          </div>
          <div>
            <label class="label">Adresse</label>
            <input v-model="clinicInfo.address" type="text" class="input" />
          </div>
          <div class="grid md:grid-cols-3 gap-4">
            <div>
              <label class="label">Code postal</label>
              <input v-model="clinicInfo.postalCode" type="text" class="input" />
            </div>
            <div class="md:col-span-2">
              <label class="label">Ville</label>
              <input v-model="clinicInfo.city" type="text" class="input" />
            </div>
          </div>
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="label">Téléphone</label>
              <input v-model="clinicInfo.phone" type="tel" class="input" />
            </div>
            <div>
              <label class="label">Email</label>
              <input v-model="clinicInfo.email" type="email" class="input" />
            </div>
          </div>
          <div>
            <label class="label">Site web</label>
            <input v-model="clinicInfo.website" type="url" class="input" placeholder="https://" />
          </div>
          <div class="flex justify-end">
            <button type="submit" class="btn-primary">Enregistrer</button>
          </div>
        </form>
      </div>

      <div class="card">
        <h3 class="font-semibold text-surface-900 mb-4">Horaires d'ouverture</h3>
        <div class="space-y-3">
          <div v-for="day in weekDays" :key="day.id" class="flex items-center gap-4 p-3 bg-surface-50 rounded-xl">
            <div class="w-24">
              <span class="font-medium text-surface-900">{{ day.label }}</span>
            </div>
            <label class="flex items-center gap-2">
              <input type="checkbox" v-model="day.isOpen" class="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500" />
              <span class="text-sm text-surface-600">Ouvert</span>
            </label>
            <template v-if="day.isOpen">
              <input v-model="day.openTime" type="time" class="input w-auto" />
              <span class="text-surface-400">à</span>
              <input v-model="day.closeTime" type="time" class="input w-auto" />
            </template>
            <span v-else class="text-sm text-surface-400">Fermé</span>
          </div>
        </div>
        <div class="flex justify-end mt-4">
          <button @click="saveHours" class="btn-primary">Enregistrer les horaires</button>
        </div>
      </div>
    </div>

    <!-- Services & Pricing -->
    <div v-if="activeTab === 'services'" class="space-y-6">
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-surface-900">Services proposés</h3>
          <button @click="showAddService = true" class="btn-primary text-sm py-2">
            + Ajouter un service
          </button>
        </div>
        <div class="space-y-2">
          <div v-for="service in services" :key="service.id" class="flex items-center gap-4 p-4 bg-surface-50 rounded-xl">
            <div :class="['w-10 h-10 rounded-lg flex items-center justify-center', service.colorClass]">
              <span class="text-lg">{{ service.icon }}</span>
            </div>
            <div class="flex-1">
              <p class="font-medium text-surface-900">{{ service.name }}</p>
              <p class="text-sm text-surface-500">{{ service.duration }} min</p>
            </div>
            <div class="text-right">
              <p class="font-bold text-surface-900">{{ service.price }}€</p>
            </div>
            <div class="flex gap-2">
              <button @click="editService(service)" class="p-2 text-surface-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button @click="deleteService(service.id)" class="p-2 text-surface-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Templates -->
    <div v-if="activeTab === 'templates'" class="space-y-6">
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="font-semibold text-surface-900">Templates de consultation</h3>
            <p class="text-sm text-surface-500 mt-1">Modeles pre-remplis pour accelerer vos consultations</p>
          </div>
          <button @click="showAddTemplate = true" class="btn-primary text-sm py-2">
            + Nouveau template
          </button>
        </div>

        <div v-if="templates.length === 0" class="text-center py-8 text-surface-400">
          <p>Aucun template pour le moment</p>
          <p class="text-sm mt-1">Creez des modeles pour gagner du temps</p>
        </div>

        <div v-else class="space-y-2">
          <div v-for="t in templates" :key="t.id" class="flex items-center gap-4 p-4 bg-surface-50 rounded-xl">
            <div class="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
              <span class="text-lg">{{ t.type === 'consultation' ? '🩺' : t.type === 'surgery' ? '🔪' : t.type === 'vaccination' ? '💉' : '📋' }}</span>
            </div>
            <div class="flex-1">
              <p class="font-medium text-surface-900">{{ t.name }}</p>
              <p class="text-sm text-surface-500">{{ t.type }} - {{ t.defaultDuration || 30 }} min</p>
            </div>
            <div class="flex gap-2">
              <button @click="editTemplate(t)" class="p-2 text-surface-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button @click="deleteTemplate(t.id)" class="p-2 text-surface-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Online Booking -->
    <div v-if="activeTab === 'booking'" class="space-y-6">
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="font-semibold text-surface-900">Prise de rendez-vous en ligne</h3>
            <p class="text-sm text-surface-500 mt-1">Permettez a vos clients de prendre RDV directement</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" v-model="bookingEnabled" class="sr-only peer">
            <div class="w-11 h-6 bg-surface-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-surface-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
          </label>
        </div>

        <div v-if="bookingEnabled" class="space-y-4">
          <div class="p-4 bg-primary-50 border border-primary-200 rounded-xl">
            <p class="text-sm font-medium text-primary-800 mb-2">Lien de reservation</p>
            <div class="flex gap-2">
              <input :value="bookingUrl" type="text" class="input flex-1 text-sm font-mono" readonly />
              <button @click="copyBookingUrl" class="btn-primary text-sm py-2 px-4">
                {{ copied ? 'Copie !' : 'Copier' }}
              </button>
            </div>
            <p class="text-xs text-primary-600 mt-2">Partagez ce lien sur votre site web ou vos reseaux sociaux</p>
          </div>

          <div class="p-4 bg-surface-50 rounded-xl">
            <h4 class="font-medium text-surface-900 mb-3">Fonctionnement</h4>
            <ul class="space-y-2 text-sm text-surface-600">
              <li class="flex items-start gap-2">
                <svg class="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                Les clients voient vos creneaux disponibles selon vos horaires
              </li>
              <li class="flex items-start gap-2">
                <svg class="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                Les RDV arrivent en statut "en attente" dans votre planning
              </li>
              <li class="flex items-start gap-2">
                <svg class="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                Vous confirmez ou refusez chaque demande
              </li>
            </ul>
          </div>
        </div>

        <div v-else class="p-6 text-center text-surface-400">
          <svg class="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p>Activez la prise de RDV en ligne pour que vos clients puissent reserver directement</p>
        </div>
      </div>
    </div>

    <!-- Notifications -->
    <div v-if="activeTab === 'notifications'" class="space-y-6">
      <div class="card">
        <h3 class="font-semibold text-surface-900 mb-4">Préférences de notification</h3>
        <div class="space-y-4">
          <div class="flex items-center justify-between p-4 bg-surface-50 rounded-xl">
            <div>
              <p class="font-medium text-surface-900">Nouveaux rendez-vous</p>
              <p class="text-sm text-surface-500">Recevoir une notification pour chaque nouveau RDV</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="notifications.newAppointment" class="sr-only peer">
              <div class="w-11 h-6 bg-surface-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-surface-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
          
          <div class="flex items-center justify-between p-4 bg-surface-50 rounded-xl">
            <div>
              <p class="font-medium text-surface-900">Annulations</p>
              <p class="text-sm text-surface-500">Être notifié des annulations de RDV</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="notifications.cancellation" class="sr-only peer">
              <div class="w-11 h-6 bg-surface-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-surface-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
          
          <div class="flex items-center justify-between p-4 bg-surface-50 rounded-xl">
            <div>
              <p class="font-medium text-surface-900">Messages clients</p>
              <p class="text-sm text-surface-500">Notification pour les nouveaux messages</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="notifications.messages" class="sr-only peer">
              <div class="w-11 h-6 bg-surface-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-surface-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
          
          <div class="flex items-center justify-between p-4 bg-surface-50 rounded-xl">
            <div>
              <p class="font-medium text-surface-900">Rappels vaccins</p>
              <p class="text-sm text-surface-500">Alertes pour les vaccins à renouveler</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="notifications.vaccineReminders" class="sr-only peer">
              <div class="w-11 h-6 bg-surface-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-surface-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
          
          <div class="flex items-center justify-between p-4 bg-surface-50 rounded-xl">
            <div>
              <p class="font-medium text-surface-900">Résumé quotidien</p>
              <p class="text-sm text-surface-500">Recevoir un email récapitulatif chaque matin</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="notifications.dailySummary" class="sr-only peer">
              <div class="w-11 h-6 bg-surface-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-surface-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div class="card">
        <h3 class="font-semibold text-surface-900 mb-4">Rappels automatiques aux clients</h3>
        <div class="space-y-4">
          <div class="flex items-center justify-between p-4 bg-surface-50 rounded-xl">
            <div>
              <p class="font-medium text-surface-900">Rappel RDV (24h avant)</p>
              <p class="text-sm text-surface-500">Envoyer un rappel automatique aux clients</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="clientReminders.appointment24h" class="sr-only peer">
              <div class="w-11 h-6 bg-surface-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-surface-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
          
          <div class="flex items-center justify-between p-4 bg-surface-50 rounded-xl">
            <div>
              <p class="font-medium text-surface-900">Rappel vaccins</p>
              <p class="text-sm text-surface-500">Notifier les clients des vaccins à renouveler</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="clientReminders.vaccines" class="sr-only peer">
              <div class="w-11 h-6 bg-surface-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-surface-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Account -->
    <div v-if="activeTab === 'account'" class="space-y-6">
      <div class="card">
        <h3 class="font-semibold text-surface-900 mb-4">Informations personnelles</h3>
        <form @submit.prevent="saveProfile" class="space-y-4">
          <div class="flex items-center gap-6 mb-6">
            <div class="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-2xl font-bold">
              {{ authStore.vet?.firstName?.[0] }}{{ authStore.vet?.lastName?.[0] }}
            </div>
            <button type="button" class="btn-secondary text-sm">Changer la photo</button>
          </div>
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="label">Prénom</label>
              <input v-model="profile.firstName" type="text" class="input" />
            </div>
            <div>
              <label class="label">Nom</label>
              <input v-model="profile.lastName" type="text" class="input" />
            </div>
          </div>
          <div>
            <label class="label">Email</label>
            <input v-model="profile.email" type="email" class="input" />
          </div>
          <div>
            <label class="label">Téléphone</label>
            <input v-model="profile.phone" type="tel" class="input" />
          </div>
          <div>
            <label class="label">Numéro ordinal</label>
            <input v-model="profile.licenseNumber" type="text" class="input" />
          </div>
          <div>
            <label class="label">Spécialisation</label>
            <input v-model="profile.specialization" type="text" class="input" placeholder="Ex: Chirurgie, Dermatologie..." />
          </div>
          <div class="flex justify-end">
            <button type="submit" class="btn-primary">Enregistrer</button>
          </div>
        </form>
      </div>

      <div class="card">
        <h3 class="font-semibold text-surface-900 mb-4">Changer le mot de passe</h3>
        <form @submit.prevent="changePassword" class="space-y-4">
          <div>
            <label class="label">Mot de passe actuel</label>
            <input v-model="passwordForm.current" type="password" class="input" />
          </div>
          <div>
            <label class="label">Nouveau mot de passe</label>
            <input v-model="passwordForm.new" type="password" class="input" />
          </div>
          <div>
            <label class="label">Confirmer le nouveau mot de passe</label>
            <input v-model="passwordForm.confirm" type="password" class="input" />
          </div>
          <div class="flex justify-end">
            <button type="submit" class="btn-primary">Changer le mot de passe</button>
          </div>
        </form>
      </div>

      <div class="card border-danger-200 bg-danger-50">
        <h3 class="font-semibold text-danger-700 mb-2">Zone de danger</h3>
        <p class="text-sm text-danger-600 mb-4">Ces actions sont irréversibles.</p>
        <button @click="deleteAccount" class="btn bg-danger-600 text-white hover:bg-danger-700">
          Supprimer mon compte
        </button>
      </div>
    </div>

    <!-- Add Service Modal -->
    <div v-if="showAddService" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl max-w-md w-full p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-surface-900">{{ editingService ? 'Modifier' : 'Ajouter' }} un service</h2>
          <button @click="closeServiceModal" class="p-2 hover:bg-surface-100 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form @submit.prevent="saveService" class="space-y-4">
          <div>
            <label class="label">Nom du service</label>
            <input v-model="serviceForm.name" type="text" class="input" required />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">Durée (min)</label>
              <input v-model="serviceForm.duration" type="number" class="input" required />
            </div>
            <div>
              <label class="label">Prix (€)</label>
              <input v-model="serviceForm.price" type="number" step="0.01" class="input" required />
            </div>
          </div>
          <div>
            <label class="label">Icône</label>
            <div class="flex gap-2 flex-wrap">
              <button 
                v-for="icon in availableIcons" 
                :key="icon"
                type="button"
                @click="serviceForm.icon = icon"
                :class="[
                  'w-10 h-10 rounded-lg text-lg flex items-center justify-center transition-all',
                  serviceForm.icon === icon ? 'bg-primary-100 ring-2 ring-primary-500' : 'bg-surface-100 hover:bg-surface-200'
                ]"
              >
                {{ icon }}
              </button>
            </div>
          </div>
          <div class="flex gap-3 pt-4">
            <button type="button" @click="closeServiceModal" class="flex-1 btn-secondary">Annuler</button>
            <button type="submit" class="flex-1 btn-primary">{{ editingService ? 'Modifier' : 'Ajouter' }}</button>
          </div>
        </form>
      </div>
    </div>
    <!-- Add/Edit Template Modal -->
    <div v-if="showAddTemplate" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl max-w-md w-full p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-surface-900">{{ editingTemplate ? 'Modifier' : 'Nouveau' }} template</h2>
          <button @click="closeTemplateModal" class="p-2 hover:bg-surface-100 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form @submit.prevent="saveTemplate" class="space-y-4">
          <div>
            <label class="label">Nom du template</label>
            <input v-model="templateForm.name" type="text" class="input" placeholder="Ex: Consultation vaccinale" required />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">Type</label>
              <select v-model="templateForm.type" class="input">
                <option value="consultation">Consultation</option>
                <option value="surgery">Chirurgie</option>
                <option value="vaccination">Vaccination</option>
                <option value="checkup">Bilan</option>
                <option value="other">Autre</option>
              </select>
            </div>
            <div>
              <label class="label">Duree (min)</label>
              <input v-model.number="templateForm.defaultDuration" type="number" class="input" min="5" step="5" />
            </div>
          </div>
          <div>
            <label class="label">Notes par defaut</label>
            <textarea v-model="templateForm.defaultNotes" class="input" rows="3" placeholder="Notes pre-remplies pour ce type de consultation..."></textarea>
          </div>
          <div class="flex gap-3 pt-4">
            <button type="button" @click="closeTemplateModal" class="flex-1 btn-secondary">Annuler</button>
            <button type="submit" class="flex-1 btn-primary">{{ editingTemplate ? 'Modifier' : 'Creer' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const authStore = useVetAuthStore()
const api = useVetApi()
const saving = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')

const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
  message.value = msg
  messageType.value = type
  setTimeout(() => { message.value = '' }, 3000)
}

const tabs = [
  { id: 'clinic', label: 'Clinique' },
  { id: 'services', label: 'Services & Tarifs' },
  { id: 'templates', label: 'Templates' },
  { id: 'booking', label: 'RDV en ligne' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'account', label: 'Mon compte' },
]

const activeTab = ref('clinic')
const showAddService = ref(false)
const editingService = ref<any>(null)
const showAddTemplate = ref(false)
const editingTemplate = ref<any>(null)
const templates = ref<any[]>([])
const bookingEnabled = ref(false)
const copied = ref(false)

const clinicInfo = ref({
  name: '',
  siret: '',
  address: '',
  postalCode: '',
  city: '',
  phone: '',
  email: '',
  website: '',
})

const defaultDays = [
  { id: 'monday', label: 'Lundi', isOpen: false, openTime: '09:00', closeTime: '19:00' },
  { id: 'tuesday', label: 'Mardi', isOpen: false, openTime: '09:00', closeTime: '19:00' },
  { id: 'wednesday', label: 'Mercredi', isOpen: false, openTime: '09:00', closeTime: '19:00' },
  { id: 'thursday', label: 'Jeudi', isOpen: false, openTime: '09:00', closeTime: '19:00' },
  { id: 'friday', label: 'Vendredi', isOpen: false, openTime: '09:00', closeTime: '18:00' },
  { id: 'saturday', label: 'Samedi', isOpen: false, openTime: '09:00', closeTime: '12:00' },
  { id: 'sunday', label: 'Dimanche', isOpen: false, openTime: '', closeTime: '' },
]

const weekDays = ref([...defaultDays])

const services = ref<any[]>([])

const serviceForm = ref({
  name: '',
  duration: 30,
  price: 0,
  icon: '🩺',
})

const availableIcons = ['🩺', '💉', '🔪', '🦷', '✂️', '📷', '💊', '🩹', '🧪', '🔬', '❤️', '🐾']

const templateForm = ref({
  name: '',
  type: 'consultation',
  defaultDuration: 30,
  defaultNotes: '',
})

const bookingUrl = computed(() => {
  const vetId = authStore.vet?.id || ''
  const baseUrl = window?.location?.origin || ''
  return `${baseUrl}/booking/${vetId}`
})

const notifications = ref({
  newAppointment: true,
  cancellation: true,
  messages: true,
  vaccineReminders: true,
  dailySummary: false,
})

const clientReminders = ref({
  appointment24h: true,
  vaccines: true,
})

const profile = ref({
  firstName: authStore.vet?.firstName || '',
  lastName: authStore.vet?.lastName || '',
  email: authStore.vet?.email || '',
  phone: authStore.vet?.phone || '',
  licenseNumber: authStore.vet?.licenseNumber || '',
  specialization: '',
})

const passwordForm = ref({
  current: '',
  new: '',
  confirm: '',
})

// Load all data on mount
onMounted(async () => {
  await Promise.all([
    loadProfile(),
    loadClinicInfo(),
    loadHours(),
    loadServices(),
    loadTemplates(),
  ])
})

const loadProfile = async () => {
  const response = await api.get<any>('/vet/auth/me')
  if (response.success && response.data) {
    profile.value = {
      firstName: response.data.firstName || '',
      lastName: response.data.lastName || '',
      email: response.data.email || '',
      phone: response.data.phone || '',
      licenseNumber: response.data.licenseNumber || '',
      specialization: response.data.specialization || '',
    }
  }
}

const loadClinicInfo = async () => {
  const response = await api.get<any>('/vet/clinic/info')
  if (response.success && response.data) {
    clinicInfo.value = {
      name: response.data.name || '',
      siret: response.data.siret || '',
      address: response.data.address || '',
      postalCode: response.data.postalCode || '',
      city: response.data.city || '',
      phone: response.data.phone || '',
      email: response.data.email || '',
      website: response.data.website || '',
    }
  }
}

const loadHours = async () => {
  const response = await api.get<any>('/vet/clinic/hours')
  if (response.success && response.data) {
    const saved = response.data as any
    weekDays.value = defaultDays.map(day => ({
      ...day,
      isOpen: saved[day.id]?.isOpen ?? day.isOpen,
      openTime: saved[day.id]?.openTime ?? day.openTime,
      closeTime: saved[day.id]?.closeTime ?? day.closeTime,
    }))
  }
}

const loadServices = async () => {
  const response = await api.get<any>('/vet/clinic/services')
  if (response.success && response.data) {
    services.value = response.data
  }
}

const saveClinicInfo = async () => {
  saving.value = true
  const response = await api.put<any>('/vet/clinic/info', clinicInfo.value)
  if (response.success) {
    showMessage('Informations de la clinique enregistrées')
  } else {
    showMessage(response.message || 'Erreur lors de la sauvegarde', 'error')
  }
  saving.value = false
}

const saveHours = async () => {
  saving.value = true
  const hoursData: Record<string, any> = {}
  weekDays.value.forEach(day => {
    hoursData[day.id] = {
      isOpen: day.isOpen,
      openTime: day.openTime,
      closeTime: day.closeTime,
    }
  })
  const response = await api.put<any>('/vet/clinic/hours', { hours: hoursData })
  if (response.success) {
    showMessage('Horaires enregistrés')
  } else {
    showMessage(response.message || 'Erreur lors de la sauvegarde', 'error')
  }
  saving.value = false
}

const editService = (service: any) => {
  editingService.value = service
  serviceForm.value = { name: service.name, duration: service.duration, price: service.price, icon: service.icon }
  showAddService.value = true
}

const deleteService = async (id: number) => {
  if (!confirm('Supprimer ce service ?')) return
  const response = await api.del<any>(`/vet/clinic/services/${id}`)
  if (response.success) {
    services.value = services.value.filter(s => s.id !== id)
    showMessage('Service supprimé')
  } else {
    showMessage(response.message || 'Erreur lors de la suppression', 'error')
  }
}

const saveService = async () => {
  saving.value = true
  if (editingService.value) {
    const response = await api.put<any>(`/vet/clinic/services/${editingService.value.id}`, serviceForm.value)
    if (response.success && response.data) {
      const index = services.value.findIndex(s => s.id === editingService.value.id)
      if (index !== -1) services.value[index] = response.data
      showMessage('Service modifié')
    } else {
      showMessage(response.message || 'Erreur', 'error')
    }
  } else {
    const response = await api.post<any>('/vet/clinic/services', serviceForm.value)
    if (response.success && response.data) {
      services.value.push(response.data)
      showMessage('Service ajouté')
    } else {
      showMessage(response.message || 'Erreur', 'error')
    }
  }
  saving.value = false
  closeServiceModal()
}

const closeServiceModal = () => {
  showAddService.value = false
  editingService.value = null
  serviceForm.value = { name: '', duration: 30, price: 0, icon: '🩺' }
}

// Templates
const loadTemplates = async () => {
  const response = await api.get<any>('/vet/templates')
  if (response.success && response.data) {
    templates.value = response.data
  }
}

const editTemplate = (t: any) => {
  editingTemplate.value = t
  templateForm.value = {
    name: t.name,
    type: t.type,
    defaultDuration: t.defaultDuration || 30,
    defaultNotes: t.defaultNotes || '',
  }
  showAddTemplate.value = true
}

const saveTemplate = async () => {
  saving.value = true
  if (editingTemplate.value) {
    const response = await api.put<any>(`/vet/templates/${editingTemplate.value.id}`, templateForm.value)
    if (response.success && response.data) {
      const idx = templates.value.findIndex(t => t.id === editingTemplate.value.id)
      if (idx !== -1) templates.value[idx] = response.data
      showMessage('Template modifie')
    } else {
      showMessage(response.message || 'Erreur', 'error')
    }
  } else {
    const response = await api.post<any>('/vet/templates', templateForm.value)
    if (response.success && response.data) {
      templates.value.push(response.data)
      showMessage('Template cree')
    } else {
      showMessage(response.message || 'Erreur', 'error')
    }
  }
  saving.value = false
  closeTemplateModal()
}

const deleteTemplate = async (id: number) => {
  if (!confirm('Supprimer ce template ?')) return
  const response = await api.del<any>(`/vet/templates/${id}`)
  if (response.success) {
    templates.value = templates.value.filter(t => t.id !== id)
    showMessage('Template supprime')
  } else {
    showMessage(response.message || 'Erreur', 'error')
  }
}

const closeTemplateModal = () => {
  showAddTemplate.value = false
  editingTemplate.value = null
  templateForm.value = { name: '', type: 'consultation', defaultDuration: 30, defaultNotes: '' }
}

// Booking URL
const copyBookingUrl = async () => {
  try {
    await navigator.clipboard.writeText(bookingUrl.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    showMessage('Impossible de copier le lien', 'error')
  }
}

const saveProfile = async () => {
  saving.value = true
  const response = await api.put<any>('/vet/auth/profile', {
    firstName: profile.value.firstName,
    lastName: profile.value.lastName,
    phone: profile.value.phone,
    specialization: profile.value.specialization,
  })
  if (response.success) {
    showMessage('Profil mis à jour avec succès')
    // Update auth store
    if (authStore.vet) {
      authStore.vet.firstName = profile.value.firstName
      authStore.vet.lastName = profile.value.lastName
    }
  } else {
    showMessage(response.message || 'Erreur lors de la mise à jour', 'error')
  }
  saving.value = false
}

const changePassword = async () => {
  if (passwordForm.value.new !== passwordForm.value.confirm) {
    showMessage('Les mots de passe ne correspondent pas', 'error')
    return
  }
  if (passwordForm.value.new.length < 8) {
    showMessage('Le nouveau mot de passe doit contenir au moins 8 caractères', 'error')
    return
  }
  saving.value = true
  const response = await api.put<any>('/vet/auth/password', {
    currentPassword: passwordForm.value.current,
    newPassword: passwordForm.value.new,
  })
  if (response.success) {
    showMessage('Mot de passe modifié avec succès')
    passwordForm.value = { current: '', new: '', confirm: '' }
  } else {
    showMessage(response.message || 'Erreur lors du changement de mot de passe', 'error')
  }
  saving.value = false
}

const deleteAccount = async () => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) return
  const response = await api.del<any>('/vet/auth/account')
  if (response.success) {
    authStore.logout()
    navigateTo('/login')
  }
}
</script>
