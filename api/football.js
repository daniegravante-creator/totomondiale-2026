// Vercel Serverless Function — proxy per API-Football
// Supporta sia api-sports.io (diretto) che RapidAPI

export default async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Headers', 'x-apisports-key')
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = req.headers['x-apisports-key']
  if (!apiKey) {
    return res.status(400).json({ error: 'Missing x-apisports-key header' })
  }

  const path = req.query.path
  if (!path) {
    return res.status(400).json({ error: 'Missing path query parameter' })
  }

  // Prova prima con api-sports.io (header x-apisports-key)
  // Se fallisce con 403, riprova con RapidAPI (header x-rapidapi-key)
  const attempts = [
    {
      url: `https://v3.football.api-sports.io${path}`,
      headers: { 'x-apisports-key': apiKey },
    },
    {
      url: `https://v3.football.api-sports.io${path}`,
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'v3.football.api-sports.io',
      },
    },
  ]

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'x-apisports-key')

  for (const attempt of attempts) {
    try {
      const response = await fetch(attempt.url, { headers: attempt.headers })
      const data = await response.json()

      // Se la risposta ha errori di token, prova il prossimo metodo
      if (data.errors && data.errors.token) {
        continue
      }

      return res.status(response.status).json(data)
    } catch (error) {
      continue
    }
  }

  return res.status(403).json({
    error: 'API key non valida per nessun provider. Verifica la chiave su dashboard.api-sports.io o rapidapi.com'
  })
}
