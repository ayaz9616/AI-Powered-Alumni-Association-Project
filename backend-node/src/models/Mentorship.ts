import mongoose, { Document, Schema } from 'mongoose';

// ==================== ENUMS ====================
export enum UserRole {
  STUDENT = 'student',
  ALUMNI = 'alumni',
  ADMIN = 'admin'
}

export enum SessionStatus {
  REQUESTED = 'requested',
  ACCEPTED = 'accepted',
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum SessionType {
  ONE_ON_ONE = '1:1',
  GROUP = 'group'
}

export enum JobStatus {
  ACTIVE = 'active',
  CLOSED = 'closed',
  DRAFT = 'draft'
}

export enum ReferralStatus {
  PENDING = 'pending',
  REFERRED = 'referred',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  INTERVIEWING = 'interviewing',
  HIRED = 'hired'
}

// ==================== INTERFACES ====================

// n8n parsed resume structure (source of truth)
export interface ParsedResume {
  UseID?: string;
  Name: string;
  Domain: string;
  "ATS Score"?: string;
  CGPA?: string;
  Branch?: string;
  Email: string;
  "Phone Number"?: string;
  "Total year of experience"?: string;
  Internship?: string[];
  "Profile Summary"?: string;
  "skill keyword": string[];
  Projects?: string[];
  Certificate?: string[];
  Batch?: string;
  LinkedIn?: string;
  github?: string;
  "portfolio URL"?: string;
  "Resume URL"?: string;
  Goal?: string;
}

// User base interface
export interface IUser extends Document {
  userId: string; // Frontend-generated persistent ID
  email: string;
  name: string;
  role: UserRole;
  password?: string; // Optional for OAuth users
  profilePicture?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Student profile interface
export interface IStudentProfile extends Document {
  userId: string;
  
  // n8n parsed data (source of truth)
  parsedResume: ParsedResume;
  
  // Editable fields (from n8n + user can edit)
  name: string;
  email: string;
  phone?: string;
  branch?: string;
  batch?: string;
  cgpa?: string;
  domain?: string;
  careerGoals?: string;
  profileSummary?: string;
  linkedIn?: string;
  github?: string;
  portfolioUrl?: string;
  
  // Derived from parsed resume
  skills: string[];
  projects: string[];
  internships: string[];
  certificates: string[];
  totalExperience?: string;
  
  // Match keywords (derived from parsed + manual)
  matchKeywords: string[];
  
  // AI insights (LangChain generated)
  atsScore?: number;
  missingSkills?: string[];
  improvementSuggestions?: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

// Alumni profile interface
export interface IAlumniProfile extends Document {
  userId: string;
  
  // n8n parsed data (source of truth)
  parsedResume: ParsedResume;
  
  // Editable fields (from n8n + user can edit)
  name: string;
  email: string;
  phone?: string;
  branch?: string;
  batch?: string;
  domain?: string;
  profileSummary?: string;
  linkedIn?: string;
  github?: string;
  portfolioUrl?: string;
  
  // Alumni specific
  currentRole?: string;
  company?: string;
  totalExperience?: string;
  domainsOfExpertise: string[];
  mentorshipPreferences?: string;
  
  // Derived from parsed resume
  skills: string[];
  projects: string[];
  internships: string[];
  certificates: string[];
  
  // Match keywords (derived from parsed + manual)
  matchKeywords: string[];
  
  // Availability
  availabilitySlots: AvailabilitySlot[];
  
  // Impact metrics
  sessionsCompleted: number;
  averageRating: number;
  impactScore: number;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface AvailabilitySlot {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  sessionType: SessionType;
  isActive: boolean;
}

// Mentorship match result interface
export interface IMentorMatch extends Document {
  studentId: string;
  alumniId: string;
  matchScore: number; // 0-1
  reasons: string[];
  skillOverlap: string[];
  domainOverlap: string[];
  computedAt: Date;
}

// Mentorship session interface
export interface IMentorshipSession extends Document {
  sessionId: string;
  studentId: string;
  alumniId: string;
  
  // Session details
  sessionType: SessionType;
  scheduledDate: Date;
  startTime: string;
  endTime: string;
  status: SessionStatus;
  
  // Meeting details
  meetingLink?: string;
  agenda?: string;
  notes?: string;
  
  // Feedback
  studentFeedback?: StudentFeedback;
  alumniFeedback?: AlumniFeedback;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentFeedback {
  rating: number; // 1-5
  usefulness: number; // 1-5
  clarity: number; // 1-5
  comments?: string;
  submittedAt: Date;
}

export interface AlumniFeedback {
  rating: number; // 1-5
  engagement: number; // 1-5
  preparedness: number; // 1-5
  comments?: string;
  submittedAt: Date;
}

// Job posting interface
export interface IJob extends Document {
  jobId: string;
  postedBy: string; // Alumni userId
  
