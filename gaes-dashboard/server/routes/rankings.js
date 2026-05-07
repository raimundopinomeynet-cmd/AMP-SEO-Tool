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

// POST /api/rankings/organic
router.post('/organic', async (req, res) => {
  const { domain, location_code, language_code } = req.body

  if (!domain || !location_code || !language_code) {
    return res.status(400).json({ error: 'Se requieren: domain, location_code, language_code' })
  }

  let auth
  try {
    auth = basicAuth()
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }

  try {
    const { data } = await axios.post(
      'https://api.dataforseo.com/v3/dataforseo_labs/google/ranked_keywords/live',
      [{ target: domain, location_code: Number(location_code), language_code, limit: 100 }],
      {
        headers: { Authorization: auth, 'Content-Type': 'application/json' },
        timeout: 30000,
        httpsAgent,
      }
    )

    // Top-level status check
    if (data.status_code !== 20000) {
      return res.status(502).json({
        error: `DataForSEO: ${data.status_message}`,
        status_code: data.status_code,
      })
    }

    const task = data.tasks?.[0]
    if (!task) {
      return res.status(502).json({ error: 'DataForSEO no devolvió tareas en la respuesta' })
    }

    // Task-level status check
    if (task.status_code !== 20000) {
      return res.status(502).json({
        error: `DataForSEO tarea: ${task.status_message}`,
        status_code: task.status_code,
      })
    }

    const result = task.result?.[0]
    if (!result) {
      return res.status(502).json({ error: 'DataForSEO no devolvió resultados para el dominio indicado' })
    }

    const items = result.items ?? []

    const keywords = items
      .map((item) => ({
        keyword:       item.keyword_data?.keyword ?? '',
        position:      item.ranked_serp_element?.serp_item?.rank_group ?? null,
        search_volume: item.keyword_data?.search_volume ?? 0,
        url:           item.ranked_serp_element?.serp_item?.url ?? '',
        traffic:       Math.round(item.etv ?? 0),
      }))
      .sort((a, b) => (a.position ?? 9999) - (b.position ?? 9999))

    return res.json({ keywords, total: result.total_count ?? keywords.length })
  } catch (err) {
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
})

module.exports = router
