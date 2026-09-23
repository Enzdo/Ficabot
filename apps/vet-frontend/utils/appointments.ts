/**
 * Ramène une valeur de colonne `date` à AAAA-MM-JJ.
 *
 * Le pilote Postgres rend une colonne `date` sous forme d'objet Date posé à
 * minuit **dans le fuseau du serveur**. Sérialisé en JSON, `2026-09-23` devient
 * donc `"2026-09-22T22:00:00.000Z"` dès que le serveur est à l'est de
 * Greenwich — et le `.slice(0, 10)` d'origine lisait le 22. Tous les
 * rendez-vous reculaient d'un jour.
 *
 * On relit l'instant dans le fuseau du navigateur, ce qui redonne la bonne
 * journée que le serveur tourne en UTC ou à l'heure de Paris. Une valeur déjà
 * au format AAAA-MM-JJ est rendue telle quelle, sans détour par Date.
 */
export const toLocalDateKey = (value: unknown): string => {
  if (!value) return ''

  const raw = String(value)
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw

  const parsed = new Date(raw)
  if (Number.isNaN(parsed.getTime())) return raw.slice(0, 10)

  const y = parsed.getFullYear()
  const m = String(parsed.getMonth() + 1).padStart(2, '0')
  const d = String(parsed.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** `09:00:00` → `09:00`. La colonne est de type `time`, le pilote rend les secondes. */
export const toShortTime = (value: unknown): string => String(value || '').slice(0, 5)

/** Keep the clinic API's nested patient/client data consistent across views. */
export const normalizeVetAppointment = (appointment: Record<string, any>) => ({
  ...appointment,
  date: toLocalDateKey(appointment.date),
  time: appointment.time || toShortTime(appointment.startTime),
  // Normalisés ici aussi : affichés bruts, ils donnaient « 09:00:00 - 09:30 ».
  startTime: toShortTime(appointment.startTime),
  endTime: toShortTime(appointment.endTime),
  petName: appointment.petName || appointment.pet?.name || 'Patient non renseigné',
  petSpecies: appointment.petSpecies || appointment.pet?.species || '',
  clientName: appointment.clientName || appointment.client?.name || [appointment.client?.firstName, appointment.client?.lastName].filter(Boolean).join(' ') || 'Propriétaire non renseigné',
})

export const vetSpeciesLabel = (species: string) => ({ dog: 'Chien', cat: 'Chat', rabbit: 'Lapin', bird: 'Oiseau', horse: 'Cheval', reptile: 'Reptile' } as Record<string,string>)[species] || 'Animal'

/** Only link a shared record by its stable animal ID, never by name. */
export const appointmentPatient = (appointment: Record<string, any>, patients: Record<string, any>[]) => {
  const id = appointment.pet?.id ?? appointment.petId
  return id == null ? undefined : patients.find(patient => String(patient.id) === String(id) && patient.vetToken)
}
export const appointmentConsultationLink = (appointment: Record<string, any>, patients: Record<string, any>[]) => {
  const patient = appointmentPatient(appointment, patients)
  return patient ? { path: '/consultation', query: { patient: patient.vetToken } } : { path: '/consultation' }
}
