import mongoose, { Schema, Document } from 'mongoose'

interface IUser extends Document {
  email: string
  password: string
  preferences: {
    defaultView: 'list' | 'reader'
    readerMode: boolean
  }
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    preferences: {
      defaultView: { type: String, enum: ['list', 'reader'], default: 'list' },
      readerMode: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
)

export const User = mongoose.model<IUser>('User', UserSchema)
