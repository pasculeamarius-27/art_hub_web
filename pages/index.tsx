import { useState, useEffect } from 'react'
import styles from '../styles/Home.module.css'

interface Artist {
  name: string
  bio: string
}

interface Artwork {
  id: string
  title: string
  medium: string
  price: number
  imageBase64: string
  aiDescription?: string
  createdAt: string
}

export default function Home() {
  const [tab, setTab] = useState<'gallery' | 'profile'>('profile')
  const [artist, setArtist] = useState<Artist | null>(null)
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null)
  const [apiKey, setApiKey] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  // Profile form
  const [profileName, setProfileName] = useState('')
  const [profileBio, setProfileBio] = useState('')

  // Artwork form
  const [artworkTitle, setArtworkTitle] = useState('')
  const [artworkMedium, setArtworkMedium] = useState('')
  const [artworkPrice, setArtworkPrice] = useState('')
  const [artworkImage, setArtworkImage] = useState<string | null>(null)
  const [showArtworkForm, setShowArtworkForm] = useState(false)

  // Load data from localStorage on mount
  useEffect(() => {
    const savedArtist = localStorage.getItem('artist')
    const savedArtworks = localStorage.getItem('artworks')

    if (savedArtist) {
      const parsed = JSON.parse(savedArtist)
      setArtist(parsed)
      setProfileName(parsed.name)
      setProfileBio(parsed.bio)
    }

    if (savedArtworks) {
      setArtworks(JSON.parse(savedArtworks))
    }
  }, [])

  // Save profile
  const saveProfile = () => {
    if (!profileName.trim() || !profileBio.trim()) {
      alert('Please fill in all fields')
      return
    }

    const newArtist = { name: profileName, bio: profileBio }
    setArtist(newArtist)
    localStorage.setItem('artist', JSON.stringify(newArtist))
    alert('Profile saved!')
  }

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setArtworkImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Save artwork
  const saveArtwork = () => {
    if (!artworkTitle.trim() || !artworkMedium.trim() || !artworkPrice.trim() || !artworkImage) {
      alert('Please fill in all fields and select an image')
      return
    }

    const newArtwork: Artwork = {
      id: Date.now().toString(),
      title: artworkTitle,
      medium: artworkMedium,
      price: parseFloat(artworkPrice),
      imageBase64: artworkImage,
      createdAt: new Date().toISOString(),
    }

    const updated = [...artworks, newArtwork]
    setArtworks(updated)
    localStorage.setItem('artworks', JSON.stringify(updated))

    // Reset form
    setArtworkTitle('')
    setArtworkMedium('')
    setArtworkPrice('')
    setArtworkImage(null)
    setShowArtworkForm(false)
    alert('Artwork added!')
  }

  // Generate AI description
  const generateDescription = async () => {
    if (!selectedArtwork || !artist) return

    if (!apiKey.trim()) {
      alert('Please enter your Claude API key')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey,
          title: selectedArtwork.title,
          medium: selectedArtwork.medium,
          artistName: artist.name,
          artistBio: artist.bio,
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`)
      }

      const data = await response.json()
      const description = data.description

      // Update artwork with description
      const updated = artworks.map((a) =>
        a.id === selectedArtwork.id ? { ...a, aiDescription: description } : a
      )
      setArtworks(updated)
      localStorage.setItem('artworks', JSON.stringify(updated))
      setSelectedArtwork({ ...selectedArtwork, aiDescription: description })
      alert('Description generated!')
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>🎨 ArtHub</h1>
        <p>AI-powered cultural mediation for independent artists</p>
      </header>

      <nav className={styles.nav}>
        <button
          className={`${styles.navBtn} ${tab === 'profile' ? styles.active : ''}`}
          onClick={() => setTab('profile')}
        >
          Profile
        </button>
        <button
          className={`${styles.navBtn} ${tab === 'gallery' ? styles.active : ''}`}
          onClick={() => setTab('gallery')}
        >
          Gallery
        </button>
      </nav>

      <main className={styles.main}>
        {/* PROFILE TAB */}
        {tab === 'profile' && (
          <div className={styles.section}>
            <h2>Artist Profile</h2>
            <div className={styles.form}>
              <div className={styles.formGroup}>
                <label>Artist Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Your name"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Bio / Artist Statement</label>
                <textarea
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                  placeholder="Tell us about your art practice..."
                  rows={5}
                />
              </div>

              <button onClick={saveProfile} className={styles.primaryBtn}>
                Save Profile
              </button>
            </div>

            {artist && (
              <div className={styles.card}>
                <h3>Current Profile</h3>
                <p><strong>Name:</strong> {artist.name}</p>
                <p><strong>Bio:</strong> {artist.bio}</p>
              </div>
            )}
          </div>
        )}

        {/* GALLERY TAB */}
        {tab === 'gallery' && (
          <div className={styles.section}>
            <div className={styles.galleryHeader}>
              <h2>Artwork Gallery</h2>
              <button onClick={() => setShowArtworkForm(!showArtworkForm)} className={styles.primaryBtn}>
                + Add Artwork
              </button>
            </div>

            {!artist && (
              <div className={styles.warning}>
                Please create an artist profile first
              </div>
            )}

            {/* Artwork Form */}
            {showArtworkForm && artist && (
              <div className={styles.form}>
                <div className={styles.formGroup}>
                  <label>Artwork Title</label>
                  <input
                    type="text"
                    value={artworkTitle}
                    onChange={(e) => setArtworkTitle(e.target.value)}
                    placeholder="Title"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Medium</label>
                  <input
                    type="text"
                    value={artworkMedium}
                    onChange={(e) => setArtworkMedium(e.target.value)}
                    placeholder="e.g., Oil on Canvas"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Price ($)</label>
                  <input
                    type="number"
                    value={artworkPrice}
                    onChange={(e) => setArtworkPrice(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Image</label>
                  <input type="file" accept="image/*" onChange={handleImageUpload} />
                  {artworkImage && (
                    <div className={styles.imagePreview}>
                      <img src={artworkImage} alt="Preview" />
                    </div>
                  )}
                </div>

                <div className={styles.formActions}>
                  <button onClick={saveArtwork} className={styles.primaryBtn}>
                    Save Artwork
                  </button>
                  <button onClick={() => setShowArtworkForm(false)} className={styles.secondaryBtn}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Artwork Grid */}
            {artworks.length === 0 ? (
              <p className={styles.empty}>No artworks yet. Add one to get started!</p>
            ) : (
              <div className={styles.grid}>
                {artworks.map((artwork) => (
                  <div
                    key={artwork.id}
                    className={styles.card}
                    onClick={() => setSelectedArtwork(artwork)}
                  >
                    <img src={artwork.imageBase64} alt={artwork.title} />
                    <h3>{artwork.title}</h3>
                    <p className={styles.price}>${artwork.price.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Artwork Detail Modal */}
      {selectedArtwork && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <button className={styles.closeBtn} onClick={() => setSelectedArtwork(null)}>×</button>

            <img src={selectedArtwork.imageBase64} alt={selectedArtwork.title} className={styles.modalImage} />

            <div className={styles.modalDetails}>
              <h2>{selectedArtwork.title}</h2>
              <p className={styles.medium}>{selectedArtwork.medium}</p>
              <p className={styles.modalPrice}>${selectedArtwork.price.toFixed(2)}</p>

              <div className={styles.description}>
                <h3>AI-Generated Description</h3>
                {selectedArtwork.aiDescription ? (
                  <p>{selectedArtwork.aiDescription}</p>
                ) : (
                  <p className={styles.noDescription}>No description yet. Generate one to create an engaging cultural narrative.</p>
                )}
              </div>

              <div className={styles.apiSection}>
                <input
                  type="password"
                  placeholder="Claude API Key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className={styles.apiInput}
                />
                <button
                  onClick={generateDescription}
                  disabled={isGenerating}
                  className={styles.primaryBtn}
                >
                  {isGenerating ? 'Generating...' : 'Generate AI Description'}
                </button>
              </div>

              <p className={styles.hint}>
                Get your API key at <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer">console.anthropic.com</a>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
