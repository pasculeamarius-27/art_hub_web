import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { apiKey, title, medium, artistName, artistBio } = req.body

  if (!apiKey || !title || !medium || !artistName || !artistBio) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const prompt = `You are an art curator and cultural mediator. Generate a compelling, engaging description of this artwork that will help attract buyers and convey its cultural and artistic significance. Keep it to 2-3 sentences.

Artwork:
Title: ${title}
Medium: ${medium}
Artist: ${artistName}
Artist Bio: ${artistBio}

Generate a culturally aware, engaging description:`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      return res.status(response.status).json({ error: error.error?.message || 'API error' })
    }

    const data = await response.json()
    const description = data.content[0].text.trim()

    res.status(200).json({ description })
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' })
  }
}
