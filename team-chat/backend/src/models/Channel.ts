import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

export interface IChannel extends Document {
  name: string;
  description?: string;
  isPrivate: boolean;
  members: mongoose.Types.ObjectId[] | IUser[];
  createdBy: mongoose.Types.ObjectId | IUser;
  createdAt: Date;
}

const ChannelSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Channel name is required'],
    trim: true,
    minlength: [2, 'Channel name must be at least 2 characters'],
    maxlength: [50, 'Channel name cannot exceed 50 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters'],
  },
  isPrivate: {
    type: Boolean,
    default: false,
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for faster queries
ChannelSchema.index({ name: 1 });
ChannelSchema.index({ members: 1 });

export default mongoose.model<IChannel>('Channel', ChannelSchema);
