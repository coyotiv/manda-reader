import mongoose, { Schema, Document } from 'mongoose'

interface IFeed extends Document {
  title: string
  url: string
  feedUrl: string
  type: 'rss' | 'atom' | 'substack' | 'custom'
  icon?: string
  lastFetched?: Date
  fetchInterval: number
  isActive: boolean
  errorCount: number
  lastError?: string
}

const FeedSchema = new Schema<IFeed>(
  {
    title: { type: String, required: true },
    url: { type: String, required: true },
    feedUrl: { type: String, required: true },
    type: { type: String, enum: ['rss', 'atom', 'substack', 'custom'], default: 'rss' },
    icon: String,
    lastFetched: Date,
    fetchInterval: { type: Number, default: 60 }, // minutes
    isActive: { type: Boolean, default: true },
    errorCount: { type: Number, default: 0 },
    lastError: String,
  },
  { timestamps: true }
)

// Unique feed by feedUrl - this is the canonical identifier
FeedSchema.index({ feedUrl: 1 }, { unique: true })
FeedSchema.index({ isActive: 1, lastFetched: 1 })

export const Feed = mongoose.model<IFeed>('Feed', FeedSchema)
export type { IFeed }
