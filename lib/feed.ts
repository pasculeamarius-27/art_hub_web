export const GUEST_WORK_LIMIT = 10 as const
export type Access = { kind: 'guest' } | { kind: 'account'; userId: string }
export type FeedItem = {
  id: string
  title: string
  artistLabel: string
  material: string
  context: string
  publicApproved: boolean
  artworkImage?: string
}
export type FeedWindow = { visible: FeedItem[]; nextCursor: number | null; gate: boolean }

/** Only published/approved works enter the feed. Cursor counts unique visible works. */
export function feedWindow(items: readonly FeedItem[], access: Access, cursor: number, pageSize = 4): FeedWindow {
  if (!Number.isSafeInteger(cursor) || cursor < 0 || !Number.isSafeInteger(pageSize) || pageSize < 1 || pageSize > 20) throw new RangeError('Invalid feed page request')
  const seen = new Set<string>()
  const approved = items.filter((item) => {
    if (!item.publicApproved || !item.id || seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })
  const limit = access.kind === 'guest' ? Math.min(GUEST_WORK_LIMIT, approved.length) : approved.length
  const visible = approved.slice(Math.min(cursor, limit), Math.min(cursor + pageSize, limit))
  const end = Math.min(cursor + visible.length, limit)
  return { visible, nextCursor: end < limit ? end : null, gate: access.kind === 'guest' && end >= limit && approved.length > limit }
}

/** A previously shown public work remains readable even at the end of the guest window. */
export function publicContextFor(items: readonly FeedItem[], id: string, visibleIds: ReadonlySet<string>): FeedItem | null {
  if (!visibleIds.has(id)) return null
  return items.find((item) => item.id === id && item.publicApproved) ?? null
}

export const DEMO_FEED: FeedItem[] = Array.from({ length: 12 }, (_, index) => {
  const number = index + 1
  return {
    id: `demo-work-${number}`,
    title: `Study ${String(number).padStart(2, '0')}`,
    artistLabel: 'Illustrative study',
    material: number % 2 === 0 ? 'Form · light' : 'Surface · memory',
    context: 'An illustrative prompt to look closely at material and form. This is not an artist statement or a real artwork record.',
    publicApproved: true,
  }
})
