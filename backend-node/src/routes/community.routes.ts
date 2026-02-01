import express, { Request, Response, Router } from 'express';
import { FeedPost, Event, SessionRequest, Notification } from '../models/Community';

const router: Router = express.Router();

// ==================== HELPER FUNCTIONS ====================

const createNotification = async (
  userId: string,
  type: string,
  title: string,
  message: string,
  referenceId?: string,
  referenceType?: string
) => {
  const notification = new Notification({
    userId,
    type,
    title,
    message,
    referenceId,
    referenceType
  });
  await notification.save();
};

const createNotificationsForMultipleUsers = async (
  userIds: string[],
  type: string,
  title: string,
  message: string,
  referenceId?: string,
  referenceType?: string
) => {
  const notifications = userIds.map(userId => ({
    userId,
    type,
    title,
    message,
    referenceId,
    referenceType,
    isRead: false,
    createdAt: new Date()
  }));
  
  await Notification.insertMany(notifications);
};

// ==================== FEED ROUTES ====================

// Get all feed posts
router.get('/feed', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const posts = await FeedPost.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await FeedPost.countDocuments();

    res.json({
      success: true,
      posts: posts.map(post => ({
        id: post.postId,
        postId: post.postId,
        author: post.authorName,
        authorId: post.authorId,
        role: `${post.authorRole}${post.authorBranch ? ' · ' + post.authorBranch : ''}`,
        authorRole: post.authorRole,
        timestamp: getRelativeTime(post.createdAt),
        createdAt: post.createdAt,
        title: post.title,
        content: post.content,
        votes: post.upvotes.length - post.downvotes.length,
        upvotes: post.upvotes,
        downvotes: post.downvotes,
        comments: post.comments,
        totalComments: post.comments.length
      })),
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    console.error('Error fetching feed posts:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch feed posts', error: error.message });
  }
});

// Create new feed post
router.post('/feed/create', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User authentication required' });
    }

    const { title, content, authorName, authorRole, authorBranch } = req.body;

    if (!title || !content || !authorName || !authorRole) {
      return res.status(400).json({ success: false, message: 'Title, content, author name, and role are required' });
    }

    const post = new FeedPost({
      authorId: userId,
      authorName,
      authorRole,
      authorBranch,
      title,
      content,
      upvotes: [userId], // Auto-upvote by creator
      downvotes: [],
      comments: []
    });

    await post.save();

    res.json({
      success: true,
      message: 'Post created successfully',
      post: {
        id: post.postId,
        postId: post.postId,
        author: post.authorName,
        role: `${post.authorRole}${post.authorBranch ? ' · ' + post.authorBranch : ''}`,
        timestamp: 'Just now',
        title: post.title,
        content: post.content,
        votes: 1,
        comments: 0
      }
    });
  } catch (error: any) {
    console.error('Error creating post:', error);
    res.status(500).json({ success: false, message: 'Failed to create post', error: error.message });
  }
});

// Upvote/downvote a post
router.post('/feed/:postId/vote', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User authentication required' });
    }

    const { postId } = req.params;
    const { voteType } = req.body; // 'upvote' or 'downvote'

    const post = await FeedPost.findOne({ postId });
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Remove from both arrays first
    post.upvotes = post.upvotes.filter(id => id !== userId);
    post.downvotes = post.downvotes.filter(id => id !== userId);

    // Add to appropriate array
    if (voteType === 'upvote') {
      post.upvotes.push(userId);
    } else if (voteType === 'downvote') {
      post.downvotes.push(userId);
    }

    post.updatedAt = new Date();
    await post.save();

    res.json({
      success: true,
      votes: post.upvotes.length - post.downvotes.length,
      upvotes: post.upvotes,
      downvotes: post.downvotes
    });
  } catch (error: any) {
    console.error('Error voting on post:', error);
    res.status(500).json({ success: false, message: 'Failed to vote on post', error: error.message });
  }
});

