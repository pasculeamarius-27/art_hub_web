import { useState } from 'react'
import { DEMO_FEED, feedWindow, publicContextFor } from '../lib/feed'
import styles from '../styles/ArtFeed.module.css'

const PAGE_SIZE = 4
export function ArtFeed() {
  const [shown, setShown] = useState(PAGE_SIZE)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const page = feedWindow(DEMO_FEED, { kind: 'guest' }, 0, Math.min(shown, 20))
  const selected = selectedId ? publicContextFor(DEMO_FEED, selectedId, new Set(page.visible.map((item) => item.id))) : null
  return <main className={styles.page} aria-labelledby="feed-title">
    <header className={styles.intro}><p>Art Feed · illustrative concept</p><h1 id="feed-title">Artworks worth a closer look.</h1><span>Begin without an account. Explore a few works and follow what catches your eye.</span></header>
    <p className={styles.disclosure}>These abstract studies are placeholders, not artworks by real artists. There are no gallery sources or live recommendations connected to this demo.</p>
    <ol className={styles.grid}>{page.visible.map((item, index) => <li key={item.id}><button type="button" className={styles.work} onClick={() => setSelectedId(item.id)} aria-label={`Open context for ${item.title}`}><span className={styles.image} aria-hidden="true"><span className={styles.shape} style={{ transform: `rotate(${index * 19}deg)` }} /></span><span className={styles.meta}><span>{item.artistLabel}</span><strong>{item.title}</strong><small>{item.material}</small></span></button></li>)}</ol>
    {!page.gate && page.nextCursor !== null && <button type="button" className={styles.more} onClick={() => setShown((current) => Math.min(current + PAGE_SIZE, 10))}>See more studies</button>}
    {page.gate && <section className={styles.gate} aria-labelledby="gate-title"><p>You've explored 10 studies</p><h2 id="gate-title">There is more to discover.</h2><span>An account will unlock the rest of the Feed, saved works and a personal journey. Signup is not active in this local concept, so nothing is sent or collected.</span><button type="button" disabled aria-disabled="true">Create an account · coming later</button></section>}
    {selected && <div className={styles.overlay} role="presentation" onClick={() => setSelectedId(null)}><section className={styles.detail} role="dialog" aria-modal="true" aria-labelledby="detail-title" onClick={(event) => event.stopPropagation()}><button type="button" className={styles.close} onClick={() => setSelectedId(null)} aria-label="Close artwork context">×</button><div className={styles.detailImage} aria-hidden="true" /><p>Illustrative study · not an artist source</p><h2 id="detail-title">{selected.title}</h2><p>{selected.context}</p><small>In the real product, only artist-approved public sources should appear here, with author and provenance. This demo makes no such claim.</small></section></div>}
  </main>
}
