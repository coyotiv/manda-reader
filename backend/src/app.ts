import express from 'express'
import cors from 'cors'
import { connectDatabase } from './config/database'
import { config } from './config/env'
import { errorHandler } from './middleware/errorHandler'
import { startFeedScheduler } from './services/feedScheduler'
import authRoutes from './routes/auth'
import feedRoutes from './routes/feeds'
import itemRoutes from './routes/items'
import bookmarkRoutes from './routes/bookmarks'
import historyRoutes from './routes/history'
import readerRoutes from './routes/reader'

const app = express()

app.use(cors({ origin: config.corsOrigin }))
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' })
})

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/feeds', feedRoutes)
app.use('/api/items', itemRoutes)
app.use('/api/bookmarks', bookmarkRoutes)
app.use('/api/history', historyRoutes)
app.use('/api/reader', readerRoutes)

// Error handler
app.use(errorHandler)

async function start() {
  await connectDatabase()

  // Start the feed scheduler (fetch feeds every 15 minutes)
  startFeedScheduler(15)

  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`)
  })
}

start()