// Add comment to post
router.post('/feed/:postId/comment', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User authentication required' });
    }

    const { postId } = req.params;
    const { content, userName, userRole } = req.body;

    if (!content || !userName || !userRole) {
      return res.status(400).json({ success: false, message: 'Content, user name, and role are required' });
    }

    const post = await FeedPost.findOne({ postId });
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const comment = {
      commentId: new Date().getTime().toString(),
      userId,
      userName,
      userRole,
      content,
      createdAt: new Date()
    };

    post.comments.push(comment);
    post.updatedAt = new Date();
    await post.save();

    // Notify post author if commenter is different
    if (post.authorId !== userId) {
      await createNotification(
        post.authorId,
        'comment_reply',
        'New comment on your post',
        `${userName} commented on your post "${post.title}"`,
        postId,
        'post'
      );
    }

    res.json({
      success: true,
      message: 'Comment added successfully',
      comment,
      totalComments: post.comments.length
    });
  } catch (error: any) {
    console.error('Error adding comment:', error);
    res.status(500).json({ success: false, message: 'Failed to add comment', error: error.message });
  }
});

// Delete post (only by author)
router.delete('/feed/:postId', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User authentication required' });
    }

    const { postId } = req.params;

    const post = await FeedPost.findOne({ postId });
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (post.authorId !== userId) {
      return res.status(403).json({ success: false, message: 'You can only delete your own posts' });
    }

    await FeedPost.deleteOne({ postId });

    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting post:', error);
    res.status(500).json({ success: false, message: 'Failed to delete post', error: error.message });
  }
});

// Update comment
router.put('/feed/:postId/comment/:commentId', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User authentication required' });
    }

    const { postId, commentId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ success: false, message: 'Content is required' });
    }

    const post = await FeedPost.findOne({ postId });
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const comment = post.comments.find(c => c.commentId === commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    if (comment.userId !== userId) {
      return res.status(403).json({ success: false, message: 'You can only edit your own comments' });
    }

    comment.content = content;
    comment.updatedAt = new Date();
    post.updatedAt = new Date();
    await post.save();

    res.json({
      success: true,
      message: 'Comment updated successfully',
      comment
    });
  } catch (error: any) {
    console.error('Error updating comment:', error);
    res.status(500).json({ success: false, message: 'Failed to update comment', error: error.message });
  }
});

// Delete comment
router.delete('/feed/:postId/comment/:commentId', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User authentication required' });
    }

    const { postId, commentId } = req.params;

    const post = await FeedPost.findOne({ postId });
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const commentIndex = post.comments.findIndex(c => c.commentId === commentId);
    if (commentIndex === -1) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    const comment = post.comments[commentIndex];
    if (comment.userId !== userId) {
      return res.status(403).json({ success: false, message: 'You can only delete your own comments' });
    }

    post.comments.splice(commentIndex, 1);
    post.updatedAt = new Date();
    await post.save();

    res.json({
      success: true,
      message: 'Comment deleted successfully',
      totalComments: post.comments.length
    });
  } catch (error: any) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ success: false, message: 'Failed to delete comment', error: error.message });
  }
});

// ==================== EVENT ROUTES ====================

// Get all events (with filtering)
router.get('/events', async (req: Request, res: Response) => {
  try {
    const { status, hostId } = req.query;
    const filter: any = {};

    if (status) {
      filter.status = status;
    }
    if (hostId) {
      filter.hostId = hostId;
    }

    const events = await Event.find(filter).sort({ date: 1 });

    res.json({
      success: true,
      events: events.map(event => ({
        id: event.eventId,
        eventId: event.eventId,
        title: event.title,
        description: event.description,
        date: event.date.toISOString().split('T')[0],
        time: event.time,
        duration: event.duration,
        location: event.location,
        meetLink: event.meetLink,
        hostId: event.hostId,
        hostName: event.hostName,
        hostRole: event.hostRole,
        attendees: event.attendees.length,
        attendeesList: event.attendees,
        comments: event.comments,
        status: event.status
      }))
    });
  } catch (error: any) {
    console.error('Error fetching events:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch events', error: error.message });
  }
});

// Get upcoming events
router.get('/events/upcoming', async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const events = await Event.find({
      status: 'upcoming',
      date: { $gte: now }
    }).sort({ date: 1 });

    res.json({
      success: true,
      events: events.map(event => ({
        id: event.eventId,
        eventId: event.eventId,
        title: event.title,
        description: event.description,
        date: event.date.toISOString().split('T')[0],
        time: event.time,
        duration: event.duration,
        location: event.location,
        meetLink: event.meetLink,
        hostName: event.hostName,
        hostRole: event.hostRole,
        attendees: event.attendees.length,
        attendeesList: event.attendees,
        comments: event.comments,
        status: event.status
      }))
    });
  } catch (error: any) {
    console.error('Error fetching upcoming events:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch upcoming events', error: error.message });
  }
});

