import express, { Response, NextFunction } from 'express'
import Parser from 'rss-parser'
import https from 'https'
import { Feed } from '../models/Feed'
import { FeedSubscription } from '../models/FeedSubscription'
import { FeedItem } from '../models/FeedItem'
import { discoverRSSFeed, detectFeedType } from '../services/rssDiscovery'
import { parseAndStoreFeed } from '../services/feedParser'
import { authenticate, AuthRequest } from '../middleware/auth'
import { asyncHandler } from '../middleware/asyncHandler'

const router = express.Router()

// Create an HTTPS agent that ignores SSL certificate errors
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
})

// Configure rss-parser to use our custom HTTPS agent
const parser = new Parser({
  requestOptions: {
    agent: httpsAgent,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    },
  },
})

// Apply authentication to all routes in this router
router.use(authenticate)

// Extend AuthRequest to include loaded feed
interface FeedRequest extends AuthRequest {
  feed?: any
}

// Param middleware to load feed by ID
router.param('id', async (req: FeedRequest, res: Response, next: NextFunction, id: string) => {
  try {
    const feed = await Feed.findById(id)

    if (!feed) {
      return res.status(404).json({ error: 'Feed not found' })
    }

    req.feed = feed
    next()
  } catch (error) {
    res.status(500).json({ error: 'Failed to load feed' })
  }
})

// Get all feeds for user (via subscriptions)
router.get(
  '/',
  asyncHandler(async (req: AuthRequest, res) => {
    const subscriptions = await FeedSubscription.find({
      userId: req.userId,
      isActive: true,
    }).populate('feedId')

    const feeds = subscriptions
      .filter(sub => sub.feedId) // Filter out any null references
      .map(sub => ({
        ...(sub.feedId as any).toObject(),
        subscriptionId: sub._id,
        subscribedAt: sub.createdAt,
        isSubscribed: true,
      }))

    res.json(feeds)
  })
)

// Get all available feeds (with subscription status)
router.get(
  '/available',
  asyncHandler(async (req: AuthRequest, res) => {
    // Get all active feeds
    const allFeeds = await Feed.find({ isActive: true })

    // Get user's subscriptions
    const subscriptions = await FeedSubscription.find({
      userId: req.userId,
      isActive: true,
    })
    const subscribedFeedIds = new Set(subscriptions.map(s => s.feedId.toString()))

    const feeds = allFeeds.map(feed => ({
      ...feed.toObject(),
      isSubscribed: subscribedFeedIds.has(feed._id.toString()),
    }))

    res.json(feeds)
  })
)

// Subscribe to a feed (add new feed if doesn't exist)
router.post(
  '/',
  asyncHandler(async (req: AuthRequest, res) => {
    const { url } = req.body

    if (!url) {
      return res.status(400).json({ error: 'URL is required' })
    }

    // Discover RSS feed
    const feedUrl = await discoverRSSFeed(url)
    if (!feedUrl) {
      return res.status(400).json({ error: 'Could not discover RSS feed' })
    }

    // Check if feed already exists
    let feed = await Feed.findOne({ feedUrl })

    if (!feed) {
      // Parse feed to get title
      const parsed = await parser.parseURL(feedUrl)
      const feedType = detectFeedType(url)

      feed = await Feed.create({
        title: parsed.title || new URL(url).hostname,
        url,
        feedUrl,
        type: feedType,
      })

      // Parse and store initial items
      await parseAndStoreFeed(feed)
    }

    // Check if user already subscribed
    const existingSubscription = await FeedSubscription.findOne({
      userId: req.userId,
      feedId: feed._id,
    })

    if (existingSubscription) {
      if (existingSubscription.isActive) {
        return res.status(400).json({ error: 'Already subscribed to this feed' })
      }
      // Reactivate subscription
      existingSubscription.isActive = true
      await existingSubscription.save()
      return res.json({
        ...feed.toObject(),
        subscriptionId: existingSubscription._id,
        subscribedAt: existingSubscription.createdAt,
      })
    }

    // Create new subscription
    const subscription = await FeedSubscription.create({
      userId: req.userId!,
      feedId: feed._id,
    })

    // If feed has no items, trigger an update
    const itemCount = await FeedItem.countDocuments({ feedId: feed._id })
    if (itemCount === 0) {
      // Run in background to not block response
      parseAndStoreFeed(feed).catch(err =>
        console.error(`Error fetching initial items for feed ${feed.url}:`, err)
      )
    }

    res.json({
      ...feed.toObject(),
      subscriptionId: subscription._id,
      subscribedAt: subscription.createdAt,
    })
  })
)

