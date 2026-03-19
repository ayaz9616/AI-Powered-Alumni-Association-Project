# 🎓 AI-Powered Alumni Mentorship & Job Matching Platform

<div align="center">

[![Python 3.13](https://img.shields.io/badge/python-3.13-blue.svg)](https://www.python.org/downloads/)
[![Node 18+](https://img.shields.io/badge/node-18+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-green.svg)](https://www.mongodb.com/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![Live Demo](https://img.shields.io/badge/demo-live-success.svg)](your-vercel-url)

**A comprehensive full-stack platform connecting alumni and students through AI-powered mentorship matching, community engagement, job portal, and intelligent resume analysis.**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [API Documentation](#-api-documentation) • [Deployment](#-deployment)

</div>
<img width="1919" height="1079" alt="image" src="https://github.com/user-attachments/assets/098a2e0b-de61-4672-a8b6-0ebbb0574ba8" />
<img width="1919" height="1079" alt="image" src="https://github.com/user-attachments/assets/7363f8c7-00f8-4ddc-aa82-08ef9fac6a64" />
<img width="1917" height="1079" alt="image" src="https://github.com/user-attachments/assets/7312ca66-85bd-43ce-87e5-51cb6ce8207e" />



---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [AI Features](#-ai-features)
- [Project Structure](#-project-structure)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

---

## 🌟 Overview

**Alumni Hacktopia** is an intelligent platform designed to bridge the gap between alumni and current students through:

- 🤝 **AI-Powered Mentorship Matching** - Claude-powered intelligent matching between students and alumni mentors
- 📚 **Alumni Directory** - Comprehensive searchable database of 387+ alumni profiles
- 💼 **Job Portal** - AI-enhanced job matching and referral tracking system
- 📝 **ResuMate Tools** - AI-driven resume analysis, ATS scoring, and improvement suggestions
- 🎤 **Mock Interviews** - Practice interviews with AI feedback
- 👥 **Community Module** - Feed, events, voting, and student-led sessions
- 📊 **Analytics Dashboard** - Track engagement, mentorship sessions, and job applications

### Why Alumni Hacktopia?

Traditional alumni networks lack intelligent matching and engagement tools. Alumni Hacktopia leverages cutting-edge AI to:

1. **Match students with the right mentors** based on skills, interests, and career goals
2. **Optimize resumes** with ATS scoring and AI-powered suggestions
3. **Connect talent with opportunities** through intelligent job matching
4. **Foster community engagement** with interactive feeds and events

---

## ✨ Features

### 🔍 Alumni Directory
- Browse 387+ verified alumni profiles
- Advanced search and filtering (by course, batch, company, location, skills)
- Pagination and infinite scroll support
- Profile completion tracking
- Social media integration (LinkedIn, GitHub, Twitter, Facebook)
- Export capabilities

### 🤖 AI-Powered Mentorship System

#### **For Students:**
- Upload resume or manually create profile
- AI parses resume and extracts skills, projects, internships
- Get matched with top 10 mentors using Claude AI
- View mentor profiles, expertise, and availability
- Request mentorship sessions
- Track session history and feedback

#### **For Alumni:**
- Create mentor profile with resume upload or manual entry
- Define expertise domains and mentorship preferences
- Set availability schedules (recurring weekly slots)
- Review and accept mentorship requests
- Conduct 1:1 or group sessions
- Track mentee progress

#### **Matching Algorithm:**
- **Skill-based matching** - Aligns student skills with mentor expertise
- **Domain overlap** - Matches career interests with mentor's field
- **Experience-based scoring** - Prioritizes relevant industry experience
- **Availability consideration** - Ensures mentor capacity
- **AI reasoning** - Claude provides detailed match explanations

### 💼 Job Portal

- **For Alumni:**
  - Post job opportunities with detailed requirements
  - AI-powered candidate matching
  - Referral tracking and management
  - Application status updates

- **For Students:**
  - Browse job listings with smart filters
  - AI-enhanced profile-to-job matching
  - One-click applications
  - Referral request system
  - Application status tracking

- **AI Features:**
  - Automatic skill extraction from JD
  - Student-job compatibility scoring
  - Missing skills identification
  - Recommended candidates for posted jobs

### 📝 ResuMate - AI Resume Tools

#### **Resume Analysis:**
- Upload resume (PDF/DOCX) for AI parsing
- Extract skills, projects, internships, certificates
- ATS (Applicant Tracking System) scoring (0-100)
- Identify missing keywords and skills
- Format and structure analysis

#### **AI Improvement Suggestions:**
- Claude-powered resume enhancement tips
- Section-by-section recommendations
- Keyword optimization for target roles
- Action verb suggestions
- Quantifiable achievement recommendations

#### **Mock Interviews:**
- Role-specific interview questions
- AI feedback on responses
- Performance analytics
- Practice tracking

### 👥 Community Module

- **Feed System:**
  - Create text, image, or poll posts
  - Upvote/downvote mechanism
  - Commenting and threading
  - Tag-based filtering
  - Real-time updates

- **Events Management:**
  - Upcoming events calendar
  - Past events archive
  - Event reminders and notifications
  - RSVP tracking
  - Attendee lists

- **Student-Led Sessions:**
  - Students can propose sessions
  - Alumni can endorse and participate
  - Session scheduling and reminders
  - Feedback collection

### 🔐 Authentication & Authorization

- **Google OAuth 2.0** integration
- JWT-based session management
- Role-based access control (Student/Alumni)
- Secure password hashing (bcrypt)
- Protected routes and API endpoints

### 📊 Analytics & Reporting

- User engagement metrics
- Mentorship session statistics
- Job application tracking
- Community activity insights
- Export capabilities

---

## 🛠 Tech Stack

### **Backend**

| Technology | Purpose |
|------------|---------|
| **Node.js + Express** | Primary backend server |
| **TypeScript** | Type-safe backend development |
| **MongoDB + Mongoose** | NoSQL database with ODM |
| **Python + FastAPI** | AI services and Streamlit UI |
| **JWT** | Authentication tokens |
| **Bcrypt** | Password hashing |
| **Multer** | File upload handling |

### **Frontend**

| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework |
| **Vite** | Build tool and dev server |
| **Tailwind CSS** | Utility-first styling |
| **Lucide React** | Icon library |
| **React Hot Toast** | Notifications |
| **Axios** | HTTP client |

### **AI & Machine Learning**

| Technology | Purpose |
|------------|---------|
| **Anthropic Claude (Sonnet-4)** | Resume analysis, mentorship matching |
| **Groq API** | Fast LLM inference for job matching |
| **OpenAI GPT** | Alternative LLM provider |
| **LangChain** | LLM orchestration framework |
| **n8n** | Resume parsing workflow |

### **Databases**

| Technology | Purpose |
|------------|---------|
| **MongoDB Atlas** | Primary database (production) |
| **PostgreSQL** | Alternative SQL database (backup) |
| **MySQL** | Alternative SQL database (backup) |

### **DevOps & Deployment**

| Technology | Purpose |
|------------|---------|
| **Render** | Backend deployment |
| **Vercel** | Frontend deployment |
| **Heroku** | n8n workflow automation |
| **GitHub Actions** | CI/CD pipelines |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│               Client Layer (React on Vercel)                 │
│  - Alumni Directory  - Mentorship Dashboard                  │
│  - Job Portal        - Community Feed                        │
│  - Resume Tools      - Profile Management                    │
└──────────────────────┬──────────────────────────────────────┘
                       │ REST API (Axios)
┌──────────────────────┴──────────────────────────────────────┐
│         Backend Layer (Node.js + TypeScript on Render)       │
│                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐  │
│  │ Auth Routes    │  │ Alumni Routes  │  │ Job Routes   │  │
│  │ - Google OAuth │  │ - Directory    │  │ - Posting    │  │
│  │ - JWT Tokens   │  │ - Profiles     │  │ - Matching   │  │
│  └────────────────┘  └────────────────┘  └──────────────┘  │
│                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐  │
│  │ Mentorship     │  │ Community      │  │ Resume API   │  │
│  │ Routes         │  │ Routes         │  │              │  │
│  │ - Matching     │  │ - Feed, Events │  │ - Analysis   │  │
│  └────────────────┘  └────────────────┘  └──────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────────┐
│                   Service Layer                              │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │      LangChain Matching Service (Claude AI)            │ │
│  │  - Student-Alumni Matching                             │ │
│  │  - Resume-JD Matching                                  │ │
│  │  - ATS Analysis                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐  │
│  │ n8n Workflow   │  │ Groq Service   │  │ Email/SMS    ���  │
│  │ (Heroku)       │  │ - Fast LLM     │  │ Notifications│  │
│  │ Resume Parser  │  │                │  │              │  │
│  └────────────────┘  └────────────────┘  └──────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────────┐
│            Database Layer (MongoDB Atlas)                    │
│                                                              │
│  Collections:                                                │
│  - users              - alumni_profiles                      │
│  - student_profiles   - mentorship_requests                 │
│  - mentorship_sessions - jobs                               │
│  - job_applications   - feed_posts                          │
│  - events             - comments                            │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow Examples

#### 1. **Student Requests Mentorship:**
```
Student → Vercel Frontend → POST /api/mentorship/student/profile/create
          ↓
          Upload Resume
          ↓
n8n Workflow (Heroku) → Parse Resume (Skills, Projects, etc.)
          ↓
Backend (Render) → Save StudentProfile (MongoDB Atlas)
          ↓
POST /api/mentorship/student/{userId}/find-mentors
          ↓
LangChain Service → Fetch Alumni Profiles
          ↓
Claude AI → Match Algorithm (Skills + Domain + Experience)
          ↓
Return Top 10 Matched Mentors with Scores & Reasons
          ↓
Frontend → Display Mentor Recommendations
```

#### 2. **Alumni Posts Job:**
```
Alumni → Vercel Frontend → POST /api/jobs/create
         ↓
         Job Details (Title, Company, JD, Skills)
         ↓
Backend (Render) → Save Job (MongoDB Atlas)
         ↓
AI Service → Extract Required Skills from JD
         ↓
         Fetch Student Profiles
         ↓
         Match Students to Job (Skill Overlap)
         ↓
         Rank Candidates
         ↓
Return Matched Students
         ↓
Frontend → Display Recommended Candidates
```

---

## 🚀 Installation

### Prerequisites

Ensure you have the following installed:

- **Node.js** ≥ 18.0.0 ([Download](https://nodejs.org/))
- **Python** ≥ 3.13 ([Download](https://www.python.org/))
- **MongoDB** (Local or Atlas account) ([Download](https://www.mongodb.com/))
- **Git** ([Download](https://git-scm.com/))
- **npm** or **yarn** (comes with Node.js)

### 1. Clone the Repository

```bash
git clone https://github.com/ayaz9616/AI-Powered-Alumni-Association-Project.git
cd AI-Powered-Alumni-Association-Project
```

### 2. Backend Setup (Node.js + TypeScript)

```bash
cd backend-node
```

#### Install Dependencies

```bash
npm install
```

#### Create `.env` File

Create a `.env` file in the `backend-node/` directory:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB Atlas
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/alumni_hacktopia

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Google OAuth (Get from Google Cloud Console)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://your-backend-render-url.onrender.com/api/auth/google/callback

# AI Services
ANTHROPIC_API_KEY=sk-ant-xxxxx  # For Claude AI (Resume analysis, mentorship matching)
GROQ_API_KEY=gsk_xxxxx          # For Groq (Fast job matching)
OPENAI_API_KEY=sk-xxxxx         # Optional alternative

# n8n Resume Parser (Heroku)
N8N_WEBHOOK_URL=https://your-n8n-app.herokuapp.com/webhook/resume-parser

# Frontend URL (Vercel)
FRONTEND_URL=https://your-app.vercel.app

# File Upload
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880  # 5MB

# Email (Optional - for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

#### Import Alumni Data

The project includes a CSV file with 387+ alumni profiles. Import them:

```bash
npm run import:alumni
```

This script reads `frontend1/resume/public/alumni_export_2025-11-05.csv` and populates MongoDB.

#### Run Backend Server

Development mode (with hot reload):
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

Backend will run on `http://localhost:5000`

### 3. Frontend Setup (React + Vite)

Open a new terminal:

```bash
cd frontend1/resume
```

#### Install Dependencies

```bash
npm install
```

#### Create `.env` File

Create a `.env` file in the `frontend1/resume/` directory:

```env
VITE_API_URL=https://your-backend-render-url.onrender.com
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

#### Run Frontend Server

```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

### 4. Database Setup - MongoDB Atlas

1. Create free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Create a database user
4. Whitelist your IP address (or `0.0.0.0/0` for development)
5. Get connection string and update `MONGO_URI` in backend `.env`

### 5. n8n Setup (Heroku)

Your n8n instance is already deployed on Heroku. To set up the resume parsing workflow:

1. Access your n8n Heroku app
2. Import the resume parsing workflow
3. Activate the workflow
4. Copy the webhook URL
5. Add to backend `.env` as `N8N_WEBHOOK_URL`

---

## ⚙️ Configuration

### API Keys Setup

#### 1. **Google OAuth Credentials**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
5. Choose "Web application"
6. Add authorized redirect URIs:
   - Development: `http://localhost:5000/api/auth/google/callback`
   - Production: `https://your-backend-render-url.onrender.com/api/auth/google/callback`
7. Copy Client ID and Client Secret to `.env`

#### 2. **Anthropic Claude API Key**

1. Sign up at [Anthropic Console](https://console.anthropic.com/)
2. Go to API Keys
3. Generate new key
4. Add to `.env` as `ANTHROPIC_API_KEY`

#### 3. **Groq API Key**

1. Sign up at [Groq Console](https://console.groq.com/)
2. Generate API key
3. Add to `.env` as `GROQ_API_KEY`

#### 4. **n8n Workflow (Heroku)**

Your n8n instance on Heroku should expose a webhook URL for resume parsing. Update `N8N_WEBHOOK_URL` in backend `.env`.

---

## 💻 Usage

### Running Locally

1. **Start Backend:**
   ```bash
   cd backend-node
   npm run dev
   ```

2. **Start Frontend (new terminal):**
   ```bash
   cd frontend1/resume
   npm run dev
   ```

3. **Access Application:**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000`

### Production URLs

- **Frontend (Vercel):** `https://your-app.vercel.app`
- **Backend (Render):** `https://your-backend.onrender.com`
- **n8n (Heroku):** `https://your-n8n-app.herokuapp.com`

### User Flows

#### **For Students:**

1. **Sign Up/Login:**
   - Click "Login with Google"
   - Complete profile (set role as "Student")

2. **Create Student Profile:**
   - Go to "Mentorship" → "Student Dashboard"
   - Upload resume (PDF/DOCX) OR fill manual form
   - AI parses and extracts information
   - Review and confirm profile

3. **Find Mentors:**
   - Click "Find Mentors"
   - View AI-matched top 10 mentors with:
     - Match score (0-100%)
     - Matching skills
     - Overlapping domains
     - AI-generated reasons
   - Click "View Profile" to see mentor details

4. **Request Mentorship:**
   - Select mentor
   - Choose available time slot
   - Write message
   - Submit request
   - Track status in dashboard

5. **Browse Jobs:**
   - Go to "Job Portal"
   - Filter by domain, company, location
   - View AI match score for each job
   - Apply with one click
   - Track applications

6. **Improve Resume:**
   - Go to "ResuMate" → "Resume Analysis"
   - Upload resume
   - Get ATS score and AI suggestions
   - Download improved version

#### **For Alumni:**

1. **Sign Up/Login:**
   - Login with Google
   - Complete profile (set role as "Alumni")

2. **Create Mentor Profile:**
   - Go to "Mentorship" → "Alumni Dashboard"
   - Upload resume OR fill manual form
   - Define expertise domains
   - Set mentorship preferences
   - Add recurring availability slots

3. **Post Jobs:**
   - Go to "Job Portal" → "Post Job"
   - Fill job details (title, company, JD, skills)
   - AI suggests matched students
   - Review applications
   - Track referrals

4. **Manage Mentorship:**
   - View incoming requests
   - Accept/reject requests
   - Schedule sessions
   - Conduct 1:1 or group sessions
   - Provide feedback

5. **Engage in Community:**
   - Post updates in feed
   - Create events
   - Host student-led sessions

---

## 📡 API Documentation

### Base URLs
- **Development:** `http://localhost:5000/api`
- **Production:** `https://your-backend-render-url.onrender.com/api`

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/google` | Google OAuth login |
| POST | `/auth/logout` | Logout user |
| GET | `/auth/me` | Get current user |

### Alumni Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/alumni` | Get all alumni (with filters) |
| GET | `/alumni/stats` | Get alumni statistics |
| GET | `/alumni/:id` | Get alumni by ID |

**Query Parameters for `/alumni`:**
- `search` - Search by name, skills, experience
- `course` - Filter by course
- `batch` - Filter by batch year
- `city` - Filter by location
- `company` - Filter by company
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 20)

### Mentorship Endpoints

#### Student Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/mentorship/student/profile/create` | Create student profile (with resume upload) |
| POST | `/mentorship/student/profile/manual` | Create profile manually |
| GET | `/mentorship/student/profile/:userId` | Get student profile |
| PUT | `/mentorship/student/profile/:userId` | Update profile |
| POST | `/mentorship/student/:userId/find-mentors` | AI-powered mentor matching |
| POST | `/mentorship/student/:userId/request/:alumniId` | Request mentorship |
| GET | `/mentorship/student/:userId/requests` | Get all requests |

#### Alumni Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/mentorship/alumni/profile/create` | Create alumni profile (with resume upload) |
| POST | `/mentorship/alumni/profile/manual` | Create profile manually |
| GET | `/mentorship/alumni/profile/:userId` | Get alumni profile |
| PUT | `/mentorship/alumni/profile/:userId` | Update profile |
| GET | `/mentorship/alumni/:userId/requests` | Get incoming requests |
| PUT | `/mentorship/alumni/:userId/request/:requestId` | Accept/reject request |
| POST | `/mentorship/alumni/:userId/availability` | Set availability |

### Job Portal Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/jobs/create` | Post new job (alumni only) |
| GET | `/jobs` | Get all jobs (with filters) |
| GET | `/jobs/:id` | Get job details |
| POST | `/jobs/:id/apply` | Apply to job (student only) |
| POST | `/jobs/:id/match-students` | AI-match students to job |
| GET | `/jobs/:id/applications` | Get applications (alumni only) |
| PUT | `/applications/:id/status` | Update application status |

### Community Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/community/posts` | Create post |
| GET | `/community/posts` | Get feed posts |
| POST | `/community/posts/:id/vote` | Upvote/downvote |
| POST | `/community/posts/:id/comment` | Add comment |
| GET | `/community/events` | Get events |
| POST | `/community/events` | Create event |
| POST | `/community/events/:id/rsvp` | RSVP to event |

### Resume Analysis Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/resume/analyze` | Analyze resume with ATS scoring |
| POST | `/resume/improve` | Get AI improvement suggestions |
| POST | `/resume/parse` | Parse resume via n8n |

---

## 🤖 AI Features

### 1. **Mentorship Matching (Claude Sonnet-4)**

**Algorithm:**
```typescript
matchStudentWithAlumni(student, alumniList) {
  // 1. Extract student profile
  const studentProfile = {
    skills: ["React", "Node.js", "Python"],
    domain: "Software Engineering",
    careerGoals: "Full-stack developer",
    matchKeywords: ["web dev", "backend", "frontend"]
  };

  // 2. Fetch all active alumni mentor profiles
  const alumniProfiles = [
    {
      userId: "alumni123",
      skills: ["React", "Node.js", "AWS"],
      currentRole: "Senior SDE",
      domainsOfExpertise: ["Web Development", "Cloud"],
      totalExperience: "5 years"
    },
    // ... more alumni
  ];

  // 3. Send to Claude AI with structured prompt
  const prompt = buildMatchingPrompt(studentProfile, alumniProfiles);
  
  // 4. Claude returns JSON with match scores, reasons, overlaps
  const matches = await claude.analyze(prompt);

  // 5. Return top 10 matches sorted by score
  return matches.sort((a, b) => b.matchScore - a.matchScore).slice(0, 10);
}
```

**Match Score Factors:**
- **Skill Overlap (40%):** Number of shared skills
- **Domain Alignment (30%):** Career goals match with mentor's field
- **Experience Relevance (20%):** Mentor's years in target domain
- **Availability (10%):** Open mentorship slots

**Example Response:**
```json
{
  "matches": [
    {
      "alumniId": "alumni123",
      "matchScore": 0.92,
      "reasons": [
        "Strong skill overlap in React, Node.js, AWS",
        "5 years experience in target domain (Web Development)",
        "Currently working as Senior SDE at top tech company"
      ],
      "skillOverlap": ["React", "Node.js", "TypeScript"],
      "domainOverlap": ["Software Engineering", "Full-stack"]
    }
  ]
}
```

### 2. **Resume ATS Analysis (Claude)**

**Features:**
- **ATS Score (0-100):** Industry-standard scoring
- **Keyword Extraction:** Identify missing JD keywords
- **Format Check:** Structure, readability, consistency
- **Improvement Suggestions:** Action verbs, quantifiable achievements

**Example:**
```json
{
  "atsScore": 78,
  "missingSkills": ["Docker", "Kubernetes", "CI/CD"],
  "improvementSuggestions": [
    "Add quantifiable metrics to achievements (e.g., 'Improved performance by 30%')",
    "Use stronger action verbs: 'Led' instead of 'Worked on'",
    "Add certifications section"
  ],
  "strengthAreas": ["Technical Skills", "Project Experience"]
}
```

### 3. **Job-Student Matching (Groq)**

**Fast matching using Groq's optimized LLM inference:**

```typescript
matchStudentsToJob(jobDetails, studentProfiles) {
  // Extract required skills from JD
  const requiredSkills = extractSkills(jobDetails.description);
  
  // For each student, calculate match score
  const matches = studentProfiles.map(student => {
    const skillOverlap = intersection(student.skills, requiredSkills);
    const score = (skillOverlap.length / requiredSkills.length) * 100;
    const missingSkills = difference(requiredSkills, student.skills);
    
    return {
      studentId: student.userId,
      matchScore: score,
      skillOverlap,
      missingSkills
    };
  });

  return matches.sort((a, b) => b.matchScore - a.matchScore);
}
```

### 4. **AI-Powered Resume Parsing (n8n on Heroku)**

**Workflow:**
1. Student uploads PDF/DOCX resume
2. Frontend sends to backend (Render)
3. Backend forwards to n8n webhook (Heroku)
4. n8n extracts:
   - Personal info (name, email, phone)
   - Education (degree, branch, batch, CGPA)
   - Skills
   - Projects (name, description, tech stack, links)
   - Internships (company, role, duration, description)
   - Certificates
5. Structured JSON returned
6. Backend saves to `parsedResume` field in MongoDB

---

## 📁 Project Structure

```
Alumni_Hacktopia/
├── backend-node/                      # Node.js + TypeScript Backend (Render)
│   ├── src/
│   │   ├── index.ts                   # Server entry point
│   │   ├── models/                    # Mongoose models
│   │   │   ├── Alumni.ts              # Alumni schema
│   │   │   ├── Mentorship.ts          # Student/Alumni profiles, requests, sessions
│   │   │   ├── Job.ts                 # Job postings and applications
│   │   │   ├── Community.ts           # Posts, comments, events
│   │   │   └── User.ts                # User authentication
│   │   ├── routes/                    # API routes
│   │   │   ├── auth.routes.ts         # Authentication (Google OAuth, JWT)
│   │   │   ├── alumni.routes.ts       # Alumni directory
│   │   │   ├── mentorship.routes.ts   # Mentorship matching & management
│   │   │   ├── job.routes.ts          # Job portal
│   │   │   ├── community.routes.ts    # Feed, events, sessions
│   │   │   └── resume.routes.ts       # Resume analysis
│   │   ├── services/                  # Business logic
│   │   │   └── LangChainMatchingService.ts  # Claude AI matching
│   │   ├── middleware/                # Auth, validation, error handling
│   │   ├── scripts/                   # Utility scripts
│   │   │   └── importAlumni.ts        # CSV import script
│   │   └── utils/                     # Helper functions
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                           # Environment variables
│
├── frontend1/resume/                  # React + Vite Frontend (Vercel)
│   ├── public/
│   │   └── alumni_export_2025-11-05.csv  # Alumni data (387+ profiles)
│   ├── src/
│   │   ├── App.jsx                    # Main app component
│   │   ├── main.jsx                   # React entry point
│   │   ├── components/                # React components
│   │   │   ├── Navbar.jsx             # Navigation bar
│   │   │   ├── Dashboard.jsx          # Main dashboard
│   │   │   ├── AlumniDashboard.jsx    # Alumni mentor dashboard
│   │   │   ├── StudentDashboard.jsx   # Student dashboard
│   │   │   ├── alumni/
│   │   │   │   └── AlumniDirectory.jsx     # Alumni listing & search
│   │   │   ├── community/
│   │   │   │   ├── Feed.jsx           # Community feed
│   │   │   │   ├── Events.jsx         # Events calendar
│   │   │   │   └── Sessions.jsx       # Student-led sessions
│   │   │   └── jobs/
│   │   │       ├── JobPortal.jsx      # Job listings
│   │   │       └── PostJob.jsx        # Job posting form
│   │   ├── services/                  # API client
│   │   │   ├── api.js                 # Axios configuration
│   │   │   ├── alumniApi.js           # Alumni API calls
│   │   │   ├── mentorshipApi.js       # Mentorship API calls
│   │   │   ├── jobApi.js              # Job API calls
│   │   │   └── communityApi.js        # Community API calls
│   │   └── utils/                     # Helper functions
│   │       └── auth.js                # JWT handling
│   ├── package.json
│   └── .env                           # Environment variables
│
├── app.py                             # Streamlit app (alternative UI)
├── backend.py                         # Python backend (if used)
├── database.py                        # Database utilities
├── agents.py                          # AI agent configuration
│
├── requirements.txt                   # Python dependencies
├── runtime.txt                        # Python version
├── Procfile                           # Heroku deployment (n8n)
├── render.yaml                        # Render deployment config
│
├── SETUP.md                           # Detailed setup guide
├── DEPLOYMENT_GUIDE.md                # Deployment instructions
├── COMMUNITY_IMPLEMENTATION.md        # Community module docs
├── COMMUNITY_MODULE_DOCUMENTATION.md  # Community API docs
└── README.md                          # This file
```

---

## 🚢 Deployment

### Current Deployment Architecture

```
┌─────────────────────────────────────────┐
│         Frontend (Vercel)                │
│   https://your-app.vercel.app          │
│   - Automatic deploys from main branch  │
│   - Edge network (global CDN)           │
│   - Environment variables configured    │
└─────────────┬───────────────────────────┘
              │
              ↓ REST API calls
┌─────────────────────────────────────────┐
│      Backend (Render)                    │
│   https://your-backend.onrender.com    │
│   - Node.js + TypeScript                │
│   - MongoDB Atlas connection            │
│   - Auto-deploy from GitHub             │
│   - Environment variables set           │
└─────────────┬───────────────────────────┘
              │
              ↓ Resume parsing requests
┌─────────────────────────────────────────┐
│        n8n (Heroku)                      │
│   https://your-n8n-app.herokuapp.com   │
│   - Workflow automation                 │
│   - Resume parsing webhook              │
│   - PDF/DOCX extraction                 │
└─────────────────────────────────────────┘
```

### Deployment Steps

#### 1. **Backend Deployment (Render)**

Your backend is already deployed on Render. To update:

```bash
# Render automatically deploys when you push to main branch
git add .
git commit -m "Update backend"
git push origin main
```

**Environment Variables on Render:**
Ensure these are set in Render dashboard:
- `MONGO_URI`
- `JWT_SECRET`
- `ANTHROPIC_API_KEY`
- `GROQ_API_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `N8N_WEBHOOK_URL`
- `FRONTEND_URL`

#### 2. **Frontend Deployment (Vercel)**

Your frontend is deployed on Vercel. To update:

```bash
# Vercel automatically deploys when you push to main branch
git add .
git commit -m "Update frontend"
git push origin main
```

**Environment Variables on Vercel:**
Set these in Vercel project settings:
- `VITE_API_URL` → Your Render backend URL
- `VITE_GOOGLE_CLIENT_ID` → Same as backend

#### 3. **n8n Deployment (Heroku)**

Your n8n instance is already on Heroku. To manage:

```bash
# View logs
heroku logs --tail --app your-n8n-app

# Restart dyno
heroku restart --app your-n8n-app

# Scale up/down
heroku ps:scale web=1 --app your-n8n-app
```

### Monitoring & Logs

**Render (Backend):**
- View logs in Render dashboard
- Set up alerts for errors
- Monitor API response times

**Vercel (Frontend):**
- View deployment logs in Vercel dashboard
- Analytics for page views and performance
- Error tracking in browser console

**Heroku (n8n):**
- Use `heroku logs --tail`
- Monitor workflow executions
- Check webhook response times

### Custom Domains (Optional)

**Frontend (Vercel):**
1. Go to Vercel project settings
2. Add custom domain (e.g., `alumnihacktopia.com`)
3. Update DNS records with your provider
4. SSL automatically provisioned

**Backend (Render):**
1. Go to Render service settings
2. Add custom domain (e.g., `api.alumnihacktopia.com`)
3. Update DNS records
4. SSL automatically provisioned

---

## 🤝 Contributing

We welcome contributions! Follow these steps:

1. **Fork the repository**
2. **Create a feature branch:**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Commit with descriptive message:**
   ```bash
   git commit -m "Add: Amazing new feature"
   ```
5. **Push to your fork:**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

### Development Guidelines

- Follow existing code style (ESLint/Prettier configured)
- Write descriptive commit messages
- Update documentation for new features
- Test locally before submitting PR
- Add comments for complex logic

### Reporting Issues

Found a bug? [Open an issue](https://github.com/ayaz9616/AI-Powered-Alumni-Association-Project/issues) with:

- Clear title and description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Environment details (OS, browser, Node version)

---

## 🎯 Roadmap

### Current Features ✅
- [x] Alumni Directory with search & filters
- [x] AI-powered mentorship matching
- [x] Job portal with student-job matching
- [x] Resume ATS analysis
- [x] Community feed & events
- [x] Google OAuth authentication
- [x] Student & alumni dashboards
- [x] Deployed on Render + Vercel + Heroku

### Upcoming Features 🚀
- [ ] **Video calling integration** (WebRTC for mentorship sessions)
- [ ] **Real-time notifications** (Socket.io)
- [ ] **Advanced analytics dashboard** (engagement metrics, success stories)
- [ ] **Mobile app** (React Native)
- [ ] **Email/SMS reminders** (Twilio, SendGrid)
- [ ] **Donation/fundraising module**
- [ ] **Alumni success stories blog**
- [ ] **Career path visualization** (D3.js graphs)
- [ ] **AI chatbot** for alumni queries
- [ ] **Batch-wise reunion planning**

---

## 📞 Contact & Support

### Documentation

- [Setup Guide](SETUP.md) - Detailed installation instructions
- [Deployment Guide](DEPLOYMENT_GUIDE.md) - Production deployment
- [Community Module Docs](COMMUNITY_MODULE_DOCUMENTATION.md) - Community feature specs

### Get in Touch

- **GitHub Issues:** [Report bugs or request features](https://github.com/ayaz9616/AI-Powered-Alumni-Association-Project/issues)
- **GitHub Discussions:** Share ideas and ask questions

### FAQ

**Q: Do I need all API keys to run the project?**  
A: No! AI features gracefully degrade to basic algorithms if API keys are not configured. Core features (directory, community, jobs) work without AI.

**Q: Can I use OpenAI instead of Anthropic Claude?**  
A: Yes! The `LangChainMatchingService` can be configured to use OpenAI GPT-4. Update the service to use `OpenAI` client instead of `Anthropic`.

**Q: How do I add more alumni data?**  
A: Edit `frontend1/resume/public/alumni_export_2025-11-05.csv` and run `npm run import:alumni` in the backend directory.

**Q: How do I access production logs?**  
A: 
- **Backend:** Render dashboard → Logs tab
- **Frontend:** Vercel dashboard → Deployments → View logs
- **n8n:** `heroku logs --tail --app your-n8n-app`

**Q: What's the free tier limitation?**  
A: 
- **Render:** Backend sleeps after 15 mins of inactivity (takes 30-60s to wake up)
- **Vercel:** Unlimited deployments, bandwidth limits apply
- **Heroku:** n8n on free tier sleeps after 30 mins
- **MongoDB Atlas:** 512MB storage on free tier

---

## 📊 Stats

- **387+ Alumni Profiles**
- **AI-Powered Matching with Claude Sonnet-4**
- **ATS Resume Scoring**
- **Job Portal with Smart Matching**
- **Community Engagement Platform**
- **Deployed on Production (Render + Vercel + Heroku)**
- **100% Open Source**

---

<div align="center">

**Made with ❤️ by the Alumni Hacktopia Team**

[⬆ Back to Top](#-alumni-hacktopia---ai-powered-alumni-association-platform)

</div>