// Get past events
router.get('/events/past', async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const events = await Event.find({
      $or: [
        { status: 'completed' },
        { status: 'upcoming', date: { $lt: now } }
      ]
    }).sort({ date: -1 });

    res.json({
      success: true,
      events: events.map(event => ({
        id: event.eventId,
        eventId: event.eventId,
        title: event.title,
        description: event.description,
        date: event.date.toISOString().split('T')[0],
        time: event.time,
        location: event.location,
        attendees: event.attendees.length,
        hostName: event.hostName,
        hostRole: event.hostRole,
        status: 'completed'
      }))
    });
  } catch (error: any) {
    console.error('Error fetching past events:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch past events', error: error.message });
  }
});

// Create new event (Alumni only)
router.post('/events/create', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User authentication required' });
    }

    const { title, description, date, time, duration, location, meetLink, hostName, hostRole } = req.body;

    if (!title || !description || !date || !time || !location || !hostName || !hostRole) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title, description, date, time, location, host name, and role are required' 
      });
    }

    if (hostRole !== 'alumni') {
      return res.status(403).json({
        success: false,
        message: 'Only alumni can create events. Students should submit requests.'
      });
    }

    const event = new Event({
      title,
      description,
      date: new Date(date),
      time,
      duration,
      location,
      meetLink,
      hostId: userId,
      hostName,
      hostRole,
      attendees: [userId], // Host auto-joins
      status: 'upcoming'
    });

    await event.save();

    res.json({
      success: true,
      message: 'Event created successfully',
      event: {
        id: event.eventId,
        eventId: event.eventId,
        title: event.title,
        description: event.description,
        date: event.date.toISOString().split('T')[0],
        time: event.time,
        location: event.location,
        attendees: 1
      }
    });
  } catch (error: any) {
    console.error('Error creating event:', error);
    res.status(500).json({ success: false, message: 'Failed to create event', error: error.message });
  }
});

// Join/leave event
router.post('/events/:eventId/join', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User authentication required' });
    }

    const { eventId } = req.params;

    const event = await Event.findOne({ eventId });
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const isAttending = event.attendees.includes(userId);

    if (isAttending) {
      // Leave event
      event.attendees = event.attendees.filter(id => id !== userId);
    } else {
      // Join event
      event.attendees.push(userId);
    }

    event.updatedAt = new Date();
    await event.save();

    res.json({
      success: true,
      message: isAttending ? 'Left event successfully' : 'Joined event successfully',
      isAttending: !isAttending,
      attendees: event.attendees.length
    });
  } catch (error: any) {
    console.error('Error joining/leaving event:', error);
    res.status(500).json({ success: false, message: 'Failed to update event attendance', error: error.message });
  }
});

// Update event status
router.put('/events/:eventId/status', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User authentication required' });
    }

    const { eventId } = req.params;
    const { status } = req.body;

    const event = await Event.findOne({ eventId });
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (event.hostId !== userId) {
      return res.status(403).json({ success: false, message: 'Only the host can update event status' });
    }

    event.status = status;
    event.updatedAt = new Date();
    await event.save();

    res.json({
      success: true,
      message: 'Event status updated successfully',
      event: {
        id: event.eventId,
        status: event.status
      }
    });
  } catch (error: any) {
    console.error('Error updating event status:', error);
    res.status(500).json({ success: false, message: 'Failed to update event status', error: error.message });
  }
});

// Add comment to event
router.post('/events/:eventId/comment', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User authentication required' });
    }

    const { eventId } = req.params;
    const { content, userName, userRole } = req.body;

    if (!content || !userName || !userRole) {
      return res.status(400).json({ success: false, message: 'Content, user name, and role are required' });
    }

    const event = await Event.findOne({ eventId });
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const comment = {
      commentId: new Date().getTime().toString(),
      userId,
      userName,
      userRole,
      content,
      createdAt: new Date()
    };

    event.comments.push(comment);
    event.updatedAt = new Date();
    await event.save();

    res.json({
      success: true,
      message: 'Comment added successfully',
      comment,
      totalComments: event.comments.length
    });
  } catch (error: any) {
    console.error('Error adding comment to event:', error);
    res.status(500).json({ success: false, message: 'Failed to add comment', error: error.message });
  }
});

