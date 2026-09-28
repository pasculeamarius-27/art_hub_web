import type { FeatureId } from '../lib/features'
import { FEATURES } from '../lib/features'
import styles from '../styles/FeatureNavigation.module.css'

type Props = { selected: FeatureId; onSelect: (feature: FeatureId) => void }

export function FeatureNavigation({ selected, onSelect }: Props) {
  return <nav className={styles.nav} aria-label="Antre experiences">
    {FEATURES.map((feature) => <button key={feature.id} type="button" aria-current={selected === feature.id ? 'page' : undefined} className={selected === feature.id ? styles.active : ''} onClick={() => onSelect(feature.id)}><span>{feature.cue}</span>{feature.name}</button>)}
  </nav>
}
