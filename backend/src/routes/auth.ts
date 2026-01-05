import express from 'express'
import bcrypt from 'bcryptjs'
import { User } from '../models/User'
import { Feed } from '../models/Feed'
import { authenticate, AuthRequest } from '../middleware/auth'
import { asyncHandler } from '../middleware/asyncHandler'
import { generateToken, formatUserResponse } from '../utils/jwt'

const router = express.Router()

// Register
router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await User.create({
      email,
      password: hashedPassword,
    })

    // Ensure default feeds exist in the database, but DO NOT subscribe the user
    const defaultFeeds = [
      {
        title: 'BetaList',
        url: 'https://betalist.com',
        feedUrl: 'https://feeds.feedburner.com/BetaList',
        type: 'rss',
        isActive: true,
      },
      {
        title: 'Hacker News',
        url: 'https://news.ycombinator.com',
        feedUrl: 'https://news.ycombinator.com/rss',
        type: 'rss',
        isActive: true,
      },
    ]

    // Create feeds if they don't exist so they appear in "Available Feeds"
    for (const feedData of defaultFeeds) {
      try {
        const feed = await Feed.findOne({ feedUrl: feedData.feedUrl })
        if (!feed) {
          await Feed.create(feedData)
        }
      } catch (error) {
        console.error(`Failed to ensure default feed exists for ${feedData.title}:`, error)
      }
    }

    const token = generateToken(user._id.toString())
    res.status(201).json(formatUserResponse(user, token))
  })
)

// Login
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = generateToken(user._id.toString())
    res.json(formatUserResponse(user, token))
  })
)

// Get current user
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const user = await User.findById(req.userId).select('-password')
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json(user)
  })
)

export default router
