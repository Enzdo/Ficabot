export function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export function fmtDate(d: string): string {
  try { return new Date(d).toLocaleDateString('fr-FR') } catch { return d }
}

export function friendlyDate(dateStr: string): string {
  const now  = new Date(); now.setHours(0, 0, 0, 0)
  const then = new Date(dateStr); then.setHours(0, 0, 0, 0)
  const days = Math.round((then.getTime() - now.getTime()) / 86400000)
  if (days === 0) return "Aujourd'hui"
  if (days === 1) return 'Demain'
  if (days === -1) return 'Hier'
  if (days > 0 && days <= 7) return `Dans ${days} jours`
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

export function daysUntil(dateStr: string): number {
  const now  = new Date(); now.setHours(0, 0, 0, 0)
  const then = new Date(dateStr); then.setHours(0, 0, 0, 0)
  return Math.round((then.getTime() - now.getTime()) / 86400000)
}

export function getAge(birthDate: string): string {
  const now = new Date()
  const birth = new Date(birthDate)
  const months =
    (now.getFullYear() - birth.getFullYear()) * 12 +
    (now.getMonth() - birth.getMonth())
  if (months < 1) return 'Moins d\'un mois'
  if (months < 12) return `${months} mois`
  const y = Math.floor(months / 12)
  return `${y} an${y > 1 ? 's' : ''}`
}

export function formatAmount(amount: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount)
}