// ==================== SESSION REQUEST ROUTES ====================

// Get all session requests
router.get('/session-requests', async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    const sessions = await SessionRequest.find(filter).sort({ votes: -1, createdAt: -1 });

    res.json({
      success: true,
      sessions: sessions.map(session => ({
        id: session.sessionId,
        sessionId: session.sessionId,
        topic: session.topic,
        description: session.description,
        proposedById: session.proposedById,
        proposedByName: session.proposedByName,
        votes: session.votes.length,
        votesList: session.votes,
        status: session.status,
        scheduledDetails: session.scheduledDetails,
        createdAt: session.createdAt
      }))
    });
  } catch (error: any) {
    console.error('Error fetching session requests:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch session requests', error: error.message });
  }
});

// Create session request (Students)
router.post('/session-requests/create', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User authentication required' });
    }

    const { topic, description, proposedByName } = req.body;

    if (!topic || !description || !proposedByName) {
      return res.status(400).json({ success: false, message: 'Topic, description, and proposer name are required' });
    }

    const session = new SessionRequest({
      topic,
      description,
      proposedById: userId,
      proposedByName,
      votes: [userId], // Auto-vote by proposer
      status: 'open'
    });

    await session.save();

    res.json({
      success: true,
      message: 'Session request created successfully',
      session: {
        id: session.sessionId,
        sessionId: session.sessionId,
        topic: session.topic,
        description: session.description,
        votes: 1,
        status: session.status
      }
    });
  } catch (error: any) {
    console.error('Error creating session request:', error);
    res.status(500).json({ success: false, message: 'Failed to create session request', error: error.message });
  }
});

// Update session request (only by proposer)
router.put('/session-requests/:sessionId', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User authentication required' });
    }

    const { sessionId } = req.params;
    const { topic, description } = req.body;

    if (!topic || !description) {
      return res.status(400).json({ success: false, message: 'Topic and description are required' });
    }

    const session = await SessionRequest.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session request not found' });
    }

    // Check if the user is the proposer
    if (session.proposedById !== userId) {
      return res.status(403).json({ success: false, message: 'You can only edit your own session requests' });
    }

    // Don't allow editing already scheduled sessions
    if (session.status === 'scheduled') {
      return res.status(400).json({ success: false, message: 'Cannot edit scheduled sessions' });
    }

    session.topic = topic;
    session.description = description;
    session.updatedAt = new Date();
    await session.save();

    res.json({
      success: true,
      message: 'Session request updated successfully',
      session: {
        id: session.sessionId,
        sessionId: session.sessionId,
        topic: session.topic,
        description: session.description,
        votes: session.votes.length,
        status: session.status,
        votesList: session.votes
      }
    });
  } catch (error: any) {
    console.error('Error updating session request:', error);
    res.status(500).json({ success: false, message: 'Failed to update session request', error: error.message });
  }
});

// Delete session request (only by proposer)
router.delete('/session-requests/:sessionId', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User authentication required' });
    }

    const { sessionId } = req.params;

    const session = await SessionRequest.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session request not found' });
    }

    // Check if the user is the proposer
    if (session.proposedById !== userId) {
      return res.status(403).json({ success: false, message: 'You can only delete your own session requests' });
    }

    // Don't allow deleting already scheduled sessions
    if (session.status === 'scheduled') {
      return res.status(400).json({ success: false, message: 'Cannot delete scheduled sessions' });
    }

    await SessionRequest.deleteOne({ sessionId });

    res.json({ success: true, message: 'Session request deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting session request:', error);
    res.status(500).json({ success: false, message: 'Failed to delete session request', error: error.message });
  }
});

