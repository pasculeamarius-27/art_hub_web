export type OnboardingChoice = 'explore' | 'learn'
export interface OnboardingState { choice: OnboardingChoice; complete: boolean }
export const ONBOARDING_KEY = 'antre:demo-onboarding:v1'

export function readOnboarding(raw: string | null): OnboardingState | null {
  if (!raw) return null
  try {
    const value: unknown = JSON.parse(raw)
    if (!value || typeof value !== 'object') return null
    const candidate = value as Partial<OnboardingState>
    return (candidate.choice === 'explore' || candidate.choice === 'learn') && candidate.complete === true ? { choice: candidate.choice, complete: true } : null
  } catch { return null }
}
