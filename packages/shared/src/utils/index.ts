import type { Species } from '../types'

export const SPECIES_LABELS: Record<Species, string> = {
  dog: 'Chien',
  cat: 'Chat',
}

export const MEDICAL_RECORD_TYPE_LABELS = {
  vaccine: 'Vaccin',
  treatment: 'Traitement',
  visit: 'Visite',
} as const

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function calculateAge(birthDate: Date | string): number {
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age
}

export function formatAge(birthDate: Date | string | null): string {
  if (!birthDate) return 'Âge inconnu'
  
  const age = calculateAge(birthDate)
  if (age < 1) {
    const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate
    const months = Math.floor((new Date().getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 30))
    return `${months} mois`
  }
  return `${age} an${age > 1 ? 's' : ''}`
}

export function formatWeight(weight: number | null): string {
  if (weight === null) return 'Poids inconnu'
  return `${weight} kg`
}

export function getSpeciesEmoji(species: Species): string {
  return species === 'dog' ? '🐕' : '🐱'
}

export function getSpeciesLabel(species: Species): string {
  return SPECIES_LABELS[species]
}

export function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}
