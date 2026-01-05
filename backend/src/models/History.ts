import mongoose, { Schema, Document } from 'mongoose'

interface IHistory extends Document {
  userId: mongoose.Types.ObjectId
  feedItemId?: mongoose.Types.ObjectId
  url: string
  title: string
  action: 'viewed' | 'bookmarked' | 'shared'
  date: Date
  createdAt: Date
}

const HistorySchema = new Schema<IHistory>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    feedItemId: { type: Schema.Types.ObjectId, ref: 'FeedItem' },
    url: { type: String, required: true },
    title: String,
    action: { type: String, enum: ['viewed', 'bookmarked', 'shared'], default: 'viewed' },
    date: { type: Date, required: true, index: true },
  },
  { timestamps: true }
)

HistorySchema.index({ userId: 1, date: -1 })

export const History = mongoose.model<IHistory>('History', HistorySchema)
