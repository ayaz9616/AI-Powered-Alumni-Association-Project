# Alumni Hacktopia - Setup Guide

Complete guide to set up and run the Alumni-Student Mentorship Platform on a new system.

## Prerequisites

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB Atlas Account** (or local MongoDB) - [Sign up](https://www.mongodb.com/cloud/atlas)
- **Git** - [Download](https://git-scm.com/)
- **VS Code** (recommended) - [Download](https://code.visualstudio.com/)

## Step 1: Clone Repository

```bash
git clone <your-repository-url>
cd Alumni_Hacktopia
```

## Step 2: Backend Setup

### 2.1 Install Dependencies

```bash
cd backend-node
npm install
```

### 2.2 Create Environment File

Create a `.env` file in the `backend-node` folder:

```env
# MongoDB Configuration (REQUIRED)
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/
MONGO_DB_NAME=hacktopia

# Server Configuration (REQUIRED)
PORT=8000
NODE_ENV=development

# CORS Origins (REQUIRED)
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# AI/ML Service Keys (OPTIONAL - but recommended for full features)
# For Resume Analysis & Improvement
ANTHROPIC_API_KEY=your_anthropic_key_here

# For AI-Powered Student-Job Matching
GROQ_API_KEY=your_groq_key_here

# Alternative to Groq (choose one)
OPENAI_API_KEY=your_openai_key_here
```

**Important:** 
- Replace `<username>` and `<password>` with your MongoDB Atlas credentials.
- AI features will use fallback scoring if API keys are not provided.

### 2.3 Get AI API Keys (Optional)

**For Resume Analysis (Anthropic Claude):**
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign up and create an API key
3. Add to `.env`: `ANTHROPIC_API_KEY=sk-ant-...`

**For Student-Job Matching (Groq):**
1. Go to [Groq Console](https://console.groq.com/)
2. Sign up (free tier available)
3. Create an API key
4. Add to `.env`: `GROQ_API_KEY=gsk_...`

**Alternative - OpenAI:**
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an API key
3. Add to `.env`: `OPENAI_API_KEY=sk-...`

**Note:** The system works without AI keys but will use basic matching algorithms instead.

### 2.3 Get AI API Keys (Optional)

**For Resume Analysis (Anthropic Claude):**
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign up and create an API key
3. Add to `.env`: `ANTHROPIC_API_KEY=sk-ant-...`

**For Student-Job Matching (Groq):**
1. Go to [Groq Console](https://console.groq.com/)
2. Sign up (free tier available)
3. Create an API key
4. Add to `.env`: `GROQ_API_KEY=gsk_...`

**Alternative - OpenAI:**
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an API key
3. Add to `.env`: `OPENAI_API_KEY=sk-...`

**Note:** The system works without AI keys but will use basic matching algorithms instead.

### 2.4 Import Alumni Data (First Time Only)

```bash
npm run import:alumni
```

This will import 387+ alumni records from the CSV file into MongoDB.

### 2.5 Start Backend Server

```bash
npm run dev
```

Backend will run on `http://localhost:8000`

**Verify:** Open `http://localhost:8000/api/health` in browser - should show "healthy" status.

## Step 3: Frontend Setup

### 3.1 Install Dependencies

Open a new terminal:

```bash
cd frontend1/resume
npm install
```

### 3.2 Start Frontend Server

```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## Step 4: Access the Application

Open your browser and go to: `http://localhost:5173`

### Default Test Accounts

For testing, you can create accounts through the signup page:
- **Student Account**: Use any email, select "Student" role
- **Alumni Account**: Use any email, select "Alumni" role

## Project Structure

```
Alumni_Hacktopia/
├── backend-node/               # Node.js + TypeScript Backend
│   ├── src/
│   │   ├── models/            # MongoDB Models (Alumni, Community, Jobs)
│   │   ├── routes/            # API Routes
│   │   ├── scripts/           # Utility scripts (CSV import)
│   │   └── index.ts           # Server entry point
│   ├── package.json
│   └── .env                   # Create this file
│
├── frontend1/resume/          # React + Vite Frontend
│   ├── src/
│   │   ├── components/        # All React components
│   │   │   ├── alumni/       # Alumni Directory
│   │   │   └── community/    # Community Features
│   │   └── services/          # API clients
│   └── package.json
│
└── frontend1/resume/public/
    └── alumni_export_2025-11-05.csv  # Alumni data
```

## Features Available

✅ **Alumni Directory** - Browse 387+ alumni profiles with search/filter  
✅ **Community Module**
  - Feed (posts, voting, comments)
  - Upcoming Events (with reminders)
  - Past Events
  - Student-led Sessions

✅ **Job Portal**
  - Alumni can post jobs
  - **AI-powered student matching** (requires GROQ_API_KEY or OPENAI_API_KEY)
  - Referral tracking

✅ **ResuMate Tools**
  - **Resume analysis** (requires ANTHROPIC_API_KEY)
  - **AI improvement suggestions** (requires ANTHROPIC_API_KEY)
  - Mock interviews

**Note:** AI features will gracefully degrade to basic algorithms if API keys are not configured.

## Common Issues & Solutions

### MongoDB Connection Failed
- Check your IP is whitelisted in MongoDB Atlas Network Access
- Verify credentials in `.env` file
- Ensure `MONGO_URI` format is correct

### Port Already in Use
- Backend (8000): `netstat -ano | findstr :8000` (Windows) or `lsof -i :8000` (Mac/Linux)
- Kill the process and restart

### Alumni Data Not Loading
- Run the import script: `npm run import:alumni`
- Check MongoDB connection is successful
- Verify backend is running on port 8000

### Frontend Shows 404 Errors
- Ensure backend is running first
- Check CORS_ORIGINS in `.env` includes `http://localhost:5173`
- Restart backend after changing `.env`

## Development Commands

### Backend (backend-node/)
```bash
npm run dev          # Start development server with hot reload
npm run build        # Compile TypeScript to JavaScript
npm start            # Run compiled production build
npm run import:alumni # Import alumni data from CSV
```

### Frontend (frontend1/resume/)
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## Tech Stack

**Backend:**
- Node.js + TypeScript
- Express.js
- MongoDB + Mongoose
- Anthropic Claude AI
- Groq Llama AI

**Frontend:**
- React 19.2
- Vite
- Tailwind CSS 3
- React Router v7
- Axios
- Framer Motion
- React Hot Toast

## Need Help?

- Check backend logs in the terminal where `npm run dev` is running
- Check browser console for frontend errors (F12)
- Ensure both servers are running simultaneously
- Verify MongoDB connection in backend logs

## Production Deployment

For production deployment:
1. Update `MONGO_URI` with production database
2. Update `CORS_ORIGINS` with production frontend URL
3. Set `NODE_ENV=production`
4. Build both frontend and backend
5. Deploy backend to services like Railway, Render, or Heroku
6. Deploy frontend to Vercel, Netlify, or similar

---

**Setup Complete!** 🎉  
You should now have both backend and frontend running successfully.
