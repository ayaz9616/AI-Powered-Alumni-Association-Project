# Alumni-Student Mentorship Platform - Backend

Complete TypeScript/Node.js backend for AI-driven alumni-student mentorship platform with resume parsing and intelligent matching.

## 🚀 Features

### Core Functionality
- **n8n Resume Parsing**: PDF/DOC resume parsing via n8n webhooks (source of truth)
- **LangChain AI Matching**: Intelligent student-alumni mentor matching using Claude Sonnet
- **Role-Based Authentication**: Student, Alumni, and Admin roles with protected APIs
- **Session Scheduling**: Request, accept, schedule mentorship sessions
- **Feedback System**: Bidirectional feedback with impact scoring
- **Admin Analytics**: Comprehensive dashboard with engagement metrics

### Architecture Principles
✅ **n8n** handles: Resume parsing, keyword extraction, structured JSON output  
✅ **LangChain** handles: Matching logic, scoring, ATS analysis, reasoning  
❌ **n8n NEVER** does reasoning  
❌ **LangChain NEVER** parses raw files  

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB 4.4+ (local or Atlas)
- Anthropic API key (for Claude Sonnet)
- n8n webhook endpoint (for resume parsing)

## 🛠️ Setup

1. **Install dependencies:**
   ```bash
   cd backend-node
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set:
   - `MONGO_URI`: Your MongoDB connection string
   - `ANTHROPIC_API_KEY`: Your Anthropic API key
   - `N8N_RESUME_PARSE_WEBHOOK`: Your n8n webhook URL

3. **Start MongoDB** (if local):
   ```bash
   mongod --dbpath /path/to/data
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```

5. **Or build and run production:**
   ```bash
   npm run build
   npm start
   ```

## 📚 API Documentation

### Authentication
All mentorship APIs require `x-user-id` header.

### User Registration
```http
POST /api/mentorship/user/register
Content-Type: application/json

{
  "userId": "user_123",
  "email": "student@example.com",
  "name": "John Doe",
  "role": "student" // "student", "alumni", or "admin"
}
```

### Student Profile Creation
```http
POST /api/mentorship/student/profile/create
x-user-id: user_123
Content-Type: multipart/form-data

resume: <file>
branch: "Computer Science"
year: 3
careerGoals: "Backend Engineer"
preferredDomains: ["backend", "web"]
mentorshipExpectations: "Career guidance"
```

### Alumni Profile Creation
```http
POST /api/mentorship/alumni/profile/create
x-user-id: user_456
Content-Type: multipart/form-data

resume: <file>
currentRole: "Senior Engineer"
company: "TechCorp"
yearsOfExperience: 5
domainsOfExpertise: ["backend", "system design"]
```

### Find Mentors (AI Matching)
```http
POST /api/mentorship/student/{userId}/find-mentors
x-user-id: user_123

{
  "limit": 10
}
```

Response:
```json
{
  "success": true,
  "matches": [
    {
      "matchScore": 0.87,
      "reasons": [
        "Strong backend skill overlap",
        "Alumni has relevant industry experience"
      ],
      "skillOverlap": ["node", "react"],
      "domainOverlap": ["backend"],
      "alumni": {
        "userId": "user_456",
        "name": "Jane Smith",
        "currentRole": "Senior Engineer",
        "company": "TechCorp",
        "averageRating": 4.8
      }
    }
  ]
}
```

### Request Session
```http
POST /api/mentorship/session/request
x-user-id: user_123

{
  "alumniId": "user_456",
  "sessionType": "1:1",
  "scheduledDate": "2026-02-15",
  "startTime": "14:00",
  "endTime": "15:00",
  "agenda": "Career guidance discussion"
}
```

### Submit Feedback
```http
POST /api/mentorship/session/{sessionId}/feedback/student
x-user-id: user_123

{
  "rating": 5,
  "usefulness": 5,
  "clarity": 4,
  "comments": "Very helpful session!"
}
```

### Admin Analytics
```http
GET /api/mentorship/admin/stats/overview
x-user-id: admin_user
```

Response includes:
- Total users by role
- Profile completion rates
- Session statistics
- Engagement metrics

## 🏗️ Project Structure

```
backend-node/
├── src/
│   ├── index.ts                    # Main server entry
│   ├── middleware/
│   │   ├── auth.middleware.ts      # Role-based auth
│   │   └── error.middleware.ts     # Error handling
│   ├── models/
│   │   └── Mentorship.ts           # MongoDB schemas
│   ├── routes/
│   │   ├── mentorship.routes.ts    # Profile & matching APIs
│   │   ├── session.routes.ts       # Session management
│   │   └── admin.routes.ts         # Analytics APIs
│   └── services/
│       ├── N8nService.ts           # Resume parsing (n8n)
│       └── LangChainMatchingService.ts  # AI matching (Claude)
├── .env.example
├── package.json
└── tsconfig.json
```

## 🔐 Roles & Permissions

### Student
- Create/update student profile
- Upload resume (n8n parsing)
- Find mentors (AI matching)
- Request sessions
- Submit feedback

### Alumni
- Create/update alumni profile
- Set availability
- Accept/reject session requests
- Mentor students
- Submit feedback

### Admin
- View all analytics
- Monitor engagement
- Manage users
- Access dashboard

## 🧪 Testing

```bash
# Check health
curl http://localhost:8000/api/health

# Test n8n webhook
curl http://localhost:8000/api/mentorship/test-webhook
```

## 📊 Database Schema

### Collections
- `users` - User accounts (userId, email, name, role)
- `studentprofiles` - Student data + parsed resumes
- `alumniprofiles` - Alumni data + parsed resumes + availability
- `mentormatches` - Computed match scores
- `mentorshipsessions` - Scheduled sessions
- `feedbacks` - Embedded in sessions

## 🚨 Troubleshooting

**MongoDB connection failed:**
- Ensure MongoDB is running
- Check `MONGO_URI` in `.env`
- Verify network access for MongoDB Atlas

**n8n parsing fails:**
- Verify `N8N_RESUME_PARSE_WEBHOOK` URL
- Check n8n workflow is active
- Test webhook with Postman

**AI matching errors:**
- Verify `ANTHROPIC_API_KEY` is valid
- Check API rate limits
- Ensure profiles have keywords

## 📝 License

MIT

## 👥 Team

ResuMate - AI Career Companion Team
