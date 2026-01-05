import mongoose, { Schema, Document } from 'mongoose'

interface IFeedItem extends Document {
  feedId: mongoose.Types.ObjectId
  title: string
  link: string
  description?: string
  content?: string
  readerContent?: string
  author?: string
  publishedAt: Date
  guid: string
  commentsLink?: string
  commentsCount?: number
  score?: number
}

const FeedItemSchema = new Schema<IFeedItem>(
  {
    feedId: { type: Schema.Types.ObjectId, ref: 'Feed', required: true },
    title: { type: String, required: true },
    link: { type: String, required: true },
    description: String,
    content: String,
    readerContent: String,
    author: String,
    publishedAt: { type: Date, required: true },
    guid: { type: String, required: true },
    commentsLink: String,
    commentsCount: Number,
    score: Number,
  },
  { timestamps: true }
)

// Unique item per feed by guid
FeedItemSchema.index({ feedId: 1, guid: 1 }, { unique: true })
FeedItemSchema.index({ feedId: 1, publishedAt: -1 })
FeedItemSchema.index({ publishedAt: -1 })
FeedItemSchema.index({ link: 1 })

export const FeedItem = mongoose.model<IFeedItem>('FeedItem', FeedItemSchema)
export type { IFeedItem }
