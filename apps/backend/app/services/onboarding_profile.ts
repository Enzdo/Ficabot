export const PROFILE_CHOICES = {
  role: ['owner', 'employee', 'locum', 'other'],
  consultationVolume: ['under10', '10to20', 'over20'],
  reportMethod: ['software', 'paper', 'dictation', 'mixed'],
  priorities: ['reports', 'followup', 'organisation', 'team'],
} as const

export interface OnboardingProfile {
  role?: string
  consultationVolume?: string
  reportMethod?: string
  currentSoftware?: string
  priorities?: string[]
  currentStep?: number
}

/** Accept only known choices; never persist arbitrary questionnaire payloads. */
export function cleanOnboardingProfile(raw: unknown): OnboardingProfile {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
  const input = raw as Record<string, unknown>
  const clean: OnboardingProfile = {}
  for (const key of ['role', 'consultationVolume', 'reportMethod'] as const) {
    const value = input[key]
    if (typeof value === 'string' && (value === '' || (PROFILE_CHOICES[key] as readonly string[]).includes(value))) clean[key] = value
  }
  if (typeof input.currentSoftware === 'string') clean.currentSoftware = input.currentSoftware.trim().slice(0, 80)
  if (Array.isArray(input.priorities)) clean.priorities = [...new Set(input.priorities.filter((v): v is string => typeof v === 'string' && (PROFILE_CHOICES.priorities as readonly string[]).includes(v)))].slice(0, 3)
  if (Number.isInteger(input.currentStep) && Number(input.currentStep) >= 1 && Number(input.currentStep) <= 6) clean.currentStep = Number(input.currentStep)
  return clean
}

export function parseOnboardingProfile(raw: unknown): OnboardingProfile {
  try { return cleanOnboardingProfile(typeof raw === 'string' ? JSON.parse(raw) : raw) }
  catch { return {} }
}
