import styles from '../styles/Onboarding.module.css'
import type { OnboardingChoice } from '../lib/onboarding'

export function Onboarding({ onComplete }: { onComplete: (choice: OnboardingChoice) => void }) {
  return <main className={styles.screen} aria-labelledby="welcome-title">
    <div className={styles.inner}>
      <p className={styles.eyebrow}>A place for looking closer</p>
      <h1 id="welcome-title">Every artwork has more to say.</h1>
      <p className={styles.lede}>Follow a work that catches your eye. Read its context, then ask a question when you are ready.</p>
      <div className={styles.frame} role="img" aria-label="Abstract sample composition, not an actual artwork"><div className={styles.work} /></div>
      <p className={styles.note}>Explore first. No email, camera or location needed to begin. The works shown in this build are examples, not published artists or exhibitions.</p>
      <div className={styles.actions}>
        <button type="button" className={styles.primary} onClick={() => onComplete('explore')}>Explore works <span aria-hidden="true">↗</span></button>
        <button type="button" className={styles.secondary} onClick={() => onComplete('learn')}>See the experiences</button>
      </div>
      <p className={styles.privacy}>Saving a private journal or joining a conversation may need an account later. You can look first.</p>
    </div>
  </main>
}
