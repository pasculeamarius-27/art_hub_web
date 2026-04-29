# ArtHub - Web Version

A digital hub for contemporary visual artists to showcase their work and improve sales conversion using AI cultural mediation.

## Features

- **Artist Profile**: Create and manage your artist profile with name and bio
- **Artwork Gallery**: Upload and manage your artworks with title, medium, and price
- **AI Descriptions**: Generate compelling, culturally-aware artwork descriptions using Claude API
- **Local Storage**: All data is saved in your browser's local storage (no backend needed)
- **Responsive Design**: Works on desktop, tablet, and mobile

## Quick Start - Deploy to Vercel (Recommended)

The easiest way to see your app live:

1. **Create a GitHub account** (if you don't have one): [github.com](https://github.com)

2. **Create a Vercel account**: [vercel.com](https://vercel.com)
   - Sign up with GitHub

3. **Push this project to GitHub**:
   ```bash
   cd C:\Users\pascu\Documents\Claude\art_hub_web
   git init
   git add .
   git commit -m "Initial commit: ArtHub web app"
   git remote add origin https://github.com/YOUR_USERNAME/art_hub_web.git
   git branch -M main
   git push -u origin main
   ```
   (Replace `YOUR_USERNAME` with your actual GitHub username)

4. **Deploy to Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Click "Deploy"
   - Your app will be live in ~2 minutes!

You'll get a URL like: `https://art-hub-web.vercel.app`

## Run Locally (Optional)

If you want to run it on your machine:

```bash
cd C:\Users\pascu\Documents\Claude\art_hub_web

# Install dependencies
npm install

# Run development server
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## Using the App

### 1. Artist Profile
- Go to **Profile** tab
- Enter your artist name and bio
- Click **Save Profile**

### 2. Add Artwork
- Go to **Gallery** tab
- Click **+ Add Artwork**
- Upload an image
- Enter title, medium, and price
- Click **Save Artwork**

### 3. Generate AI Description
- Click any artwork in your gallery
- Enter your **Claude API Key** (get it free at [console.anthropic.com](https://console.anthropic.com))
- Click **Generate AI Description**
- The AI will create a compelling description for your artwork

## Getting a Claude API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up or log in
3. Go to "API Keys"
4. Create a new API key
5. Paste it into the app when generating descriptions

**Note**: You only pay for API calls you use. Claude is very affordable - generating one description costs fractions of a cent.

## Data Storage

All your artist profile and artwork data is stored in your browser's local storage. It will persist even if you close and reopen the browser (as long as you don't clear your browser data).

## Technology Stack

- **Next.js**: React framework for web development
- **TypeScript**: Type-safe JavaScript
- **Claude API**: AI for generating artwork descriptions
- **Vercel**: Hosting and deployment

## Support

Get your Claude API key at: [console.anthropic.com](https://console.anthropic.com)

Questions? Reach out to Anthropic support or check the Claude documentation.
