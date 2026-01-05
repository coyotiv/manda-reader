import express, { Response, NextFunction } from 'express'
import { Bookmark } from '../models/Bookmark'
import { authenticate, AuthRequest } from '../middleware/auth'
import { asyncHandler } from '../middleware/asyncHandler'

const router = express.Router()

// Apply authentication to all routes in this router
router.use(authenticate)

// Extend AuthRequest to include loaded bookmark
interface BookmarkRequest extends AuthRequest {
  bookmark?: any
}

// Param middleware to load bookmark by ID (ensuring ownership)
router.param('id', async (req: BookmarkRequest, res: Response, next: NextFunction, id: string) => {
  try {
    const bookmark = await Bookmark.findOne({ _id: id, userId: req.userId })

    if (!bookmark) {
      return res.status(404).json({ error: 'Bookmark not found' })
    }

    req.bookmark = bookmark
    next()
  } catch (error) {
    res.status(500).json({ error: 'Failed to load bookmark' })
  }
})

// Get all bookmarks
router.get(
  '/',
  asyncHandler(async (req: AuthRequest, res) => {
    const bookmarks = await Bookmark.find({ userId: req.userId }).sort({ createdAt: -1 })
    res.json(bookmarks)
  })
)

// Create bookmark
router.post(
  '/',
  asyncHandler(async (req: AuthRequest, res) => {
    const { title, url, note, tags, feedItemId } = req.body

    if (!title || !url) {
      return res.status(400).json({ error: 'Title and URL are required' })
    }

    const bookmark = await Bookmark.create({
      userId: req.userId!,
      feedItemId,
      title,
      url,
      note,
      tags,
    })

    res.status(201).json(bookmark)
  })
)

// Export bookmarks
router.get(
  '/export',
  asyncHandler(async (req: AuthRequest, res) => {
    const bookmarks = await Bookmark.find({ userId: req.userId }).sort({ createdAt: -1 })
    const format = req.query.format || 'json'

    if (format === 'text') {
      const text = bookmarks.map(b => `${b.title}\n${b.url}\n`).join('\n')
      res.setHeader('Content-Type', 'text/plain')
      res.send(text)
    } else {
      res.json(bookmarks)
    }
  })
)

// Delete bookmark - bookmark is pre-loaded by router.param
router.delete(
  '/:id',
  asyncHandler(async (req: BookmarkRequest, res) => {
    await req.bookmark.deleteOne()
    res.json({ message: 'Bookmark deleted' })
  })
)

export default router
