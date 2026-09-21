import { test } from '@japa/runner'
import { cleanOnboardingProfile, parseOnboardingProfile } from '#services/onboarding_profile'

test.group('Onboarding qualification', () => {
  test('rejects unknown fields and choices', ({ assert }) => {
    assert.deepEqual(cleanOnboardingProfile({ role: 'admin', secret: true, currentStep: 99 }), {})
  })
  test('deduplicates, filters and limits priorities', ({ assert }) => {
    assert.deepEqual(cleanOnboardingProfile({ priorities: ['reports', 'reports', 'bad', 'followup', 'team', 'organisation'] }), { priorities: ['reports', 'followup', 'team'] })
  })
  test('bounds user supplied software names', ({ assert }) => {
    assert.equal(cleanOnboardingProfile({ currentSoftware: '  ' + 'a'.repeat(100) }).currentSoftware, 'a'.repeat(80))
  })
  test('recovers from malformed stored data', ({ assert }) => {
    assert.deepEqual(parseOnboardingProfile('{broken'), {})
    assert.deepEqual(parseOnboardingProfile(null), {})
    assert.deepEqual(parseOnboardingProfile('[]'), {})
  })
  test('accepts resumable steps but rejects fractions', ({ assert }) => {
    assert.equal(cleanOnboardingProfile({ currentStep: 6 }).currentStep, 6)
    assert.isUndefined(cleanOnboardingProfile({ currentStep: 1.5 }).currentStep)
  })
  test('allows clearing optional answers', ({ assert }) => {
    assert.deepEqual(cleanOnboardingProfile({ role: '', currentSoftware: '', priorities: [] }), { role: '', currentSoftware: '', priorities: [] })
  })
})
