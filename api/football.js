// Vercel Serverless Function — proxy per API-Football
// Evita problemi CORS chiamando l'API lato server

export default async function handler(req, res) {
  // Accetta solo GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = req.headers['x-apisports-key']
  if (!apiKey) {
    return res.status(400).json({ error: 'Missing x-apisports-key header' })
  }

  // Prendi il path dall'URL: /api/football?path=/fixtures?league=1&season=2026
  const path = req.query.path
  if (!path) {
    return res.status(400).json({ error: 'Missing path query parameter' })
  }

  try {
    const apiUrl = `https://v3.football.api-sports.io${path}`
    const response = await fetch(apiUrl, {
      headers: {
        'x-apisports-key': apiKey,
      },
    })

    const data = await response.json()

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Headers', 'x-apisports-key')

    return res.status(response.status).json(data)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
