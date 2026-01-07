import vine from '@vinejs/vine'

export const vetRegisterValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail(),
    password: vine.string().minLength(8),
    firstName: vine.string().optional(),
    lastName: vine.string().optional(),
    clinicName: vine.string().optional(),
    phone: vine.string().optional(),
    address: vine.string().optional(),
    licenseNumber: vine.string().optional(),
    specialization: vine.string().optional(),
    // Clinic selection from map
    clinicId: vine.number().optional(),
    clinicData: vine.object({
      placeId: vine.string(),
      name: vine.string(),
      address: vine.string(),
      latitude: vine.number(),
      longitude: vine.number(),
      phone: vine.string().optional(),
      website: vine.string().optional(),
      rating: vine.number().optional(),
      userRatingsTotal: vine.number().optional(),
    }).optional(),
  })
)

export const vetLoginValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail(),
    password: vine.string(),
  })
)

export const vetUpdateProfileValidator = vine.compile(
  vine.object({
    firstName: vine.string().optional(),
    lastName: vine.string().optional(),
    clinicName: vine.string().optional(),
    phone: vine.string().optional(),
    address: vine.string().optional(),
    specialization: vine.string().optional(),
  })
)
