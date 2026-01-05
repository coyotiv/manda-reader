import mongoose, { Schema, Document } from 'mongoose'

interface IReadItem extends Document {
  userId: mongoose.Types.ObjectId
  feedItemId: mongoose.Types.ObjectId
  readAt: Date
  createdAt: Date
}

const ReadItemSchema = new Schema<IReadItem>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    feedItemId: { type: Schema.Types.ObjectId, ref: 'FeedItem', required: true },
    readAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

// Ensure unique read record per user-item combination
ReadItemSchema.index({ userId: 1, feedItemId: 1 }, { unique: true })
ReadItemSchema.index({ userId: 1, readAt: -1 })

export const ReadItem = mongoose.model<IReadItem>('ReadItem', ReadItemSchema)
export type { IReadItem }
