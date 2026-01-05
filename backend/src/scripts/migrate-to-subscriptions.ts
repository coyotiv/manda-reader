/**
 * Migration script to convert from user-specific feeds to shared feeds with subscriptions.
 *
 * This script:
 * 1. Consolidates duplicate feeds (same feedUrl) into single records
 * 2. Creates FeedSubscription records for each user's feeds
 * 3. Updates FeedItems to reference the consolidated feed
 * 4. Creates ReadItem records for items that were marked as read
 * 5. Updates Bookmarks to reference the consolidated feed items
 *
 * Run with: npx ts-node src/scripts/migrate-to-subscriptions.ts
 */

import mongoose from 'mongoose'
import { config } from '../config/env'

async function migrate() {
  console.log('Connecting to database...')
  await mongoose.connect(config.mongoUri)
  console.log('Connected to database')

  const db = mongoose.connection.db
  if (!db) {
    throw new Error('Database connection not established')
  }

  const feedsCollection = db.collection('feeds')
  const feedItemsCollection = db.collection('feeditems')
  const feedSubscriptionsCollection = db.collection('feedsubscriptions')
  const readItemsCollection = db.collection('readitems')
  const bookmarksCollection = db.collection('bookmarks')

  // Check if there are any feeds with userId (old schema)
  const oldSchemaFeeds = await feedsCollection.find({ userId: { $exists: true } }).toArray()

  if (oldSchemaFeeds.length === 0) {
    console.log(
      'No feeds with old schema (userId field) found. Migration may have already been run.'
    )
    await ensureIndexes(
      feedsCollection,
      feedItemsCollection,
      feedSubscriptionsCollection,
      readItemsCollection
    )
    await mongoose.disconnect()
    console.log('Done.')
    return
  }

  console.log(`\n=== Starting Migration ===`)
  console.log(`Found ${oldSchemaFeeds.length} feeds with old schema to migrate\n`)

  // Step 1: Drop the unique index on feedUrl temporarily if it exists
  console.log('Step 1: Preparing database...')
  try {
    await feedsCollection.dropIndex('feedUrl_1')
    console.log('  Dropped feedUrl unique index')
  } catch (e: any) {
    console.log('  No feedUrl index to drop (or already dropped)')
  }

  // Also drop old userId+url index if it exists
  try {
    await feedsCollection.dropIndex('userId_1_url_1')
    console.log('  Dropped old userId+url index')
  } catch (e: any) {
    // Ignore - may not exist
  }

  // Step 2: Group old feeds by feedUrl
  console.log('\nStep 2: Grouping feeds by feedUrl...')
  const feedsByUrl = new Map<string, any[]>()

  for (const feed of oldSchemaFeeds) {
    const existing = feedsByUrl.get(feed.feedUrl) || []
    existing.push(feed)
    feedsByUrl.set(feed.feedUrl, existing)
  }

  console.log(`Found ${feedsByUrl.size} unique feed URLs from ${oldSchemaFeeds.length} old feeds`)

  // Map: oldFeedId -> newFeedId
  const feedIdMap = new Map<string, mongoose.Types.ObjectId>()
  const subscriptionSet = new Set<string>()

  let consolidatedCount = 0
  let subscriptionCount = 0
  let reusedCount = 0

  // Step 3: Create consolidated feeds and subscriptions
  console.log('\nStep 3: Creating consolidated feeds and subscriptions...')

  for (const [feedUrl, oldFeeds] of feedsByUrl) {
    // Check if a new-schema feed already exists for this URL
    const consolidatedFeed = await feedsCollection.findOne({
      feedUrl,
      userId: { $exists: false },
    })

    let newFeedId: mongoose.Types.ObjectId

    if (consolidatedFeed) {
      // Use existing consolidated feed
      newFeedId = consolidatedFeed._id as mongoose.Types.ObjectId
      reusedCount++
    } else {
      // Create new consolidated feed from first old feed
      const canonicalFeed = oldFeeds[0]
      newFeedId = new mongoose.Types.ObjectId()

      await feedsCollection.insertOne({
        _id: newFeedId,
        title: canonicalFeed.title,
        url: canonicalFeed.url,
        feedUrl: feedUrl,
        type: canonicalFeed.type || 'rss',
        icon: canonicalFeed.icon,
        lastFetched: canonicalFeed.lastFetched,
        fetchInterval: canonicalFeed.fetchInterval || 60,
        isActive: true,
        errorCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      consolidatedCount++
    }

    // Map all old feed IDs to the new feed ID and create subscriptions
    for (const oldFeed of oldFeeds) {
      feedIdMap.set(oldFeed._id.toString(), newFeedId)

      // Create subscription for each user (if not exists)
      const subKey = `${oldFeed.userId.toString()}-${newFeedId.toString()}`
      if (!subscriptionSet.has(subKey)) {
        const existingSub = await feedSubscriptionsCollection.findOne({
          userId: oldFeed.userId,
          feedId: newFeedId,
        })

        if (!existingSub) {
          await feedSubscriptionsCollection.insertOne({
            _id: new mongoose.Types.ObjectId(),
            userId: oldFeed.userId,
            feedId: newFeedId,
            isActive: oldFeed.isActive !== false,
            createdAt: oldFeed.createdAt || new Date(),
            updatedAt: new Date(),
          })
          subscriptionCount++
        }
        subscriptionSet.add(subKey)
      }
    }
  }

  console.log(`Created ${consolidatedCount} new consolidated feeds`)
  console.log(`Reused ${reusedCount} existing consolidated feeds`)
  console.log(`Created ${subscriptionCount} subscriptions`)

  // Step 4: Migrate feed items
  console.log('\nStep 4: Migrating feed items...')

  // Drop old unique index on feedItems if exists
  try {
    await feedItemsCollection.dropIndex('userId_1_guid_1')
    console.log('  Dropped old userId+guid index')
  } catch (e: any) {
    // Ignore
  }

  try {
    await feedItemsCollection.dropIndex('feedId_1_guid_1')
    console.log('  Dropped feedId+guid index temporarily')
  } catch (e: any) {
    // Ignore
  }

  const oldItems = await feedItemsCollection.find({ userId: { $exists: true } }).toArray()
  console.log(`Processing ${oldItems.length} feed items with old schema...`)

  const itemIdMap = new Map<string, mongoose.Types.ObjectId>()
  let itemsCreated = 0
  let readRecordsCreated = 0
  let itemsSkipped = 0

  for (const oldItem of oldItems) {
    const oldFeedIdStr = oldItem.feedId?.toString()
    if (!oldFeedIdStr) continue

    const newFeedId = feedIdMap.get(oldFeedIdStr)
    if (!newFeedId) continue

    const itemKey = `${newFeedId.toString()}-${oldItem.guid}`

    let newItemId: mongoose.Types.ObjectId

    if (itemIdMap.has(itemKey)) {
      newItemId = itemIdMap.get(itemKey)!
      itemsSkipped++
    } else {
      // Check if item already exists with new schema
      const existingItem = await feedItemsCollection.findOne({
        feedId: newFeedId,
        guid: oldItem.guid,
        userId: { $exists: false },
      })

      if (existingItem) {
        newItemId = existingItem._id as mongoose.Types.ObjectId
        itemIdMap.set(itemKey, newItemId)
        itemsSkipped++
      } else {
        newItemId = new mongoose.Types.ObjectId()
        itemIdMap.set(itemKey, newItemId)

        await feedItemsCollection.insertOne({
          _id: newItemId,
          feedId: newFeedId,
          title: oldItem.title,
          link: oldItem.link,
          description: oldItem.description,
          content: oldItem.content,
          author: oldItem.author,
          publishedAt: oldItem.publishedAt,
          guid: oldItem.guid,
          hnId: oldItem.hnId,
          hnScore: oldItem.hnScore,
          hnComments: oldItem.hnComments,
          hnCommentsUrl: oldItem.hnCommentsUrl,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        itemsCreated++
      }
    }

    // Create read record if item was read
    if (oldItem.isRead && oldItem.userId) {
      const existingRead = await readItemsCollection.findOne({
        userId: oldItem.userId,
        feedItemId: newItemId,
      })

      if (!existingRead) {
        await readItemsCollection.insertOne({
          _id: new mongoose.Types.ObjectId(),
          userId: oldItem.userId,
          feedItemId: newItemId,
          readAt: oldItem.readAt || new Date(),
          createdAt: new Date(),
        })
        readRecordsCreated++
      }
    }

    // Update bookmark references
    if (oldItem.isBookmarked && oldItem.userId) {
      await bookmarksCollection.updateMany(
        { userId: oldItem.userId, url: oldItem.link },
        { $set: { feedItemId: newItemId } }
      )
    }
  }

  console.log(`Created ${itemsCreated} new consolidated feed items`)
  console.log(`Skipped ${itemsSkipped} duplicate items`)
  console.log(`Created ${readRecordsCreated} read records`)

  // Step 5: Delete old records
  console.log('\nStep 5: Cleaning up old records...')

  const deletedFeeds = await feedsCollection.deleteMany({ userId: { $exists: true } })
  console.log(`Deleted ${deletedFeeds.deletedCount} old feed records`)

  const deletedItems = await feedItemsCollection.deleteMany({ userId: { $exists: true } })
  console.log(`Deleted ${deletedItems.deletedCount} old feed item records`)

  // Step 6: Recreate indexes
  console.log('\nStep 6: Ensuring indexes...')
  await ensureIndexes(
    feedsCollection,
    feedItemsCollection,
    feedSubscriptionsCollection,
    readItemsCollection
  )

  console.log('\n=== Migration Complete ===')
  console.log(`
Summary:
- Migrated ${oldSchemaFeeds.length} old feeds
- Created ${consolidatedCount} new + reused ${reusedCount} existing consolidated feeds
- Created ${subscriptionCount} feed subscriptions
- Migrated to ${itemsCreated} new + ${itemsSkipped} existing items
- Created ${readRecordsCreated} read records
`)

  await mongoose.disconnect()
  console.log('Disconnected from database')
}

async function ensureIndexes(
  feedsCollection: any,
  feedItemsCollection: any,
  feedSubscriptionsCollection: any,
  readItemsCollection: any
) {
  try {
    await feedsCollection.createIndex({ feedUrl: 1 }, { unique: true })
    await feedsCollection.createIndex({ isActive: 1, lastFetched: 1 })
    console.log('  Feed indexes OK')
  } catch (e: any) {
    console.log('  Feed index note:', e.message)
  }

  try {
    await feedItemsCollection.createIndex({ feedId: 1, guid: 1 }, { unique: true })
    await feedItemsCollection.createIndex({ feedId: 1, publishedAt: -1 })
    await feedItemsCollection.createIndex({ publishedAt: -1 })
    console.log('  FeedItem indexes OK')
  } catch (e: any) {
    console.log('  FeedItem index note:', e.message)
  }

  try {
    await feedSubscriptionsCollection.createIndex({ userId: 1, feedId: 1 }, { unique: true })
    await feedSubscriptionsCollection.createIndex({ userId: 1, isActive: 1 })
    await feedSubscriptionsCollection.createIndex({ feedId: 1 })
    console.log('  FeedSubscription indexes OK')
  } catch (e: any) {
    console.log('  FeedSubscription index note:', e.message)
  }

  try {
    await readItemsCollection.createIndex({ userId: 1, feedItemId: 1 }, { unique: true })
    await readItemsCollection.createIndex({ userId: 1, readAt: -1 })
    console.log('  ReadItem indexes OK')
  } catch (e: any) {
    console.log('  ReadItem index note:', e.message)
  }
}

migrate().catch(err => {
  console.error('Migration failed:', err)
  process.exit(1)
})
