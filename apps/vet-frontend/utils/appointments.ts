/** Keep the clinic API's nested patient/client data consistent across views. */
export const normalizeVetAppointment = (appointment: Record<string, any>) => ({
  ...appointment,
  date: String(appointment.date || '').slice(0, 10),
  time: appointment.time || appointment.startTime?.slice(0, 5) || '',
  petName: appointment.petName || appointment.pet?.name || 'Patient non renseigné',
  petSpecies: appointment.petSpecies || appointment.pet?.species || '',
  clientName: appointment.clientName || appointment.client?.name || [appointment.client?.firstName, appointment.client?.lastName].filter(Boolean).join(' ') || 'Propriétaire non renseigné',
})
