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
  members: string[];
  createdBy: string;
  createdAt: Date;
}

export interface Message {
  _id: string;
  channelId: string;
  userId: string;
  username: string;
  content: string;
  edited?: boolean;
  editedAt?: Date;
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
