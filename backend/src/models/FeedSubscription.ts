import mongoose, { Schema, Document } from 'mongoose'

interface IFeedSubscription extends Document {
  userId: mongoose.Types.ObjectId
  feedId: mongoose.Types.ObjectId
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const FeedSubscriptionSchema = new Schema<IFeedSubscription>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    feedId: { type: Schema.Types.ObjectId, ref: 'Feed', required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

// Ensure unique subscription per user-feed combination
FeedSubscriptionSchema.index({ userId: 1, feedId: 1 }, { unique: true })
FeedSubscriptionSchema.index({ userId: 1, isActive: 1 })
FeedSubscriptionSchema.index({ feedId: 1 })

export const FeedSubscription = mongoose.model<IFeedSubscription>(
  'FeedSubscription',
  FeedSubscriptionSchema
)
export type { IFeedSubscription }
