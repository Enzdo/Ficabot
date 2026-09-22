/** Keep the clinic API's nested patient/client data consistent across views. */
export const normalizeVetAppointment = (appointment: Record<string, any>) => ({
  ...appointment,
  date: String(appointment.date || '').slice(0, 10),
  time: appointment.time || appointment.startTime?.slice(0, 5) || '',
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
