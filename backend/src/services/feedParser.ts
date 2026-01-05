import Parser from 'rss-parser'
import axios from 'axios'
import https from 'https'
import { FeedItem } from '../models/FeedItem'
import { Feed, IFeed } from '../models/Feed'

// Create an HTTPS agent that ignores SSL certificate errors
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
})

const parser = new Parser({
  customFields: {
    item: ['content:encoded', 'media:content', 'comments'],
  },
})

// Helper to extract score and comments count from description (common in HN RSS)
function extractHnMetadata(description?: string): { score?: number; commentsCount?: number } {
  if (!description) return {}

  const result: { score?: number; commentsCount?: number } = {}

  // Extract points/score
  // Pattern often looks like: "Points: 123" or similar in some RSS variants
  const scoreMatch = description.match(/Points:\s*(\d+)/i)
  if (scoreMatch) {
    result.score = parseInt(scoreMatch[1], 10)
  }

  // Extract comments count
  // Pattern often looks like: "Comments: 45"
  const commentsMatch = description.match(/Comments:\s*(\d+)/i)
  if (commentsMatch) {
    result.commentsCount = parseInt(commentsMatch[1], 10)
  }

  return result
}

export async function parseAndStoreFeed(feed: IFeed): Promise<number> {
  let itemsAdded = 0

  try {
    // Fetch feed content using axios with custom agent to handle SSL errors
    const response = await axios.get(feed.feedUrl, {
      timeout: 10000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      httpsAgent,
    })

    const parsed = await parser.parseString(response.data)

    for (const item of parsed.items) {
      const itemAny = item as any
      const guid = item.guid || item.link || itemAny.id || ''

      // Check if item already exists for this feed
      const existing = await FeedItem.findOne({ feedId: feed._id, guid })

      // Extract HN metadata if applicable
      const { score, commentsCount } = extractHnMetadata(item.contentSnippet || itemAny.description)

      if (existing) {
        // Update existing item with latest stats if available
        if (score !== undefined || commentsCount !== undefined || item.comments) {
          const update: any = {}
          if (score !== undefined) update.score = score
          if (commentsCount !== undefined) update.commentsCount = commentsCount
          if (item.comments) update.commentsLink = item.comments

          if (Object.keys(update).length > 0) {
            await FeedItem.updateOne({ _id: existing._id }, update)
          }
        }
        continue
      }

      await FeedItem.create({
        feedId: feed._id,
        title: item.title || 'Untitled',
        link: item.link || '',
        description: item.contentSnippet || itemAny.description,
        content: itemAny['content:encoded'] || item.content,
        author: itemAny.creator || itemAny.author,
        publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
        guid,
        commentsLink: item.comments, // mapped from customFields if present or standard field
        score,
        commentsCount,
      })
      itemsAdded++
    }

    // Update feed with success status
    await Feed.updateOne(
      { _id: feed._id },
      {
        lastFetched: new Date(),
        errorCount: 0,
        lastError: undefined,
      }
    )
  } catch (error) {
    // Update feed with error status
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    await Feed.updateOne(
      { _id: feed._id },
      {
        $inc: { errorCount: 1 },
        lastError: errorMessage,
      }
    )
    console.error(`Error parsing feed ${feed.feedUrl}:`, error)
    throw error
  }

  return itemsAdded
}

export async function fetchAllActiveFeeds(): Promise<{ success: number; failed: number }> {
  const feeds = await Feed.find({ isActive: true })
  let success = 0
  let failed = 0

  for (const feed of feeds) {
    try {
      await parseAndStoreFeed(feed)
      success++
    } catch {
      failed++
      // Disable feeds with too many consecutive errors
      if (feed.errorCount >= 5) {
        await Feed.updateOne({ _id: feed._id }, { isActive: false })
        console.log(`Disabled feed ${feed.feedUrl} due to repeated errors`)
      }
    }
  }

  return { success, failed }
}
