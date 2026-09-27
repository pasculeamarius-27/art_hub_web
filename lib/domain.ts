export type JourneyPhase = 'before' | 'during' | 'after'
export type CompanionMode = 'look' | 'context' | 'voice' | 'connect'

export interface SourceExcerpt {
  id: string
  label: string
  excerpt: string
  approved: true
}

export interface DemoArtwork {
  id: string
  title: string
  artist: string
  year: string
  medium: string
  room: string
  accent: string
  statement: string
  prompts: Record<CompanionMode, string>
  sources: SourceExcerpt[]
}

export interface JournalEntry {
  artworkId: string
  saved: boolean
  reflection: string
  updatedAt: string
}

export const DEMO_ARTWORKS: DemoArtwork[] = [
  {
    id: 'thresholds-no-4',
    title: 'Thresholds, No. 4',
    artist: 'Demo artist',
    year: '2026',
    medium: 'Pigment, linen and translucent resin',
    room: 'Room 2',
    accent: '#ff765f',
    statement: 'A surface that changes as the visitor moves, holding opacity and disclosure in the same field.',
    prompts: {
      look: 'Step half a pace to either side. Where does the surface stop behaving like an image and start behaving like an object?',
      context: 'The work sits in a lineage of artists who use the support itself as meaning, but its layered resin makes viewing time part of the material.',
      voice: 'The artist asks viewers not to decode a symbol, but to notice how certainty shifts with position.',
      connect: 'Think of another object that reveals itself slowly. What does delayed understanding change for you?',
    },
    sources: [
      { id: 's1', label: 'Artist statement, approved demo excerpt', excerpt: 'The surface is a threshold: neither window nor wall.', approved: true },
      { id: 's2', label: 'Gallery checklist, approved demo excerpt', excerpt: 'Pigment and translucent resin are layered directly over linen.', approved: true },
    ],
  },
  {
    id: 'borrowed-weather',
    title: 'Borrowed Weather',
    artist: 'Demo artist',
    year: '2025',
    medium: 'Sound, blown glass and found light',
    room: 'Room 3',
    accent: '#8da9ff',
    statement: 'A quiet installation about atmosphere as something collected, carried and remembered.',
    prompts: {
      look: 'Listen for the longest pause. Does the glass feel like the source of the sound or its witness?',
      context: 'The installation links fragile material with recorded weather, treating atmosphere as both evidence and memory.',
      voice: 'The artist describes each vessel as a small archive rather than a sculpture in isolation.',
      connect: 'Which weather do you remember through sound rather than sight?',
    },
    sources: [
      { id: 's3', label: 'Studio interview, approved demo excerpt', excerpt: 'I wanted the vessels to hold an event they could never physically contain.', approved: true },
      { id: 's4', label: 'Technical note, approved demo excerpt', excerpt: 'Field recordings trigger at low volume as visitors enter the room.', approved: true },
    ],
  },
]

export const MODES: Array<{ id: CompanionMode; label: string; eyebrow: string }> = [
  { id: 'look', label: 'Look closer', eyebrow: 'Observation' },
  { id: 'context', label: 'Add context', eyebrow: 'Grounded story' },
  { id: 'voice', label: 'Artist voice', eyebrow: 'Approved source' },
  { id: 'connect', label: 'Make a connection', eyebrow: 'Reflection' },
]

export function readJournal(raw: string | null): Record<string, JournalEntry> {
  if (!raw) return {}
  try {
    const value = JSON.parse(raw)
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
    return Object.fromEntries(
      Object.entries(value).filter(([, entry]) => {
        if (!entry || typeof entry !== 'object') return false
        const candidate = entry as Partial<JournalEntry>
        return typeof candidate.saved === 'boolean' && typeof candidate.reflection === 'string'
      })
    ) as Record<string, JournalEntry>
  } catch {
    return {}
  }
}

export function boundText(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null
  const clean = value.trim()
  if (!clean || clean.length > max) return null
  return clean
}
