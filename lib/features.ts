/** Product navigation is metadata, not a claim that unfinished screens are live. */
export const FEATURES = [
  { id: 'feed', name: 'Art Feed', cue: 'Discover', description: 'A considered path through works and their context.' },
  { id: 'chat', name: 'Art Chat', cue: 'Ask', description: 'Ask questions grounded in approved artist sources.' },
  { id: 'community', name: 'Art Community', cue: 'Notice', description: 'See how others encountered a work.' },
  { id: 'map', name: 'Art Map', cue: 'Visit', description: 'Find verified spaces and exhibitions.' },
  { id: 'recognition', name: 'Art Recognition', cue: 'Recognize', description: 'Connect a work in front of you to its context.' },
  { id: 'taste', name: 'Art Taste', cue: 'Keep', description: 'Return to what stays with you.' },
  { id: 'mecena', name: 'Art Mecena', cue: 'Support', description: 'Learn how artists can be supported.' },
] as const

export type FeatureId = typeof FEATURES[number]['id']
export function isFeatureId(value: unknown): value is FeatureId {
  return typeof value === 'string' && FEATURES.some((feature) => feature.id === value)
}
