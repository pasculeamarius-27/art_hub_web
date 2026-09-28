import { useEffect, useMemo, useState } from 'react'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { ONBOARDING_KEY, OnboardingChoice, readOnboarding } from '../lib/onboarding'
import { Onboarding } from '../components/Onboarding'
import { ArtFeed } from '../components/ArtFeed'
import { FEATURES, FeatureId } from '../lib/features'
import { FeatureNavigation } from '../components/FeatureNavigation'
import { FeaturePreview } from '../components/FeaturePreview'
import { DEMO_ARTWORKS, MODES, CompanionMode, JourneyPhase, JournalEntry, readJournal } from '../lib/domain'

interface Artist { name: string; bio: string }
interface Artwork { id: string; title: string; medium: string; price: number; imageBase64: string; aiDescription?: string; approvedSource?: string; createdAt: string }

type Area = 'companion' | 'studio'
const JOURNAL_KEY = 'kulth:demo-journal:v1'

export default function Home() {
  const [area, setArea] = useState<Area>('companion')
  const [feature, setFeature] = useState<FeatureId>('feed')
  const [onboarded, setOnboarded] = useState<boolean | null>(null)
  const [phase, setPhase] = useState<JourneyPhase>('during')
  const [artworkIndex, setArtworkIndex] = useState(0)
  const [mode, setMode] = useState<CompanionMode>('look')
  const [journal, setJournal] = useState<Record<string, JournalEntry>>({})
  const [reflection, setReflection] = useState('')
  const [showSources, setShowSources] = useState(false)

  const [artist, setArtist] = useState<Artist | null>(null)
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null)
  const [profileName, setProfileName] = useState('')
  const [profileBio, setProfileBio] = useState('')
  const [artworkTitle, setArtworkTitle] = useState('')
  const [artworkMedium, setArtworkMedium] = useState('')
  const [artworkPrice, setArtworkPrice] = useState('')
  const [artworkImage, setArtworkImage] = useState<string | null>(null)
  const [artworkSource, setArtworkSource] = useState('')
  const [showArtworkForm, setShowArtworkForm] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [notice, setNotice] = useState('')

  const artwork = DEMO_ARTWORKS[artworkIndex]
  const currentJournal = journal[artwork.id]
  const savedCount = Object.values(journal).filter((entry) => entry.saved).length

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('area') === 'studio') setArea('studio')
    setOnboarded(Boolean(readOnboarding(localStorage.getItem(ONBOARDING_KEY))))
    setJournal(readJournal(localStorage.getItem(JOURNAL_KEY)))
    try {
      const savedArtist = localStorage.getItem('artist')
      const savedArtworks = localStorage.getItem('artworks')
      if (savedArtist) {
        const parsed = JSON.parse(savedArtist)
        if (parsed && typeof parsed.name === 'string' && typeof parsed.bio === 'string') {
          setArtist(parsed); setProfileName(parsed.name); setProfileBio(parsed.bio)
        }
      }
      if (savedArtworks) {
        const parsed = JSON.parse(savedArtworks)
        if (Array.isArray(parsed)) setArtworks(parsed)
      }
    } catch { setNotice('Some older local demo data could not be read. Your browser data was not changed.') }
  }, [])

  useEffect(() => { setReflection(currentJournal?.reflection || '') }, [artwork.id, currentJournal?.reflection])

  const phaseCopy = useMemo(() => ({
    before: { eyebrow: 'Before the visit', title: 'Arrive with one good question', text: 'A two-minute orientation, shaped by the exhibition rather than a generic audio guide.' },
    during: { eyebrow: `During the visit · ${artwork.room}`, title: artwork.title, text: artwork.statement },
    after: { eyebrow: 'After the visit', title: 'Keep what stayed with you', text: 'Return to saved works, your own words and the artist-approved sources behind the experience.' },
  })[phase], [phase, artwork])

  const completeOnboarding = (choice: OnboardingChoice) => {
    try { localStorage.setItem(ONBOARDING_KEY, JSON.stringify({ choice, complete: true })) } catch { /* Demo stays usable if storage is unavailable. */ }
    setOnboarded(true)
    setFeature(choice === 'learn' ? 'chat' : 'feed')
  }

  const persistJournal = (entry: JournalEntry) => {
    const updated = { ...journal, [artwork.id]: entry }
    setJournal(updated)
    localStorage.setItem(JOURNAL_KEY, JSON.stringify(updated))
  }

  const toggleSave = () => persistJournal({ artworkId: artwork.id, saved: !currentJournal?.saved, reflection, updatedAt: new Date().toISOString() })
  const saveReflection = () => {
    persistJournal({ artworkId: artwork.id, saved: currentJournal?.saved || false, reflection: reflection.trim().slice(0, 800), updatedAt: new Date().toISOString() })
    setNotice('Reflection saved in this browser only.')
  }

  const saveProfile = () => {
    if (!profileName.trim() || !profileBio.trim()) return setNotice('Add both a name and an artist statement.')
    const next = { name: profileName.trim(), bio: profileBio.trim() }
    setArtist(next); localStorage.setItem('artist', JSON.stringify(next)); setNotice('Studio profile saved locally.')
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > 1_500_000) return setNotice('For this local demo, choose an image below 1.5 MB.')
    const reader = new FileReader(); reader.onload = (e) => setArtworkImage(e.target?.result as string); reader.readAsDataURL(file)
  }

  const saveArtwork = () => {
    const price = Number(artworkPrice)
    if (!artworkTitle.trim() || !artworkMedium.trim() || !artworkImage || !Number.isFinite(price) || price < 0) return setNotice('Add a title, medium, valid price and image.')
    const next: Artwork = { id: crypto.randomUUID(), title: artworkTitle.trim(), medium: artworkMedium.trim(), price, imageBase64: artworkImage, approvedSource: artworkSource.trim(), createdAt: new Date().toISOString() }
    const updated = [...artworks, next]
    setArtworks(updated); localStorage.setItem('artworks', JSON.stringify(updated)); setShowArtworkForm(false)
    setArtworkTitle(''); setArtworkMedium(''); setArtworkPrice(''); setArtworkImage(null); setArtworkSource(''); setNotice('Artwork saved locally. It is not published.')
  }

  const generateDescription = async () => {
    if (!selectedArtwork || !artist) return
    if (!selectedArtwork.approvedSource?.trim()) return setNotice('Add an artist-approved source before generating mediation.')
    setIsGenerating(true); setNotice('')
    try {
      const response = await fetch('/api/generate-description', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: selectedArtwork.title, medium: selectedArtwork.medium, artistName: artist.name, artistBio: artist.bio, approvedSource: selectedArtwork.approvedSource }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Generation failed')
      const updated = artworks.map((item) => item.id === selectedArtwork.id ? { ...item, aiDescription: data.description } : item)
      setArtworks(updated); localStorage.setItem('artworks', JSON.stringify(updated)); setSelectedArtwork({ ...selectedArtwork, aiDescription: data.description }); setNotice('Draft mediation generated. Human approval is still required before publishing.')
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Generation failed') } finally { setIsGenerating(false) }
  }

  return (
    <>
      <Head><title>Antre · Every artwork has more to say</title><meta name="description" content="A product concept for a personal companion in art." /><meta name="viewport" content="width=device-width, initial-scale=1" /></Head>
      <div className={styles.shell}>
        <header className={styles.topbar}>
          <button className={styles.wordmark} onClick={() => { setArea('companion'); setFeature('feed') }} aria-label="Open Antre companion">Antre<span>.</span></button>
          <nav aria-label="Product areas" className={styles.areaNav}>
            <button className={area === 'companion' ? styles.activeArea : ''} onClick={() => { setArea('companion'); setFeature('feed') }}>Explore</button>
            <button className={area === 'studio' ? styles.activeArea : ''} onClick={() => setArea('studio')}>Art Voice</button>
          </nav>
          <div className={styles.demoBadge}>Concept build · local data</div>
        </header>

        {area === 'companion' && onboarded && <FeatureNavigation selected={feature} onSelect={setFeature} />}

        {notice && <div className={styles.notice} role="status"><span>{notice}</span><button onClick={() => setNotice('')} aria-label="Dismiss notice">×</button></div>}

        {area === 'companion' && onboarded === false ? <Onboarding onComplete={completeOnboarding} /> : area === 'companion' && onboarded === null ? <main aria-busy="true" /> : area === 'companion' && feature === 'feed' ? <ArtFeed /> : area === 'companion' && feature !== 'feed' ? <FeaturePreview selected={feature} onFeed={() => setFeature('feed')} /> : area === 'companion' ? (
          <main className={styles.companion}>
            <aside className={styles.rail}>
              <p className={styles.railLabel}>Your visit</p>
              {(['before', 'during', 'after'] as JourneyPhase[]).map((item, index) => <button key={item} onClick={() => setPhase(item)} className={phase === item ? styles.activePhase : ''}><span>0{index + 1}</span>{item[0].toUpperCase() + item.slice(1)}</button>)}
              <div className={styles.visitMeta}><span>{savedCount}</span><p>works saved<br />in this browser</p></div>
            </aside>

            <section className={styles.stage}>
              <div className={styles.stageIntro}><p className={styles.eyebrow}>{phaseCopy.eyebrow}</p><h1>{phaseCopy.title}</h1><p className={styles.lede}>{phaseCopy.text}</p></div>

              {phase === 'before' && <div className={styles.beforeCard}><p className={styles.micro}>A gentle starting point</p><h2>What changes when an artwork refuses to stay still?</h2><p>This demo exhibition follows surfaces, vessels and the way context changes with your position.</p><button onClick={() => setPhase('during')} className={styles.primaryAction}>Begin in Room 2 <span>↗</span></button></div>}

              {phase === 'during' && <>
                <div className={styles.artworkVisual} style={{ '--accent': artwork.accent } as React.CSSProperties} aria-label={`Abstract representation for ${artwork.title}`}><span className={styles.orbitOne} /><span className={styles.orbitTwo} /><span className={styles.artifactCore} /><p>{artwork.artist}<br /><small>{artwork.year} · {artwork.medium}</small></p></div>
                <div className={styles.modeGrid}>{MODES.map((item) => <button key={item.id} className={mode === item.id ? styles.activeMode : ''} onClick={() => setMode(item.id)}><span>{item.eyebrow}</span>{item.label}</button>)}</div>
                <article className={styles.responseCard}><div><p className={styles.micro}>{MODES.find((item) => item.id === mode)?.eyebrow}</p><p className={styles.response}>{artwork.prompts[mode]}</p></div><div className={styles.responseActions}><button onClick={() => setShowSources(!showSources)}>{showSources ? 'Hide sources' : `View ${artwork.sources.length} sources`}</button><button onClick={toggleSave}>{currentJournal?.saved ? 'Saved ✓' : 'Save work'}</button></div>{showSources && <div className={styles.sources}>{artwork.sources.map((source) => <div key={source.id}><strong>{source.label}</strong><p>“{source.excerpt}”</p></div>)}</div>}</article>
                <div className={styles.artworkSwitch}><button onClick={() => { setArtworkIndex((artworkIndex - 1 + DEMO_ARTWORKS.length) % DEMO_ARTWORKS.length); setShowSources(false) }}>← Previous</button><span>{artworkIndex + 1} / {DEMO_ARTWORKS.length}</span><button onClick={() => { setArtworkIndex((artworkIndex + 1) % DEMO_ARTWORKS.length); setShowSources(false) }}>Next →</button></div>
              </>}

              {phase === 'after' && <div className={styles.afterGrid}><div className={styles.journalCard}><p className={styles.micro}>Your private note</p><label htmlFor="reflection">What are you still thinking about?</label><textarea id="reflection" maxLength={800} value={reflection} onChange={(e) => setReflection(e.target.value)} placeholder="Write in your own words…" /><div><small>{reflection.length}/800</small><button className={styles.primaryAction} onClick={saveReflection}>Save reflection</button></div></div><div className={styles.savedCard}><p className={styles.micro}>Visit thread</p><h2>{savedCount ? `${savedCount} work${savedCount === 1 ? '' : 's'} saved` : 'No works saved yet'}</h2><p>Your journal stays on this device in the concept build. A production account and consent model are part of the technical roadmap.</p><button onClick={() => setPhase('during')}>Return to the exhibition</button></div></div>}
            </section>
          </main>
        ) : (
          <main className={styles.studio}>
            <div className={styles.studioHeader}><div><p className={styles.eyebrow}>Art Voice · local prototype</p><h1>Build the source of truth before asking AI to speak.</h1></div><p>This workspace preserves the original MVP flow while making the cultural-approval boundary explicit. Nothing here is published or synced.</p></div>
            <section className={styles.studioGrid}>
              <div className={styles.panel}><p className={styles.panelNumber}>01</p><h2>Artist identity</h2><label>Artist name<input value={profileName} onChange={(e) => setProfileName(e.target.value)} /></label><label>Artist statement<textarea rows={6} value={profileBio} onChange={(e) => setProfileBio(e.target.value)} /></label><button className={styles.primaryAction} onClick={saveProfile}>Save locally</button>{artist && <p className={styles.successLine}>Current local profile: {artist.name}</p>}</div>
              <div className={styles.panel}><div className={styles.panelHeading}><div><p className={styles.panelNumber}>02</p><h2>Artwork records</h2></div><button onClick={() => setShowArtworkForm(!showArtworkForm)}>{showArtworkForm ? 'Close' : '+ Add artwork'}</button></div>
                {showArtworkForm && artist && <div className={styles.artworkForm}><label>Title<input value={artworkTitle} onChange={(e) => setArtworkTitle(e.target.value)} /></label><label>Medium<input value={artworkMedium} onChange={(e) => setArtworkMedium(e.target.value)} /></label><label>Price hypothesis (€)<input type="number" min="0" step="0.01" value={artworkPrice} onChange={(e) => setArtworkPrice(e.target.value)} /></label><label>Image (under 1.5 MB)<input type="file" accept="image/*" onChange={handleImageUpload} /></label><label>Artist-approved source excerpt<textarea rows={5} value={artworkSource} onChange={(e) => setArtworkSource(e.target.value)} placeholder="Paste the exact approved material the draft may use." /></label><button className={styles.primaryAction} onClick={saveArtwork}>Save unpublished record</button></div>}
                {!artist && <p className={styles.emptyState}>Create the artist identity first.</p>}
                {artist && !artworks.length && !showArtworkForm && <p className={styles.emptyState}>No local artwork records yet.</p>}
                <div className={styles.recordList}>{artworks.map((item) => <button key={item.id} onClick={() => setSelectedArtwork(item)}><img src={item.imageBase64} alt="" /><span><strong>{item.title}</strong><small>{item.medium} · {item.approvedSource ? 'source attached' : 'source missing'}</small></span><span>Open →</span></button>)}</div>
              </div>
            </section>
          </main>
        )}

        {selectedArtwork && <div className={styles.modal} role="dialog" aria-modal="true" aria-label={`${selectedArtwork.title} draft mediation`}><div className={styles.modalContent}><button className={styles.close} onClick={() => setSelectedArtwork(null)} aria-label="Close">×</button><img src={selectedArtwork.imageBase64} alt={selectedArtwork.title} /><p className={styles.eyebrow}>Unpublished studio record</p><h2>{selectedArtwork.title}</h2><p>{selectedArtwork.medium} · €{selectedArtwork.price.toFixed(2)}</p><div className={styles.sourceBox}><strong>Approved source supplied</strong><p>{selectedArtwork.approvedSource || 'No approved source yet.'}</p></div>{selectedArtwork.aiDescription && <div className={styles.draftBox}><strong>AI mediation draft</strong><p>{selectedArtwork.aiDescription}</p></div>}<button className={styles.primaryAction} disabled={isGenerating || !selectedArtwork.approvedSource} onClick={generateDescription}>{isGenerating ? 'Generating…' : 'Generate grounded draft'}</button><small className={styles.disclaimer}>Uses a server-configured model key. A generated draft still needs human approval.</small></div></div>}
        <footer className={styles.footer}><span>Antre</span><p>Every artwork has more to say.</p><p>Foundation branch · not production</p></footer>
      </div>
    </>
  )
}
