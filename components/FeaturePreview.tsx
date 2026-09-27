import type { FeatureId } from '../lib/features'
import { FEATURES } from '../lib/features'
import styles from '../styles/FeaturePreview.module.css'

export function FeaturePreview({ selected, onFeed }: { selected: Exclude<FeatureId, 'feed'>; onFeed: () => void }) {
  const feature = FEATURES.find((entry) => entry.id === selected)
  if (!feature) return null
  return <section className={styles.stage} aria-labelledby="feature-title">
    <p className={styles.eyebrow}>Antre · product concept</p>
    <h1 id="feature-title">{feature.name}</h1>
    <p className={styles.description}>{feature.description}</p>
    <div className={styles.artworkFrame} role="img" aria-label="Abstract placeholder for a future artwork, not a product image"><div className={styles.shape} /></div>
    <p className={styles.disclaimer}>This experience is being designed. No artworks, venues, artists or personal data are loaded here yet.</p>
    <button type="button" onClick={onFeed}>Explore the Art Feed concept</button>
  </section>
}
