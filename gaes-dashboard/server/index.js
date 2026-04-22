require('dotenv').config()
const express = require('express')
const cors = require('cors')

const rankingsRouter = require('./routes/rankings')
const keywordsRouter = require('./routes/keywords')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/rankings', rankingsRouter)
app.use('/api/keywords', keywordsRouter)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
