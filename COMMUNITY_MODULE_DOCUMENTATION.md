# Community Module - Complete Implementation

## 📋 Overview
Complete backend and frontend implementation of the Community module with Feed, Events, and Student-led Sessions.

## 🏗️ Architecture

### Backend Components
1. **Models** (`backend-node/src/models/Community.ts`)
   - FeedPost: Posts with upvotes, downvotes, comments
   - Event: Events with date, time, location, attendees, meet links
   - SessionRequest: Student proposals with voting and scheduling
   - Notification: User notifications with read status

2. **Routes** (`backend-node/src/routes/community.routes.ts`)
   - Feed routes (create, vote, comment, delete)
   - Event routes (create, join, get upcoming/past)
   - Session request routes (create, vote, schedule)
   - Notification routes (get, mark as read)

3. **Server Integration** (`backend-node/src/index.ts`)
   - Registered at `/api/community`

### Frontend Components
1. **Community Layout** (`components/community/Community.jsx`)
   - Sidebar navigation
   - Nested routing support

2. **Feed** (`components/community/CommunityFeed.jsx`)
   - Create posts with title and content
   - Upvote/downvote functionality
   - Display comments count
   - Real-time updates

3. **Upcoming Events** (`components/community/CommunityUpcomingEvents.jsx`)
   - Display upcoming events
   - Join/leave event functionality
   - Alumni can create events
   - Show meet links

4. **Past Events** (`components/community/CommunityPastEvents.jsx`)
   - Archive of completed events
   - Display attendance count

5. **Student Requests** (`components/community/CommunityStudentsRequest.jsx`)
   - Students propose session topics
   - Community voting system
   - Alumni can schedule sessions with meet links
   - Auto-notification to voters when scheduled
   - Scheduled sessions become events

6. **API Service** (`services/communityApi.js`)
   - Centralized API calls with authentication
   - Error handling

## 🔗 API Endpoints

### Feed
- `GET /api/community/feed` - Get all posts (paginated)
- `POST /api/community/feed/create` - Create new post
- `POST /api/community/feed/:postId/vote` - Upvote/downvote post
- `POST /api/community/feed/:postId/comment` - Add comment
- `DELETE /api/community/feed/:postId` - Delete post (author only)

### Events
- `GET /api/community/events` - Get all events (filterable)
- `GET /api/community/events/upcoming` - Get upcoming events
- `GET /api/community/events/past` - Get past events
- `POST /api/community/events/create` - Create event (alumni)
- `POST /api/community/events/:eventId/join` - Join/leave event
- `PUT /api/community/events/:eventId/status` - Update status (host only)

### Session Requests
- `GET /api/community/session-requests` - Get all sessions
- `POST /api/community/session-requests/create` - Create request (students)
- `POST /api/community/session-requests/:sessionId/vote` - Vote on session
- `POST /api/community/session-requests/:sessionId/schedule` - Schedule session (alumni)

### Notifications
- `GET /api/community/notifications` - Get user notifications
- `PUT /api/community/notifications/:notificationId/read` - Mark as read
- `PUT /api/community/notifications/read-all` - Mark all as read

## 🎨 Features

### Feed System
- ✅ Create posts with title and content
- ✅ Upvote/downvote mechanism (user can only vote once)
- ✅ Comments with author info
- ✅ Auto-upvote by creator
- ✅ Relative timestamps ("2 hours ago")
- ✅ Author role badges (Student/Alumni)

### Events System
- ✅ Alumni can create events
- ✅ Date, time, location, duration
- ✅ Google Meet link integration
- ✅ Join/leave functionality
- ✅ Attendee count tracking
- ✅ Automatic past/upcoming separation
- ✅ Host auto-joins event

### Student-Led Sessions
- ✅ Students propose topics
- ✅ Community voting (thumbs up)
- ✅ Auto-vote by proposer
- ✅ Vote count display
- ✅ Alumni can schedule sessions
- ✅ Schedule form (description, date, time, duration, meet link)
- ✅ Auto-create event when scheduled
- ✅ Auto-add voters as attendees
- ✅ Notification to all voters
- ✅ Status tracking (open → scheduled)

### Notification System
- ✅ Session scheduled notifications
- ✅ Comment reply notifications
- ✅ Unread count tracking
- ✅ Mark as read functionality
- ✅ Mark all as read
- ✅ Reference to source (event/post/session)

## 🚀 Usage

### Backend
```bash
# Server already running on port 8000
# Community routes available at http://localhost:8000/api/community
```

### Frontend
```bash
# Navigate to Community
http://localhost:5173/community

# Routes:
/community/feed              - Discussion feed
/community/upcoming-events   - Upcoming events
/community/past-events       - Past events archive
/community/students-request  - Student-led sessions
```

## 🔐 Authentication
All endpoints use `x-user-id` header for authentication. User data (name, role, branch) stored in localStorage.

## 📊 Data Models

### FeedPost
```typescript
{
  postId: string
  authorId: string
  authorName: string
  authorRole: 'student' | 'alumni'
  authorBranch?: string
  title: string
  content: string
  upvotes: string[]        // userIds
  downvotes: string[]      // userIds
  comments: Comment[]
  createdAt: Date
  updatedAt: Date
}
```

