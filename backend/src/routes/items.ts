import express, { Response, NextFunction } from 'express'
import mongoose from 'mongoose'
import { FeedItem } from '../models/FeedItem'
import { FeedSubscription } from '../models/FeedSubscription'
import { ReadItem } from '../models/ReadItem'
import { History } from '../models/History'
import { Bookmark } from '../models/Bookmark'
import { authenticate, AuthRequest } from '../middleware/auth'
import { asyncHandler } from '../middleware/asyncHandler'

const router = express.Router()

// Apply authentication to all routes in this router
router.use(authenticate)

// Extend AuthRequest to include loaded item
interface ItemRequest extends AuthRequest {
  item?: any
  subscription?: any
}

// Type for enriched items with user-specific status
interface EnrichedItem {
  _id: mongoose.Types.ObjectId
  feedId: any
  title: string
  link: string
  description?: string
  content?: string
  author?: string
  publishedAt: Date
  guid: string
  isRead: boolean
  isBookmarked: boolean
}

// Helper to get user's subscribed feed IDs
async function getUserFeedIds(userId: string): Promise<mongoose.Types.ObjectId[]> {
  const subscriptions = await FeedSubscription.find({
    userId,
    isActive: true,
  }).select('feedId')

  return subscriptions.map(sub => sub.feedId)
}

// Helper to enrich items with user-specific read/bookmark status
async function enrichItemsWithUserStatus(items: any[], userId: string): Promise<EnrichedItem[]> {
  const itemIds = items.map(item => item._id)

  // Get read status
  const readItems = await ReadItem.find({
    userId,
    feedItemId: { $in: itemIds },
  }).select('feedItemId')
  const readItemIds = new Set(readItems.map(r => r.feedItemId.toString()))

  // Get bookmark status
  const bookmarks = await Bookmark.find({
    userId,
    feedItemId: { $in: itemIds },
  }).select('feedItemId')
  const bookmarkedItemIds = new Set(bookmarks.map(b => b.feedItemId?.toString()))

  return items.map(item => ({
    ...(item.toObject ? item.toObject() : item),
    isRead: readItemIds.has(item._id.toString()),
    isBookmarked: bookmarkedItemIds.has(item._id.toString()),
  }))
}

// Param middleware to load item and verify subscription
router.param('id', async (req: ItemRequest, res: Response, next: NextFunction, id: string) => {
  try {
    const item = await FeedItem.findById(id).populate('feedId', 'title url type')

    if (!item) {
      return res.status(404).json({ error: 'Item not found' })
    }

    // Verify user is subscribed to the feed
    const subscription = await FeedSubscription.findOne({
      userId: req.userId,
      feedId: item.feedId,
      isActive: true,
    })

    if (!subscription) {
      return res.status(403).json({ error: 'Not subscribed to this feed' })
    }

    req.item = item
    req.subscription = subscription
    next()
  } catch (error) {
    res.status(500).json({ error: 'Failed to load item' })
  }
})

// Get items for a feed
router.get(
  '/feed/:feedId',
  asyncHandler(async (req: AuthRequest, res) => {
    const { feedId } = req.params
    const { sort = 'date', filterRead } = req.query

    // Check if feed exists (allow viewing items even without subscription)

    const sortOptions: any = {}
    sortOptions.publishedAt = -1

    const rawItems = await FeedItem.find({ feedId })
      .populate('feedId', 'title url type')
      .sort(sortOptions)
      .limit(100)

    // Enrich with user-specific status
    let enrichedItems = await enrichItemsWithUserStatus(rawItems, req.userId!)

    // Filter read items if requested
    if (filterRead === 'true') {
      enrichedItems = enrichedItems.filter(item => !item.isRead)
    }

    res.json(enrichedItems)
  })
)

// Get all items across subscribed feeds
router.get(
  '/',
  asyncHandler(async (req: AuthRequest, res) => {
    const { feedIds, sort = 'date', filterRead } = req.query

    // Get user's subscribed feeds
    const subscribedFeedIds = await getUserFeedIds(req.userId!)

    // Build query
    const query: any = {}

    if (feedIds) {
      // Filter to only requested feeds that user is subscribed to
      const requestedIds = (feedIds as string).split(',')
      const allowedIds = requestedIds.filter(id =>
        subscribedFeedIds.some(subId => subId.toString() === id)
      )
      query.feedId = { $in: allowedIds }
    } else {
      query.feedId = { $in: subscribedFeedIds }
    }

    const sortOptions: any = {}
    sortOptions.publishedAt = -1

    const rawItems = await FeedItem.find(query)
      .populate('feedId', 'title url type')
      .sort(sortOptions)
      .limit(100)

    // Enrich with user-specific status
    let enrichedItems = await enrichItemsWithUserStatus(rawItems, req.userId!)

    // Filter read items if requested
    if (filterRead === 'true') {
      enrichedItems = enrichedItems.filter(item => !item.isRead)
    }

    res.json(enrichedItems)
  })
)

// Get single item - item is pre-loaded by router.param
router.get(
  '/:id',
  asyncHandler(async (req: ItemRequest, res) => {
    const [enrichedItem] = await enrichItemsWithUserStatus([req.item], req.userId!)
    res.json(enrichedItem)
  })
)

// Mark as read/unread - item is pre-loaded by router.param
router.put(
  '/:id/read',
  asyncHandler(async (req: ItemRequest, res) => {
    const { isRead } = req.body
    const item = req.item

    if (isRead) {
      // Mark as read
      await ReadItem.findOneAndUpdate(
        { userId: req.userId, feedItemId: item._id },
        { userId: req.userId, feedItemId: item._id, readAt: new Date() },
        { upsert: true }
      )

      // Create history entry
      await History.create({
        userId: req.userId!,
        feedItemId: item._id,
        url: item.link,
        title: item.title,
        action: 'viewed',
        date: new Date(),
      })
    } else {
      // Mark as unread
      await ReadItem.deleteOne({ userId: req.userId, feedItemId: item._id })
    }

    // Return enriched item
    const [enrichedItem] = await enrichItemsWithUserStatus([item], req.userId!)
    res.json(enrichedItem)
  })
)

// Toggle bookmark - item is pre-loaded by router.param
router.put(
  '/:id/bookmark',
  asyncHandler(async (req: ItemRequest, res) => {
    const item = req.item

    // Check current bookmark status
    const existingBookmark = await Bookmark.findOne({
      userId: req.userId,
      feedItemId: item._id,
    })

    if (existingBookmark) {
      // Remove bookmark
      await Bookmark.deleteOne({ _id: existingBookmark._id })
    } else {
      // Add bookmark
      await Bookmark.create({
        userId: req.userId!,
        feedItemId: item._id,
        title: item.title,
        url: item.link,
      })
    }

    // Return enriched item
    const [enrichedItem] = await enrichItemsWithUserStatus([item], req.userId!)
    res.json(enrichedItem)
  })
)

export default router
