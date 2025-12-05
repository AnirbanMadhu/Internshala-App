import mongoose, { Document, Schema } from 'mongoose';
import { IChannel } from './Channel';
import { IUser } from './User';

export interface IMessage extends Document {
  channelId: mongoose.Types.ObjectId | IChannel;
  userId: mongoose.Types.ObjectId | IUser;
  username: string;
  content?: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: 'image' | 'video' | 'audio' | 'document' | 'other';
  fileSize?: number;
  edited: boolean;
  editedAt?: Date;
  deleted: boolean;
  createdAt: Date;
}

const MessageSchema: Schema = new Schema({
  channelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters'],
  },
  fileUrl: {
    type: String,
  },
  fileName: {
    type: String,
  },
  fileType: {
    type: String,
    enum: ['image', 'video', 'audio', 'document', 'other'],
  },
  fileSize: {
    type: Number,
  },
  edited: {
    type: Boolean,
    default: false,
  },
  editedAt: {
    type: Date,
  },
  deleted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for faster queries
MessageSchema.index({ channelId: 1, createdAt: -1 });
MessageSchema.index({ userId: 1 });

export default mongoose.model<IMessage>('Message', MessageSchema);