### Event
```typescript
{
  eventId: string
  title: string
  description: string
  date: Date
  time: string
  duration?: string
  location: string
  meetLink?: string
  hostId: string
  hostName: string
  hostRole: 'student' | 'alumni'
  attendees: string[]      // userIds
  status: 'upcoming' | 'completed' | 'cancelled'
  createdAt: Date
  updatedAt: Date
}
```

### SessionRequest
```typescript
{
  sessionId: string
  topic: string
  description: string
  proposedById: string
  proposedByName: string
  votes: string[]          // userIds
  status: 'open' | 'scheduled' | 'completed' | 'cancelled'
  scheduledDetails?: {
    description: string
    date: string
    time: string
    duration: string
    meetLink: string
    scheduledBy: string
    scheduledByName: string
    scheduledAt: Date
  }
  createdAt: Date
  updatedAt: Date
}
```

### Notification
```typescript
{
  notificationId: string
  userId: string
  type: 'event_scheduled' | 'session_scheduled' | 'event_reminder' | 'comment_reply' | 'post_upvote'
  title: string
  message: string
  referenceId?: string     // eventId, postId, sessionId
  referenceType?: 'event' | 'post' | 'session'
  isRead: boolean
  createdAt: Date
}
```

## 🎯 Key Features

### Workflow: Student-Led Session
1. Student proposes topic → Creates SessionRequest with 1 vote (self)
2. Other students vote → Vote count increases
3. Alumni sees highest voted sessions
4. Alumni schedules session → Fills form with date/time/meet link
5. System creates Event automatically
6. System adds all voters as event attendees
7. System sends notifications to all voters
8. Session status changes to "scheduled"
9. Students see scheduled session with meet link
10. Session appears in Upcoming Events

### Alumni Dashboard Updates
Alumni can see:
- Events they're hosting (filter by hostId)
- Sessions they scheduled
- Upcoming events to be taken

### Bell Icon Notifications
Students receive notifications for:
- Sessions they voted on being scheduled
- Comments on their posts
- Event reminders (can be added later)

## 🔧 Technical Details

### Database Indexes
- FeedPost: `createdAt` (desc), `authorId`
- Event: `date` + `status`, `hostId`
- SessionRequest: `status` + `votes` (sorted by votes desc)
- Notification: `userId` + `isRead` + `createdAt` (desc)

### Security
- All mutations require authentication
- Users can only delete their own posts
- Only event hosts can update event status
- Alumni-only routes: Create events, schedule sessions

### Error Handling
- Comprehensive try-catch blocks
- User-friendly error messages
- Console logging for debugging

## 📝 Notes

### Frontend Integration
- All components use communityApi.js service
- LocalStorage for user data (userId, userName, userRole, userBranch)
- Loading states with spinners
- Empty states with helpful messages
- Modal forms for creating content

### Backend Integration
- MongoDB Atlas connection
- Express middleware for CORS and JSON parsing
- Mongoose schemas with validation
- Relative time formatting utility

### Navigation
- Community accessible from:
  1. Navbar (when authenticated)
  2. DashboardLayout sidebar
  3. Direct URL: /community

### Routes
- Community uses nested routing with React Router
- Default redirect: /community → /community/feed
- Sidebar navigation highlights active route

## ✅ Testing Checklist

### Feed
- [ ] Create post
- [ ] Upvote/downvote post
- [ ] Comment on post
- [ ] View post author details
- [ ] Delete own post

### Events
- [ ] Alumni create event
- [ ] Students join event
- [ ] View meet link
- [ ] See upcoming events
- [ ] See past events
- [ ] Filter events by host

### Sessions
- [ ] Student propose session
- [ ] Students vote on sessions
- [ ] Alumni view highest voted
- [ ] Alumni schedule session
- [ ] Verify event creation
- [ ] Check notifications sent
- [ ] View scheduled session details

### Notifications
- [ ] Receive session scheduled notification
- [ ] Mark notification as read
- [ ] View unread count
- [ ] Mark all as read
- [ ] Navigate to referenced item

## 🚀 Deployment

### Environment Variables
No additional environment variables needed. Uses existing MongoDB connection.

### Backend
```bash
cd backend-node
npm run dev
# Community routes ready at http://localhost:8000/api/community
```

### Frontend
```bash
cd frontend1/resume
npm run dev
# Access Community at http://localhost:5173/community
```

## 📞 Support

If you encounter issues:
1. Check MongoDB connection
2. Verify user authentication (localStorage)
3. Check browser console for errors
4. Verify backend is running on port 8000
5. Check network tab for API calls

## 🎉 Success!

The Community module is fully implemented with:
- ✅ Backend API (15+ endpoints)
- ✅ Frontend components (5 components)
- ✅ Authentication integration
- ✅ Notification system
- ✅ Database models with indexes
- ✅ Error handling
- ✅ Loading states
- ✅ Empty states
- ✅ Navigation integration
- ✅ TypeScript support (backend)
- ✅ Responsive design (Tailwind CSS)
