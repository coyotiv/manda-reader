import mongoose from 'mongoose'
import { config } from '../config/env'
import { fetchAllActiveFeeds } from '../services/feedParser'

async function run() {
  console.log('Starting scheduled feed fetch (task run)...')
  try {
    await mongoose.connect(config.mongoUri)
    console.log('Connected to database')

    const result = await fetchAllActiveFeeds()
    console.log(`Feed fetch complete. Success: ${result.success}, Failed: ${result.failed}`)
  } catch (error) {
    console.error('Error during feed fetch:', error)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from database')
  }
}

run()
