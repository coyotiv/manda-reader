import cron from 'node-cron'
import { fetchAllActiveFeeds } from './feedParser'

let scheduledTask: cron.ScheduledTask | null = null

export function startFeedScheduler(intervalMinutes: number = 15): void {
  // Stop existing scheduler if running
  stopFeedScheduler()

  // Schedule feed fetching every N minutes
  const cronExpression = `*/${intervalMinutes} * * * *`

  scheduledTask = cron.schedule(cronExpression, async () => {
    console.log(`[${new Date().toISOString()}] Starting scheduled feed fetch...`)
    try {
      const result = await fetchAllActiveFeeds()
      console.log(
        `[${new Date().toISOString()}] Feed fetch complete. Success: ${result.success}, Failed: ${result.failed}`
      )
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error in scheduled feed fetch:`, error)
    }
  })

  console.log(`Feed scheduler started. Fetching feeds every ${intervalMinutes} minutes.`)

  // Run initial fetch after a short delay
  setTimeout(async () => {
    console.log('Running initial feed fetch...')
    try {
      const result = await fetchAllActiveFeeds()
      console.log(
        `Initial feed fetch complete. Success: ${result.success}, Failed: ${result.failed}`
      )
    } catch (error) {
      console.error('Error in initial feed fetch:', error)
    }
  }, 5000)
}

export function stopFeedScheduler(): void {
  if (scheduledTask) {
    scheduledTask.stop()
    scheduledTask = null
    console.log('Feed scheduler stopped.')
  }
}
