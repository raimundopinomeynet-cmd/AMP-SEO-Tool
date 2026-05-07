const express = require('express')
const router = express.Router()
const axios = require('axios')
const https = require('https')

// cPanel and some corporate networks intercept TLS; bypass cert verification
// only for outbound DataForSEO requests — does not affect incoming traffic.
const httpsAgent = new https.Agent({ rejectUnauthorized: false })

function basicAuth() {
  const login = process.env.DATAFORSEO_LOGIN
  const password = process.env.DATAFORSEO_PASSWORD
  if (!login || !password) throw new Error('DATAFORSEO_LOGIN / DATAFORSEO_PASSWORD no configurados en .env')
  return 'Basic ' + Buffer.from(`${login}:${password}`).toString('base64')
}

async function dfsPost(endpoint, body) {
  const { data } = await axios.post(
    `https://api.dataforseo.com/v3/${endpoint}`,
    body,
    {
      headers: { Authorization: basicAuth(), 'Content-Type': 'application/json' },
      timeout: 30000,
      httpsAgent,
    }
  )
  return data
}

function extractResult(data, label) {
  if (data.status_code !== 20000) {
    const err = new Error(`DataForSEO [${label}]: ${data.status_message}`)
    err.dfsCode = data.status_code
    throw err
  }
  const task = data.tasks?.[0]
  if (!task) throw new Error(`DataForSEO [${label}]: sin tareas en la respuesta`)
  if (task.status_code !== 20000) {
    const err = new Error(`DataForSEO [${label}] tarea: ${task.status_message}`)
    err.dfsCode = task.status_code
    throw err
  }
  return task.result?.[0] ?? null
}

function handleAxiosError(err, res) {
  if (err.dfsCode) return res.status(502).json({ error: err.message, status_code: err.dfsCode })
  if (err.response) {
    return res.status(502).json({
      error: `DataForSEO HTTP ${err.response.status}: ${err.response.statusText}`,
      details: err.response.data?.status_message ?? null,
    })
  }
  if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
    return res.status(504).json({ error: 'Timeout al conectar con DataForSEO (>30s)' })
  }
  return res.status(500).json({ error: err.message })
}

// POST /api/keywords/ideas
router.post('/ideas', async (req, res) => {
  const { seed_keyword, location_code, language_code } = req.body
  if (!seed_keyword || !location_code || !language_code) {
    return res.status(400).json({ error: 'Se requieren: seed_keyword, location_code, language_code' })
  }

  try {
    const data = await dfsPost('dataforseo_labs/google/keyword_ideas/live', [
      { keywords: [seed_keyword], location_code: Number(location_code), language_code, limit: 50 },
    ])

    const result = extractResult(data, 'keyword_ideas')
    const items  = result?.items ?? []

    const keywords = items.map((item) => ({
      keyword:            item.keyword ?? '',
      search_volume:      item.keyword_info?.search_volume ?? 0,
      keyword_difficulty: item.keyword_properties?.keyword_difficulty ?? null,
      cpc:                item.keyword_info?.cpc ?? null,
      competition:        item.keyword_info?.competition ?? null,
      competition_level:  item.keyword_info?.competition_level ?? null,
    }))

    return res.json({ keywords, total: result?.total_count ?? keywords.length })
  } catch (err) {
    return handleAxiosError(err, res)
  }
})

// POST /api/keywords/serp
router.post('/serp', async (req, res) => {
  const { keyword, location_code, language_code } = req.body
  if (!keyword || !location_code || !language_code) {
    return res.status(400).json({ error: 'Se requieren: keyword, location_code, language_code' })
  }

  try {
    const data = await dfsPost('serp/google/organic/live/advanced', [
      { keyword, location_code: Number(location_code), language_code, depth: 10 },
    ])

    const result = extractResult(data, 'serp')
    const items  = (result?.items ?? []).filter((i) => i.type === 'organic')

    const results = items.map((item) => ({
      position:    item.rank_group ?? item.rank_absolute ?? null,
      title:       item.title ?? '',
      url:         item.url ?? '',
      description: item.description ?? '',
      domain:      item.domain ?? '',
    }))

    return res.json({ results, keyword })
  } catch (err) {
    return handleAxiosError(err, res)
  }
})

module.exports = router
