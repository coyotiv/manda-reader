import mongoose, { Schema, Document } from 'mongoose'

interface IBookmark extends Document {
  userId: mongoose.Types.ObjectId
  feedItemId?: mongoose.Types.ObjectId
  title: string
  url: string
  note?: string
  tags?: string[]
  createdAt: Date
  updatedAt: Date
}

const BookmarkSchema = new Schema<IBookmark>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    feedItemId: { type: Schema.Types.ObjectId, ref: 'FeedItem' },
    title: { type: String, required: true },
    url: { type: String, required: true },
    note: String,
    tags: [String],
  },
  { timestamps: true }
)

BookmarkSchema.index({ userId: 1, createdAt: -1 })

export const Bookmark = mongoose.model<IBookmark>('Bookmark', BookmarkSchema)
