import express from 'express'
import { History } from '../models/History'
import { authenticate, AuthRequest } from '../middleware/auth'
import { asyncHandler } from '../middleware/asyncHandler'

const router = express.Router()

// Apply authentication to all routes in this router
router.use(authenticate)

// Get history
router.get(
  '/',
  asyncHandler(async (req: AuthRequest, res) => {
    const { date, limit = 100 } = req.query
    const query: any = { userId: req.userId }

    if (date) {
      const startDate = new Date(date as string)
      startDate.setHours(0, 0, 0, 0)
      const endDate = new Date(date as string)
      endDate.setHours(23, 59, 59, 999)
      query.date = { $gte: startDate, $lte: endDate }
    }

    const history = await History.find(query)
      .sort({ date: -1 })
      .limit(Number(limit))
      .populate('feedItemId')

    res.json(history)
  })
)

// Get history grouped by day
router.get(
  '/days',
  asyncHandler(async (req: AuthRequest, res) => {
    const history = await History.find({ userId: req.userId })
      .sort({ date: -1 })
      .populate('feedItemId')

    // Group by day
    const grouped: Record<string, typeof history> = {}
    history.forEach(item => {
      const day = item.date.toISOString().split('T')[0]
      if (!grouped[day]) {
        grouped[day] = []
      }
      grouped[day].push(item)
    })

    res.json(grouped)
  })
)

export default router