  // Job details
  title: string;
  company: string;
  location: string;
  jobType: string; // Full-time, Internship, Contract, etc.
  experienceRequired: string; // "0-2 years", "2-5 years", etc.
  salary?: string;
  
  // Job description
  description: string;
  responsibilities: string[];
  requirements: string[];
  requiredSkills: string[];
  preferredSkills: string[];
  
  // Eligibility criteria
  minCGPA?: number;
  eligibleBranches: string[];
  eligibleBatches: string[];
  
  // Job metadata
  status: JobStatus;
  applicationDeadline?: Date;
  jobLink?: string;
  
  // AI-generated keywords for matching
  matchKeywords: string[];
  
  // Analytics
  viewCount: number;
  referralCount: number;
  
  createdAt: Date;
  updatedAt: Date;
}

// Job referral interface
export interface IJobReferral extends Document {
  referralId: string;
  jobId: string;
  studentId: string;
  referredBy: string; // Alumni userId
  
  // Match data
  matchScore: number; // 0-100
  matchReasons: string[];
  
  // Status
  status: ReferralStatus;
  statusHistory: {
    status: ReferralStatus;
    timestamp: Date;
    notes?: string;
  }[];
  
  // Notes
  alumniNotes?: string;
  studentResponse?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface AlumniFeedback {
  preparedness: number; // 1-5
  engagement: number; // 1-5
  comments?: string;
  submittedAt: Date;
}

// Job interest interface (student-driven interest for a job)
export interface IJobInterest extends Document {
  interestId: string;
  jobId: string;
  studentId: string;
  eligible: boolean;
  ineligibleReasons?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ==================== SCHEMAS ====================

const ParsedResumeSchema = new Schema({
  UseID: String,
  Name: { type: String, required: true },
  Domain: String,
  "ATS Score": String,
  CGPA: String,
  Branch: String,
  Email: { type: String, required: true },
  "Phone Number": String,
  "Total year of experience": String,
  Internship: [String],
  "Profile Summary": String,
  "skill keyword": [String],
  Projects: [String],
  Certificate: [String],
  Batch: String,
  LinkedIn: String,
  github: String,
  "portfolio URL": String,
  "Resume URL": String,
  Goal: String
}, { _id: false });

const UserSchema = new Schema({
  userId: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { 
    type: String, 
    enum: Object.values(UserRole), 
    required: true 
  },
  password: { type: String }, // Optional for OAuth users
  profilePicture: String
}, {
  timestamps: true
});

const StudentProfileSchema = new Schema({
  userId: { type: String, required: true, unique: true, index: true },
  
  parsedResume: { type: ParsedResumeSchema, required: true },
  
  // Editable fields
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  branch: String,
  batch: String,
  cgpa: String,
  domain: String,
  careerGoals: String,
  profileSummary: String,
  linkedIn: String,
  github: String,
  portfolioUrl: String,
  
  // Derived arrays
  skills: [String],
  projects: [String],
  internships: [String],
  certificates: [String],
  totalExperience: String,
  
  matchKeywords: [String],
  
  atsScore: Number,
  missingSkills: [String],
  improvementSuggestions: [String]
}, {
  timestamps: true
});

const AvailabilitySlotSchema = new Schema({
  dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  sessionType: { 
    type: String, 
    enum: Object.values(SessionType), 
    required: true 
  },
  isActive: { type: Boolean, default: true }
}, { _id: false });

const AlumniProfileSchema = new Schema({
  userId: { type: String, required: true, unique: true, index: true },
  
  parsedResume: { type: ParsedResumeSchema, required: true },
  
  // Editable fields
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  branch: String,
  batch: String,
  domain: String,
  profileSummary: String,
  linkedIn: String,
  github: String,
  portfolioUrl: String,
  
  // Alumni specific
  currentRole: String,
  company: String,
  totalExperience: String,
  domainsOfExpertise: [String],
  mentorshipPreferences: String,
  
  // Derived arrays
  skills: [String],
  projects: [String],
  internships: [String],
  certificates: [String],
  
  matchKeywords: [String],
  
  availabilitySlots: [AvailabilitySlotSchema],
  
  sessionsCompleted: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
  impactScore: { type: Number, default: 0 }
}, {
  timestamps: true
});

const MentorMatchSchema = new Schema({
  studentId: { type: String, required: true, index: true },
  alumniId: { type: String, required: true, index: true },
  matchScore: { type: Number, required: true, min: 0, max: 1 },
  reasons: [String],
  skillOverlap: [String],
  domainOverlap: [String],
  computedAt: { type: Date, default: Date.now }
});

const StudentFeedbackSchema = new Schema({
  rating: { type: Number, required: true, min: 1, max: 5 },
  usefulness: { type: Number, required: true, min: 1, max: 5 },
  clarity: { type: Number, required: true, min: 1, max: 5 },
  comments: String,
  submittedAt: { type: Date, default: Date.now }
}, { _id: false });

const AlumniFeedbackSchema = new Schema({
  preparedness: { type: Number, required: true, min: 1, max: 5 },
  engagement: { type: Number, required: true, min: 1, max: 5 },
  comments: String,
  submittedAt: { type: Date, default: Date.now }
}, { _id: false });

const MentorshipSessionSchema = new Schema({
  sessionId: { type: String, required: true, unique: true, index: true },
  studentId: { type: String, required: true, index: true },
  alumniId: { type: String, required: true, index: true },
  
  sessionType: { 
    type: String, 
    enum: Object.values(SessionType), 
    required: true 
  },
  scheduledDate: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  status: { 
    type: String, 
    enum: Object.values(SessionStatus), 
    default: SessionStatus.REQUESTED 
  },
  
  meetingLink: String,
  agenda: String,
  notes: String,
  
  studentFeedback: StudentFeedbackSchema,
  alumniFeedback: AlumniFeedbackSchema
}, {
  timestamps: true
});

// Job schema
const JobSchema = new Schema<IJob>({
  jobId: { type: String, required: true, unique: true },
  postedBy: { type: String, required: true },
  
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  jobType: { type: String, required: true },
  experienceRequired: String,
  salary: String,
  
  description: { type: String, required: true },
  responsibilities: [String],
  requirements: [String],
  requiredSkills: [String],
  preferredSkills: [String],
  
  minCGPA: Number,
  eligibleBranches: [String],
  eligibleBatches: [String],
  
  status: { type: String, enum: Object.values(JobStatus), default: JobStatus.ACTIVE },
  applicationDeadline: Date,
  jobLink: String,
  
  matchKeywords: [String],
  
  viewCount: { type: Number, default: 0 },
  referralCount: { type: Number, default: 0 }
}, {
  timestamps: true
});

// Job referral schema
const JobReferralSchema = new Schema<IJobReferral>({
  referralId: { type: String, required: true, unique: true },
  jobId: { type: String, required: true },
  studentId: { type: String, required: true },
  referredBy: { type: String, required: true },
  
  matchScore: { type: Number, required: true },
  matchReasons: [String],
  
  status: { type: String, enum: Object.values(ReferralStatus), default: ReferralStatus.PENDING },
  statusHistory: [{
    status: String,
    timestamp: Date,
    notes: String
  }],
  
  alumniNotes: String,
  studentResponse: String
}, {
  timestamps: true
});

// Job interest schema
const JobInterestSchema = new Schema<IJobInterest>({
  interestId: { type: String, required: true, unique: true },
  jobId: { type: String, required: true, index: true },
  studentId: { type: String, required: true },
  eligible: { type: Boolean, default: true },
  ineligibleReasons: [String]
}, {
  timestamps: true
});

// Add indexes for performance
MentorMatchSchema.index({ studentId: 1, matchScore: -1 });
MentorMatchSchema.index({ alumniId: 1, matchScore: -1 });
MentorshipSessionSchema.index({ studentId: 1, status: 1 });
MentorshipSessionSchema.index({ alumniId: 1, status: 1 });
MentorshipSessionSchema.index({ scheduledDate: 1 });
JobSchema.index({ postedBy: 1, status: 1 });
JobSchema.index({ status: 1, createdAt: -1 });
JobSchema.index({ eligibleBranches: 1, status: 1 });
JobReferralSchema.index({ jobId: 1, studentId: 1 });
JobReferralSchema.index({ studentId: 1, status: 1 });
JobReferralSchema.index({ referredBy: 1, jobId: 1 });
JobInterestSchema.index({ jobId: 1, studentId: 1 }, { unique: true });

// ==================== MODELS ====================
export const User = mongoose.model<IUser>('User', UserSchema);
export const StudentProfile = mongoose.model<IStudentProfile>('StudentProfile', StudentProfileSchema);
export const AlumniProfile = mongoose.model<IAlumniProfile>('AlumniProfile', AlumniProfileSchema);
export const MentorMatch = mongoose.model<IMentorMatch>('MentorMatch', MentorMatchSchema);
export const MentorshipSession = mongoose.model<IMentorshipSession>('MentorshipSession', MentorshipSessionSchema);
export const Job = mongoose.model<IJob>('Job', JobSchema);
export const JobReferral = mongoose.model<IJobReferral>('JobReferral', JobReferralSchema);
export const JobInterest = mongoose.model<IJobInterest>('JobInterest', JobInterestSchema);
