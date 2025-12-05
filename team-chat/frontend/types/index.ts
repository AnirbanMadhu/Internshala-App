export interface User {
  _id: string;
  username: string;
  email: string;
  createdAt: Date;
  isOnline?: boolean;
}

export interface Channel {
  _id: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  members: User[];
  createdBy: string | User;
  createdAt: Date;
}

export interface Message {
  _id: string;
  channelId: string;
  userId: string;
  username: string;
  content: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: 'image' | 'video' | 'audio' | 'document' | 'other';
  fileSize?: number;
  edited?: boolean;
  editedAt?: Date;
  deleted?: boolean;
  createdAt: Date;
}

export interface TypingUser {
  userId: string;
  username: string;
  channelId: string;
}

export interface OnlineUser {
  userId: string;
  username: string;
  socketId: string;
}
