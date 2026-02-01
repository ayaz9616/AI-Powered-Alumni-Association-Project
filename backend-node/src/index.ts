import express, { Application } from 'express';
import mongoose from 'mongoose';
import cors, { CorsOptions } from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import resumeRoutes from './routes/resume.routes';
import interviewRoutes from './routes/interview.routes';
import jobRoutes from './routes/job.routes';
import settingsRoutes from './routes/settings.routes';
import mentorshipRoutes from './routes/mentorship.routes';
import jobsRoutes from './routes/jobs.routes';
import sessionRoutes from './routes/session.routes';
import adminRoutes from './routes/admin.routes';
import communityRoutes from './routes/community.routes';
import alumniRoutes from './routes/alumni.routes';
import donationsRoutes from './routes/donations.routes';
import { errorHandler } from './middleware/error.middleware';

// Load environment variables
// 1) Load from backend-node/.env (working directory)
dotenv.config();
// 2) Also try loading from project root .env (one directory up)
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const app: Application = express();
const PORT = process.env.PORT || 8000;
const MONGO_URI = process.env.MONGO_URI || '';
const DB_NAME = process.env.MONGO_DB_NAME || 'hacktopia';
const DEFAULT_MONGO_URI = 'mongodb://127.0.0.1:27017/hacktopia';
const isValidMongoUri = (uri: string) => uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://');
const EFFECTIVE_MONGO_URI = isValidMongoUri(MONGO_URI) ? MONGO_URI : DEFAULT_MONGO_URI;
if (!isValidMongoUri(MONGO_URI)) {
  console.warn('⚠️ MONGO_URI missing or invalid. Falling back to local MongoDB:', DEFAULT_MONGO_URI);
}

// Middleware
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses
app.use(morgan('dev')); // Logging

// CORS with multiple allowed origins
const rawOrigins = process.env.CORS_ORIGINS || process.env.FRONTEND_URL || 'http://localhost:3000,http://localhost:5173,http://localhost:5174,http://localhost:8501';
const allowedOrigins = rawOrigins.split(',').map((o) => o.trim());
const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (no origin) and any configured origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get('/', (_req, res) => {
  res.json({
    name: 'ResuMate API - Alumni Mentorship Platform',
    version: '2.0.0',
    description: 'AI-Powered Resume Tracking, Mock Interview & Alumni-Student Mentorship System',
    docs: '/api/docs',
    status: 'healthy',
    features: [
      'Resume Analysis & Scoring',
      'AI-Powered Resume Improvement',
      'Mock Interview with Q&A',
      'Job Search Integration',
      'Smart Recommendations',
      '🆕 AI-Driven Alumni-Student Mentorship',
      '🆕 Intelligent Mentor Matching',
      '🆕 Session Scheduling & Feedback',
      '🆕 Admin Analytics Dashboard'
    ]
  });
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/resume', resumeRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/mentorship', mentorshipRoutes);
app.use('/api/mentorship/jobs', jobsRoutes);
app.use('/api/mentorship', sessionRoutes);
app.use('/api/mentorship', adminRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api/donations', donationsRoutes);

// Error handling
app.use(errorHandler);

// Start server first (don't wait for MongoDB)
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║          🤖 ResuMate Node.js Backend v2.0.0             ║
║                                                          ║
║  AI-Powered Resume Tracking & Mock Interview System      ║
║  🆕 + Alumni-Student Mentorship Platform                ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝

📚 API Base URL: http://localhost:${PORT}
🌐 Health Check: http://localhost:${PORT}/api/health

Features:
✅ Resume Upload & Analysis (n8n parsing + LangChain AI)
✅ AI-Powered Resume Improvement
✅ Mock Interview with Q&A
✅ Job Search Integration
✅ Smart Recommendations
🆕 Alumni-Student Mentorship Platform
🆕 Intelligent Mentor Matching (LangChain)
🆕 Session Scheduling & Feedback
🆕 Admin Analytics Dashboard
🆕 Role-Based Authentication (Student/Alumni/Admin)

Server is running...
Connecting to MongoDB...
  `);
});

// MongoDB Connection (async, non-blocking)
mongoose.connect(EFFECTIVE_MONGO_URI, { dbName: DB_NAME })
  .then(() => {
    console.log('✅ MongoDB connected successfully!');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('⚠️  Server running WITHOUT database. Mentorship features will not work.');
    console.error('ℹ️  Fix: Add your IP to MongoDB Atlas Network Access whitelist');
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM signal received: closing HTTP server');
  mongoose.connection.close(false);
  process.exit(0);
});

export default app;