// Vote on session request
router.post('/session-requests/:sessionId/vote', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User authentication required' });
    }

    const { sessionId } = req.params;

    const session = await SessionRequest.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session request not found' });
    }

    const hasVoted = session.votes.includes(userId);

    if (hasVoted) {
      // Remove vote
      session.votes = session.votes.filter(id => id !== userId);
    } else {
      // Add vote
      session.votes.push(userId);
    }

    session.updatedAt = new Date();
    await session.save();

    res.json({
      success: true,
      message: hasVoted ? 'Vote removed' : 'Vote added',
      hasVoted: !hasVoted,
      votes: session.votes.length,
      votesList: session.votes
    });
  } catch (error: any) {
    console.error('Error voting on session:', error);
    res.status(500).json({ success: false, message: 'Failed to vote on session', error: error.message });
  }
});

// Schedule session (Alumni)
router.post('/session-requests/:sessionId/schedule', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User authentication required' });
    }

    const { sessionId } = req.params;
    const { description, date, time, duration, meetLink, scheduledByName } = req.body;

    if (!description || !date || !time || !duration || !meetLink || !scheduledByName) {
      return res.status(400).json({ 
        success: false, 
        message: 'All scheduling details are required (description, date, time, duration, meetLink, scheduledByName)' 
      });
    }

    const session = await SessionRequest.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session request not found' });
    }

    if (session.status !== 'open') {
      return res.status(400).json({ success: false, message: 'Session is not open for scheduling' });
    }

    // Update session with schedule details
    session.status = 'scheduled';
    session.scheduledDetails = {
      description,
      date,
      time,
      duration,
      meetLink,
      scheduledBy: userId,
      scheduledByName,
      scheduledAt: new Date()
    };
    session.updatedAt = new Date();
    await session.save();

    // Create corresponding event
    const event = new Event({
      title: session.topic,
      description,
      date: new Date(date),
      time,
      duration,
      location: 'Online',
      meetLink,
      hostId: userId,
      hostName: scheduledByName,
      hostRole: 'alumni',
      attendees: [userId, ...session.votes.filter(id => id !== userId)], // Add all voters as attendees
      status: 'upcoming'
    });
    await event.save();

    // Notify all voters
    const voterIds = session.votes.filter(id => id !== userId);
    if (voterIds.length > 0) {
      await createNotificationsForMultipleUsers(
        voterIds,
        'session_scheduled',
        'Session Scheduled!',
        `Your requested session "${session.topic}" has been scheduled by ${scheduledByName}`,
        event.eventId,
        'event'
      );
    }

    res.json({
      success: true,
      message: 'Session scheduled successfully',
      session: {
        id: session.sessionId,
        sessionId: session.sessionId,
        topic: session.topic,
        status: session.status,
        scheduledDetails: session.scheduledDetails
      },
      event: {
        id: event.eventId,
        eventId: event.eventId,
        title: event.title,
        date: event.date.toISOString().split('T')[0],
        time: event.time
      }
    });
  } catch (error: any) {
    console.error('Error scheduling session:', error);
    res.status(500).json({ success: false, message: 'Failed to schedule session', error: error.message });
  }
});

// ==================== NOTIFICATION ROUTES ====================

// Get user notifications
router.get('/notifications', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User authentication required' });
    }

    const { unreadOnly } = req.query;
    const filter: any = { userId };

    if (unreadOnly === 'true') {
      filter.isRead = false;
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    res.json({
      success: true,
      notifications: notifications.map(notif => ({
        id: notif.notificationId,
        notificationId: notif.notificationId,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        referenceId: notif.referenceId,
        referenceType: notif.referenceType,
        isRead: notif.isRead,
        createdAt: notif.createdAt,
        timestamp: getRelativeTime(notif.createdAt)
      })),
      unreadCount
    });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications', error: error.message });
  }
});

// Mark notification as read
router.put('/notifications/:notificationId/read', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User authentication required' });
    }

    const { notificationId } = req.params;

    const notification = await Notification.findOne({ notificationId, userId });
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    notification.isRead = true;
    await notification.save();

    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    res.json({
      success: true,
      message: 'Notification marked as read',
      unreadCount
    });
  } catch (error: any) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ success: false, message: 'Failed to mark notification as read', error: error.message });
  }
});

// Mark all notifications as read
router.put('/notifications/read-all', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User authentication required' });
    }

    await Notification.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read',
      unreadCount: 0
    });
  } catch (error: any) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ success: false, message: 'Failed to mark all notifications as read', error: error.message });
  }
});

// ==================== UTILITY FUNCTIONS ====================

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default router;
