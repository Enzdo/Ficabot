<template>
  <main class="error-page">
    <a class="error-brand" href="/" aria-label="Ficana Pro, accueil"><img src="/brand/ficana-wordmark.png" alt="Ficana" width="124" height="38"><span>Pro</span></a>
    <div class="error-content">
      <div class="error-copy">
        <p class="error-code">{{ notFound ? '404 · Petite escapade' : 'Un petit contretemps' }}</p>
        <h1>{{ notFound ? 'On a perdu' : 'On reprend' }}<br><em>{{ notFound ? 'la piste.' : 'notre souffle.' }}</em></h1>
        <p class="error-description">{{ notFound ? 'Cette page semble avoir pris un autre chemin. Retrouvons ensemble le bon point de départ.' : 'La page n’a pas pu se charger. Revenez à l’accueil pour réessayer dans un instant.' }}</p>
        <div class="error-actions">
          <button type="button" class="btn-primary" @click="goHome">Retour à l’accueil <span aria-hidden="true">→</span></button>
          <button type="button" class="btn-secondary" @click="goContact">Nous contacter</button>
        </div>
        <p class="error-note">Vos patients, eux, sont toujours au bon endroit.</p>
      </div>
      <figure class="error-art">
        <img src="/media/ficana-lost-trail.jpg" alt="Un chien et un chat cherchent leur chemin près d’un panneau, dans une illustration en papier feutré." width="1536" height="1024" fetchpriority="high">
        <figcaption>Un petit détour, et on se retrouve.</figcaption>
      </figure>
    </div>
    <p class="error-footer">Ficana Pro · À vos côtés, à chaque étape.</p>
  </main>
</template>
<script setup lang="ts">
import type { NuxtError } from '#app'
const props = defineProps<{ error: NuxtError }>()
const notFound = computed(() => props.error.statusCode === 404)
useHead({ title: () => notFound.value ? 'Page introuvable — Ficana Pro' : 'Une pause imprévue — Ficana Pro', meta: [{ name: 'robots', content: 'noindex' }] })
const goHome = () => clearError({ redirect: '/' })
const goContact = () => clearError({ redirect: '/contact' })
</script>
<style scoped>
.error-page { min-height: 100svh; display: flex; flex-direction: column; background: #faf9f4; padding: 32px clamp(20px, 5vw, 80px); color: #18232b; }
.error-brand { display: inline-flex; align-items: center; gap: 9px; align-self: flex-start; color: #658249; font-weight: 600; }
.error-brand img { width: 112px; height: auto; }
.error-content { flex: 1; display: grid; grid-template-columns: 1fr 1.1fr; align-items: center; gap: clamp(32px, 6vw, 90px); max-width: 1180px; width: 100%; margin: 50px auto; }
.error-code { font-size: 12px; text-transform: uppercase; letter-spacing: .14em; color: #5e793f; font-weight: 700; margin-bottom: 20px; }
h1 { font-size: clamp(44px, 5.5vw, 76px); font-weight: 600; line-height: 1.05; letter-spacing: -.05em; }
h1 em { font-family: 'Instrument Serif', Georgia, serif; color: #668b3f; font-weight: 400; }
.error-description { color: #607078; font-size: 17px; line-height: 1.8; max-width: 430px; margin-top: 24px; }
.error-actions { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 32px; }
.error-actions button { min-height: 48px; }
.error-note { font-size: 12px; color: #78827a; margin-top: 20px; }
.error-art { margin: 0; }
.error-art img { display: block; width: 100%; height: auto; border-radius: 36px; mix-blend-mode: multiply; }
figcaption { margin-top: 16px; text-align: center; font-size: 12px; color: #78827a; }
.error-footer { text-align: center; font-size: 12px; color: #78827a; }
@media (max-width: 767px) { .error-content { grid-template-columns: 1fr; margin-block: 44px 30px; gap: 28px; } .error-copy { text-align: center; } .error-description { margin-inline: auto; font-size: 16px; } .error-actions { justify-content: center; } .error-art { max-width: 430px; margin-inline: auto; } h1 { font-size: 48px; } }
@media (max-width: 399px) { .error-actions { flex-direction: column; } }
</style>