// Discover RSS from URL
router.post(
  '/discover',
  asyncHandler(async (req: AuthRequest, res) => {
    const { url } = req.body
    if (!url) {
      return res.status(400).json({ error: 'URL is required' })
    }

    const feedUrl = await discoverRSSFeed(url)
    if (!feedUrl) {
      return res.status(404).json({ error: 'Could not discover RSS feed' })
    }

    const parsed = await parser.parseURL(feedUrl)
    res.json({
      feedUrl,
      title: parsed.title,
      description: parsed.description,
    })
  })
)

// Get feed by ID - feed is pre-loaded by router.param
router.get(
  '/:id',
  asyncHandler(async (req: FeedRequest, res) => {
    // Check if user is subscribed to this feed
    const subscription = await FeedSubscription.findOne({
      userId: req.userId,
      feedId: req.feed._id,
      isActive: true,
    })

    if (!subscription) {
      return res.status(404).json({ error: 'Not subscribed to this feed' })
    }

    res.json({
      ...req.feed.toObject(),
      subscriptionId: subscription._id,
      subscribedAt: subscription.createdAt,
    })
  })
)

// Subscribe to an existing feed by ID - feed is pre-loaded by router.param
router.post(
  '/:id/subscribe',
  asyncHandler(async (req: FeedRequest, res) => {
    const feed = req.feed

    // Check if already subscribed
    const existingSubscription = await FeedSubscription.findOne({
      userId: req.userId,
      feedId: feed._id,
    })

    if (existingSubscription) {
      if (existingSubscription.isActive) {
        return res.status(400).json({ error: 'Already subscribed to this feed' })
      }
      // Reactivate subscription
      existingSubscription.isActive = true
      await existingSubscription.save()
      return res.json({
        ...feed.toObject(),
        subscriptionId: existingSubscription._id,
        isSubscribed: true,
      })
    }

    // Create new subscription
    const subscription = await FeedSubscription.create({
      userId: req.userId!,
      feedId: feed._id,
    })

    // If feed has no items, trigger an update
    const itemCount = await FeedItem.countDocuments({ feedId: feed._id })
    if (itemCount === 0) {
      // Run in background to not block response
      parseAndStoreFeed(feed).catch(err =>
        console.error(`Error fetching initial items for feed ${feed.url}:`, err)
      )
    }

    res.json({
      ...feed.toObject(),
      subscriptionId: subscription._id,
      isSubscribed: true,
    })
  })
)

// Unsubscribe from feed (soft delete) - feed is pre-loaded by router.param
router.delete(
  '/:id',
  asyncHandler(async (req: FeedRequest, res) => {
    const subscription = await FeedSubscription.findOneAndUpdate(
      { userId: req.userId, feedId: req.feed._id },
      { isActive: false },
      { new: true }
    )

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' })
    }

    res.json({ message: 'Unsubscribed from feed' })
  })
)

// Force refresh a feed - feed is pre-loaded by router.param
router.post(
  '/:id/refresh',
  asyncHandler(async (req: FeedRequest, res) => {
    // Check if user is subscribed
    const subscription = await FeedSubscription.findOne({
      userId: req.userId,
      feedId: req.feed._id,
      isActive: true,
    })

    if (!subscription) {
      return res.status(404).json({ error: 'Not subscribed to this feed' })
    }

    const itemsAdded = await parseAndStoreFeed(req.feed)
    res.json({ message: 'Feed refreshed', itemsAdded })
  })
)

export default router
