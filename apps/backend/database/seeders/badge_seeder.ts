import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Badge from '#models/badge'

export default class extends BaseSeeder {
  async run() {
    await Badge.updateOrCreateMany('code', [
      {
        code: 'first_pet',
        name: 'Premier compagnon',
        description: 'Ajouter votre premier animal',
        icon: '🐾',
        category: 'milestone',
        points: 10,
      },
      {
        code: 'first_weight',
        name: 'Suivi santé',
        description: 'Enregistrer une première pesée',
        icon: '⚖️',
        category: 'health',
        points: 10,
      },
      {
        code: 'first_walk',
        name: 'Première balade',
        description: 'Enregistrer une première promenade',
        icon: '🚶',
        category: 'activity',
        points: 10,
      },
      {
        code: 'week_streak',
        name: 'Semaine active',
        description: '7 jours d\'activité consécutifs',
        icon: '🔥',
        category: 'activity',
        points: 50,
      },
      {
        code: 'vaccinated',
        name: 'Bien protégé',
        description: 'Vaccins à jour',
        icon: '💉',
        category: 'health',
        points: 20,
      },
      {
        code: 'vet_visit',
        name: 'Visite véto',
        description: 'Premier rendez-vous vétérinaire',
        icon: '🏥',
        category: 'health',
        points: 15,
      },
      {
        code: 'photo_album',
        name: 'Photographe',
        description: 'Ajouter 5 photos',
        icon: '📸',
        category: 'care',
        points: 15,
      },
      {
        code: 'complete_profile',
        name: 'Profil complet',
        description: 'Remplir toutes les infos de l\'animal',
        icon: '✅',
        category: 'care',
        points: 20,
      },
    ])
  }
}
