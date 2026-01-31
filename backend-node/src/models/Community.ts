import mongoose, { Schema, Document } from 'mongoose';

// ==================== FEED POST ====================

export interface IComment {
  commentId: string;
  userId: string;
  userName: string;
  userRole: 'student' | 'alumni';
  content: string;
  createdAt: Date;
}

const CommentSchema = new Schema<IComment>({
  commentId: { type: String, required: true, default: () => new mongoose.Types.ObjectId().toString() },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  userRole: { type: String, enum: ['student', 'alumni'], required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export interface IFeedPost extends Document {
  postId: string;
  authorId: string;
  authorName: string;
  authorRole: 'student' | 'alumni';
  authorBranch?: string;
  title: string;
  content: string;
  upvotes: string[]; // Array of userIds who upvoted
  downvotes: string[]; // Array of userIds who downvoted
  comments: IComment[];
  createdAt: Date;
  updatedAt: Date;
}

const FeedPostSchema = new Schema<IFeedPost>({
  postId: { type: String, required: true, unique: true, default: () => new mongoose.Types.ObjectId().toString() },
  authorId: { type: String, required: true },
  authorName: { type: String, required: true },
  authorRole: { type: String, enum: ['student', 'alumni'], required: true },
  authorBranch: { type: String },
  title: { type: String, required: true },
  content: { type: String, required: true },
  upvotes: [{ type: String }],
  downvotes: [{ type: String }],
  comments: [CommentSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

FeedPostSchema.index({ createdAt: -1 });
FeedPostSchema.index({ authorId: 1 });

export const FeedPost = mongoose.model<IFeedPost>('FeedPost', FeedPostSchema);

// ==================== EVENT ====================

export interface IEvent extends Document {
  eventId: string;
  title: string;
  description: string;
  date: Date;
  time: string;
  duration?: string;
  location: string;
  meetLink?: string;
  hostId: string;
  hostName: string;
  hostRole: 'student' | 'alumni';
  attendees: string[]; // Array of userIds
  comments: IComment[];
  status: 'upcoming' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>({
  eventId: { type: String, required: true, unique: true, default: () => new mongoose.Types.ObjectId().toString() },
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  duration: { type: String },
  location: { type: String, required: true },
  meetLink: { type: String },
  hostId: { type: String, required: true },
  hostName: { type: String, required: true },
  hostRole: { type: String, enum: ['student', 'alumni'], required: true },
  attendees: [{ type: String }],
  comments: [CommentSchema],
  status: { type: String, enum: ['upcoming', 'completed', 'cancelled'], default: 'upcoming' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

EventSchema.index({ date: 1, status: 1 });
EventSchema.index({ hostId: 1 });
EventSchema.index({ status: 1, date: 1 });

export const Event = mongoose.model<IEvent>('Event', EventSchema);

// ==================== SESSION REQUEST ====================

export interface IScheduledDetails {
  description: string;
  date: string;
  time: string;
  duration: string;
  meetLink: string;
  scheduledBy: string;
  scheduledByName: string;
  scheduledAt: Date;
}

const ScheduledDetailsSchema = new Schema<IScheduledDetails>({
  description: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  duration: { type: String, required: true },
  meetLink: { type: String, required: true },
  scheduledBy: { type: String, required: true },
  scheduledByName: { type: String, required: true },
  scheduledAt: { type: Date, default: Date.now }
});

export interface ISessionRequest extends Document {
  sessionId: string;
  topic: string;
  description: string;
  proposedById: string;
  proposedByName: string;
  votes: string[]; // Array of userIds who voted
  status: 'open' | 'scheduled' | 'completed' | 'cancelled';
  scheduledDetails?: IScheduledDetails;
  createdAt: Date;
  updatedAt: Date;
}

const SessionRequestSchema = new Schema<ISessionRequest>({
  sessionId: { type: String, required: true, unique: true, default: () => new mongoose.Types.ObjectId().toString() },
  topic: { type: String, required: true },
  description: { type: String, required: true },
  proposedById: { type: String, required: true },
  proposedByName: { type: String, required: true },
  votes: [{ type: String }],
  status: { type: String, enum: ['open', 'scheduled', 'completed', 'cancelled'], default: 'open' },
  scheduledDetails: { type: ScheduledDetailsSchema },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

SessionRequestSchema.index({ status: 1, votes: -1 });
SessionRequestSchema.index({ proposedById: 1 });

export const SessionRequest = mongoose.model<ISessionRequest>('SessionRequest', SessionRequestSchema);

// ==================== NOTIFICATION ====================

export interface INotification extends Document {
  notificationId: string;
  userId: string;
  type: 'event_scheduled' | 'session_scheduled' | 'event_reminder' | 'comment_reply' | 'post_upvote';
  title: string;
  message: string;
  referenceId?: string; // eventId, postId, sessionId, etc.
  referenceType?: 'event' | 'post' | 'session';
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  notificationId: { type: String, required: true, unique: true, default: () => new mongoose.Types.ObjectId().toString() },
  userId: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['event_scheduled', 'session_scheduled', 'event_reminder', 'comment_reply', 'post_upvote'],
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  referenceId: { type: String },
  referenceType: { type: String, enum: ['event', 'post', 'session'] },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
