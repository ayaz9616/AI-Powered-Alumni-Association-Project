import { Router, Request, Response } from 'express';
import multer from 'multer';
import { User, StudentProfile, AlumniProfile, UserRole, MentorMatch } from '../models/Mentorship';
import { N8nService } from '../services/N8nService';
import { LangChainMatchingService } from '../services/LangChainMatchingService';
import { authenticate, requireStudent, requireAlumni, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOC files are allowed'));
    }
  }
});

// ==================== USER MANAGEMENT ====================

/**
 * POST /api/mentorship/user/register
 * Register a new user (student, alumni, or admin)
 */
router.post('/user/register', async (req: Request, res: Response) => {
  try {
    const { userId, email, name, role, password, profilePicture } = req.body;

    // Validate required fields
    if (!userId || !email || !name || !role || !password) {
      return res.status(400).json({ 
        error: 'Missing required fields: userId, email, name, role, password' 
      });
    }

    // Validate role
    if (!Object.values(UserRole).includes(role)) {
      return res.status(400).json({ 
        error: 'Invalid role. Must be: student, alumni, or admin' 
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ userId }, { email }] });
    if (existingUser) {
      return res.status(409).json({ 
        error: 'User with this userId or email already exists' 
      });
    }

    // Create user with password
    const user = new User({
      userId,
      email,
      name,
      role,
      password, // Store plain password (in production, this should be hashed)
      profilePicture
    });

    await user.save();

    res.status(201).json({
      success: true,
      data: {
        userId: user.userId,
        email: user.email,
        name: user.name,
        role: user.role,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt
      }
    });

  } catch (error: any) {
    console.error('[Mentorship] User registration failed:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/mentorship/user/login
 * Login user with email and password
 */
router.post('/user/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    // Hardcoded Admin login (no prior registration required)
    if (email === 'admin@gmail.com' && password === 'admin@gmail.com') {
      // Try to find existing admin user by email
      let adminUser = await User.findOne({ email });
      if (!adminUser) {
        // Create an admin user if missing
        adminUser = new User({
          userId: 'admin-user',
          email,
          name: 'Admin',
          role: UserRole.ADMIN,
          password
        });
        try {
          await adminUser.save();
        } catch (_e) {
          // If userId conflict, generate a unique one
          const fallbackId = `admin-${Date.now()}`;
          adminUser.userId = fallbackId;
          await adminUser.save();
        }
      }

      return res.json({
        success: true,
        data: {
          userId: adminUser.userId,
          email: adminUser.email,
          name: adminUser.name,
          role: adminUser.role,
          profilePicture: adminUser.profilePicture,
          createdAt: adminUser.createdAt
        }
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    // Verify password
    if (user.password !== password) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    // Successful login
    res.json({
      success: true,
      data: {
        userId: user.userId,
        email: user.email,
        name: user.name,
        role: user.role,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt
      }
    });

  } catch (error: any) {
    console.error('[Mentorship] User login failed:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/mentorship/user/:userId
 * Get user details by userId
 */
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });

  } catch (error: any) {
    console.error('[Mentorship] Failed to fetch user:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== STUDENT PROFILE ====================

/**
 * POST /api/mentorship/parse-resume
 * Parse resume using n8n WITHOUT creating/updating profile
 * Just returns parsed data for preview
 * 
 * Protected: Authenticated users
 */
router.post('/parse-resume', authenticate, upload.single('resume'), async (req: AuthRequest, res: Response) => {
  try {
    const resumeFile = req.file;
    const userId = req.user!.userId;

    if (!resumeFile) {
      return res.status(400).json({ 
        error: 'Missing required field: resume file' 
      });
    }

    // Parse resume using n8n
    console.log(`[Mentorship] Parsing resume for user: ${userId}`);
    const parsedResume = await N8nService.parseResumeFromBuffer(
      userId,
      resumeFile.originalname,
      resumeFile.mimetype,
      resumeFile.buffer
    );

    // Return parsed data without saving
    res.json({
      success: true,
      parsedData: parsedResume
    });

  } catch (error: any) {
    console.error('[Mentorship] Resume parsing failed:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/mentorship/student/profile/create
 * Step 1: Upload resume → n8n parsing
 * Step 2: Manual enrichment fields
 * 
 * Protected: STUDENT role only
 */
router.post('/student/profile/create', authenticate, requireStudent, upload.single('resume'), async (req: AuthRequest, res: Response) => {
  try {
    const { branch, year, careerGoals, preferredDomains, mentorshipExpectations } = req.body;
    const resumeFile = req.file;
    const userId = req.user!.userId; // From auth middleware

    if (!resumeFile) {
      return res.status(400).json({ 
        error: 'Missing required field: resume file' 
      });
    }

    // Check if profile already exists
    const existingProfile = await StudentProfile.findOne({ userId });
    if (existingProfile) {
      return res.status(409).json({ error: 'Student profile already exists' });
    }

    // Step 1: Parse resume using n8n (SOURCE OF TRUTH)
    console.log(`[Mentorship] Parsing resume for student: ${userId}`);
    const parsedResume = await N8nService.parseResumeFromBuffer(
      userId,
      resumeFile.originalname,
      resumeFile.mimetype,
      resumeFile.buffer
    );

    // Step 2: Extract data from n8n response
    const skills = parsedResume["skill keyword"] || [];
    const projects = parsedResume.Projects || [];
    const internships = parsedResume.Internship || [];
    const certificates = parsedResume.Certificate || [];

    // Generate basic match keywords (sync - fast)
    const basicKeywords = [
      ...skills,
      parsedResume.Domain || '',
      parsedResume.Branch || '',
      parsedResume.Goal || ''
    ].filter(k => k && k.length > 0);

    // Create student profile with n8n data
    const studentProfile = new StudentProfile({
      userId,
      parsedResume,
      
      // Editable fields from n8n
      name: parsedResume.Name,
      email: parsedResume.Email,
      phone: parsedResume["Phone Number"],
      branch: parsedResume.Branch,
      batch: parsedResume.Batch,
      cgpa: parsedResume.CGPA,
      domain: parsedResume.Domain,
      careerGoals: parsedResume.Goal,
      profileSummary: parsedResume["Profile Summary"],
      linkedIn: parsedResume.LinkedIn,
      github: parsedResume.github,
      portfolioUrl: parsedResume["portfolio URL"],
      
      // Derived arrays
      skills,
      projects,
      internships,
      certificates,
      totalExperience: parsedResume["Total year of experience"],
      
      matchKeywords: basicKeywords
    });

    await studentProfile.save();

    // Step 3: Generate AI insights asynchronously (LangChain)
    // Enhanced keyword extraction + ATS analysis runs in background
    Promise.all([
      LangChainMatchingService.extractEnhancedKeywords(parsedResume),
      parsedResume.Goal ? LangChainMatchingService.analyzeResumeATS(parsedResume, parsedResume.Goal) : null
    ])
      .then(async ([enhancedKeywords, atsAnalysis]) => {
        // Update with enhanced keywords
        if (enhancedKeywords && enhancedKeywords.length > 0) {
          studentProfile.matchKeywords = [...new Set([...basicKeywords, ...enhancedKeywords])];
        }
        
        // Update with ATS analysis
        if (atsAnalysis) {
          studentProfile.atsScore = atsAnalysis.atsScore;
          studentProfile.missingSkills = atsAnalysis.missingSkills;
          studentProfile.improvementSuggestions = atsAnalysis.improvementSuggestions;
        }
        
        await studentProfile.save();
        console.log(`[Mentorship] AI analysis complete for student: ${userId}`);
      })
      .catch(err => {
        console.error('[Mentorship] AI analysis failed:', err);
      });

    res.status(201).json({
      success: true,
      message: 'Student profile created successfully',
      profile: studentProfile
    });

  } catch (error: any) {
    console.error('[Mentorship] Student profile creation failed:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/mentorship/student/profile/:userId
 * Get student profile
 * 
 * Protected: Authenticated users
 */
router.get('/student/profile/:userId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    const profile = await StudentProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    res.json({ profile });

  } catch (error: any) {
    console.error('[Mentorship] Failed to fetch student profile:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/mentorship/student/profile/manual
 * Create student profile manually without resume upload
 * 
 * Protected: STUDENT role only
 */
router.post('/student/profile/manual', authenticate, requireStudent, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { 
      name, email, phone, branch, batch, cgpa, domain, 
      careerGoals, profileSummary, linkedIn, github, portfolioUrl,
      skills 
    } = req.body;

    // Check if profile already exists
    const existingProfile = await StudentProfile.findOne({ userId });
    if (existingProfile) {
      return res.status(409).json({ error: 'Student profile already exists' });
    }

    // Create empty parsed resume object
    const parsedResume: any = {
      Name: name || '',
      Email: email || '',
      "Phone Number": phone || '',
      Branch: branch || '',
      Batch: batch || '',
      CGPA: cgpa || '',
      Domain: domain || '',
      Goal: careerGoals || '',
      "Profile Summary": profileSummary || '',
      LinkedIn: linkedIn || '',
      github: github || '',
      "portfolio URL": portfolioUrl || '',
      "skill keyword": Array.isArray(skills) ? skills : (skills ? skills.split(',').map((s: string) => s.trim()) : []),
      Projects: [],
      Internship: [],
      Certificate: [],
      "Total year of experience": ''
    };

    const skillsArray = parsedResume["skill keyword"];

    // Generate match keywords
    const matchKeywords = [
      ...skillsArray,
      domain || '',
      branch || '',
      careerGoals || ''
    ].filter(k => k && k.length > 0);

    // Create student profile
    const studentProfile = new StudentProfile({
      userId,
      parsedResume,
      name: name || '',
      email: email || '',
      phone: phone || '',
      branch: branch || '',
      batch: batch || '',
      cgpa: cgpa || '',
      domain: domain || '',
      careerGoals: careerGoals || '',
      profileSummary: profileSummary || '',
      linkedIn: linkedIn || '',
      github: github || '',
      portfolioUrl: portfolioUrl || '',
      skills: skillsArray,
      projects: [],
      internships: [],
      certificates: [],
      totalExperience: '',
      matchKeywords
    });

    await studentProfile.save();

    res.status(201).json({
      success: true,
      message: 'Student profile created successfully',
      profile: studentProfile
    });

  } catch (error: any) {
    console.error('[Mentorship] Manual student profile creation failed:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/mentorship/student/profile/:userId
 * Update student profile (editable fields only)
 * 
 * Protected: STUDENT role only (own profile)
 */
router.put('/student/profile/:userId', authenticate, requireStudent, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { 
      name, email, phone, branch, batch, cgpa, domain, 
      careerGoals, profileSummary, linkedIn, github, portfolioUrl 
    } = req.body;

    // Verify user is updating their own profile
    if (req.user!.userId !== userId) {
      return res.status(403).json({ error: 'You can only update your own profile' });
    }

    const profile = await StudentProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    // Update editable fields
    if (name) profile.name = name;
    if (email) profile.email = email;
    if (phone !== undefined) profile.phone = phone;
    if (branch !== undefined) profile.branch = branch;
    if (batch !== undefined) profile.batch = batch;
    if (cgpa !== undefined) profile.cgpa = cgpa;
    if (domain !== undefined) profile.domain = domain;
    if (careerGoals !== undefined) profile.careerGoals = careerGoals;
    if (profileSummary !== undefined) profile.profileSummary = profileSummary;
    if (linkedIn !== undefined) profile.linkedIn = linkedIn;
    if (github !== undefined) profile.github = github;
    if (portfolioUrl !== undefined) profile.portfolioUrl = portfolioUrl;

    // Regenerate match keywords
    profile.matchKeywords = [
      ...profile.skills,
      profile.domain || '',
      profile.branch || '',
      profile.careerGoals || ''
    ].filter(k => k && k.length > 0);

    await profile.save();

    res.json({
      success: true,
      message: 'Student profile updated successfully',
      profile
    });

  } catch (error: any) {
    console.error('[Mentorship] Student profile update failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== ALUMNI PROFILE ====================

/**
 * POST /api/mentorship/alumni/profile/create
 * Step 1: Upload resume → n8n parsing
 * Step 2: Extract data and allow manual enrichment
 * 
 * Protected: ALUMNI role only
 */
router.post('/alumni/profile/create', authenticate, requireAlumni, upload.single('resume'), async (req: AuthRequest, res: Response) => {
  try {
    const { 
      currentRole, 
      company, 
      domainsOfExpertise, 
      mentorshipPreferences 
    } = req.body;
    const resumeFile = req.file;
    const userId = req.user!.userId; // From auth middleware

    if (!resumeFile) {
      return res.status(400).json({ 
        error: 'Missing required field: resume file' 
      });
    }

    // Check if profile already exists
    const existingProfile = await AlumniProfile.findOne({ userId });
    if (existingProfile) {
      return res.status(409).json({ error: 'Alumni profile already exists' });
    }

    // Step 1: Parse resume using n8n (SOURCE OF TRUTH)
    console.log(`[Mentorship] Parsing resume for alumni: ${userId}`);
    const parsedResume = await N8nService.parseResumeFromBuffer(
      userId,
      resumeFile.originalname,
      resumeFile.mimetype,
      resumeFile.buffer
    );

    // Step 2: Extract data from n8n response
    const skills = parsedResume["skill keyword"] || [];
    const projects = parsedResume.Projects || [];
    const internships = parsedResume.Internship || [];
    const certificates = parsedResume.Certificate || [];

    const domainsArray = Array.isArray(domainsOfExpertise)
      ? domainsOfExpertise
      : (domainsOfExpertise ? domainsOfExpertise.split(',').map((d: string) => d.trim()) : []);

    // Generate match keywords
    const matchKeywords = [
      ...skills,
      parsedResume.Domain || '',
      ...domainsArray,
      currentRole || ''
    ].filter(k => k && k.length > 0);

    // Create alumni profile with n8n data
    const alumniProfile = new AlumniProfile({
      userId,
      parsedResume,
      
      // Editable fields from n8n
      name: parsedResume.Name,
      email: parsedResume.Email,
      phone: parsedResume["Phone Number"],
      branch: parsedResume.Branch,
      batch: parsedResume.Batch,
      domain: parsedResume.Domain,
      profileSummary: parsedResume["Profile Summary"],
      linkedIn: parsedResume.LinkedIn,
      github: parsedResume.github,
      portfolioUrl: parsedResume["portfolio URL"],
      
      // Alumni specific
      currentRole: currentRole || '',
      company: company || '',
      totalExperience: parsedResume["Total year of experience"],
      domainsOfExpertise: domainsArray,
      mentorshipPreferences: mentorshipPreferences || '',
      
      // Derived arrays
      skills,
      projects,
      internships,
      certificates,
      
      matchKeywords,
      availabilitySlots: [], // Set separately via availability endpoint
      sessionsCompleted: 0,
      averageRating: 0,
      impactScore: 0
    });

    await alumniProfile.save();

    res.status(201).json({
      success: true,
      message: 'Alumni profile created successfully',
      profile: alumniProfile
    });

  } catch (error: any) {
    console.error('[Mentorship] Alumni profile creation failed:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/mentorship/alumni/profile/:userId
 * Get alumni profile
 * 
 * Protected: Authenticated users
 */
router.get('/alumni/profile/:userId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    const profile = await AlumniProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ error: 'Alumni profile not found' });
    }

    res.json({ profile });

  } catch (error: any) {
    console.error('[Mentorship] Failed to fetch alumni profile:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/mentorship/alumni/profile/manual
 * Create alumni profile manually without resume upload
 * 
 * Protected: ALUMNI role only
 */
router.post('/alumni/profile/manual', authenticate, requireAlumni, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { 
      name, email, phone, branch, batch, domain, 
      profileSummary, linkedIn, github, portfolioUrl,
      currentRole, company, totalExperience, domainsOfExpertise, mentorshipPreferences,
      skills 
    } = req.body;

    // Check if profile already exists
    const existingProfile = await AlumniProfile.findOne({ userId });
    if (existingProfile) {
      return res.status(409).json({ error: 'Alumni profile already exists' });
    }

    // Create empty parsed resume object
    const parsedResume: any = {
      Name: name || '',
      Email: email || '',
      "Phone Number": phone || '',
      Branch: branch || '',
      Batch: batch || '',
      Domain: domain || '',
      "Profile Summary": profileSummary || '',
      LinkedIn: linkedIn || '',
      github: github || '',
      "portfolio URL": portfolioUrl || '',
      "Total year of experience": totalExperience || '',
      "skill keyword": Array.isArray(skills) ? skills : (skills ? skills.split(',').map((s: string) => s.trim()) : []),
      Projects: [],
      Internship: [],
      Certificate: [],
      CGPA: '',
      Goal: ''
    };

    const skillsArray = parsedResume["skill keyword"];
    const domainsArray = Array.isArray(domainsOfExpertise)
      ? domainsOfExpertise
      : (domainsOfExpertise ? domainsOfExpertise.split(',').map((d: string) => d.trim()) : []);

    // Generate match keywords
    const matchKeywords = [
      ...skillsArray,
      domain || '',
      ...domainsArray,
      currentRole || ''
    ].filter(k => k && k.length > 0);

    // Create alumni profile
    const alumniProfile = new AlumniProfile({
      userId,
      parsedResume,
      name: name || '',
      email: email || '',
      phone: phone || '',
      branch: branch || '',
      batch: batch || '',
      domain: domain || '',
      profileSummary: profileSummary || '',
      linkedIn: linkedIn || '',
      github: github || '',
      portfolioUrl: portfolioUrl || '',
      currentRole: currentRole || '',
      company: company || '',
      totalExperience: totalExperience || '',
      domainsOfExpertise: domainsArray,
      mentorshipPreferences: mentorshipPreferences || '',
      skills: skillsArray,
      projects: [],
      internships: [],
      certificates: [],
      matchKeywords,
      availabilitySlots: [],
      sessionsCompleted: 0,
      averageRating: 0,
      impactScore: 0
    });

    await alumniProfile.save();

    res.status(201).json({
      success: true,
      message: 'Alumni profile created successfully',
      profile: alumniProfile
    });

  } catch (error: any) {
    console.error('[Mentorship] Manual alumni profile creation failed:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/mentorship/alumni/profile/:userId
 * Update alumni profile (editable fields only)
 * 
 * Protected: ALUMNI role only (own profile)
 */
router.put('/alumni/profile/:userId', authenticate, requireAlumni, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { 
      name, email, phone, branch, batch, domain, 
      profileSummary, linkedIn, github, portfolioUrl,
      currentRole, company, domainsOfExpertise, mentorshipPreferences
    } = req.body;

    // Verify user is updating their own profile
    if (req.user!.userId !== userId) {
      return res.status(403).json({ error: 'You can only update your own profile' });
    }

    const profile = await AlumniProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ error: 'Alumni profile not found' });
    }

    // Update editable fields
    if (name) profile.name = name;
    if (email) profile.email = email;
    if (phone !== undefined) profile.phone = phone;
    if (branch !== undefined) profile.branch = branch;
    if (batch !== undefined) profile.batch = batch;
    if (domain !== undefined) profile.domain = domain;
    if (profileSummary !== undefined) profile.profileSummary = profileSummary;
    if (linkedIn !== undefined) profile.linkedIn = linkedIn;
    if (github !== undefined) profile.github = github;
    if (portfolioUrl !== undefined) profile.portfolioUrl = portfolioUrl;
    
    // Alumni specific fields
    if (currentRole !== undefined) profile.currentRole = currentRole;
    if (company !== undefined) profile.company = company;
    if (mentorshipPreferences !== undefined) profile.mentorshipPreferences = mentorshipPreferences;
    
    if (domainsOfExpertise) {
      profile.domainsOfExpertise = Array.isArray(domainsOfExpertise)
        ? domainsOfExpertise
        : domainsOfExpertise.split(',').map((d: string) => d.trim());
    }

    // Regenerate match keywords
    profile.matchKeywords = [
      ...profile.skills,
      profile.domain || '',
      ...profile.domainsOfExpertise,
      profile.currentRole || ''
    ].filter(k => k && k.length > 0);

    await profile.save();

    res.json({
      success: true,
      message: 'Alumni profile updated successfully',
      profile
    });

  } catch (error: any) {
    console.error('[Mentorship] Failed to update alumni profile:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/mentorship/alumni/profile/:userId/availability
 * Set alumni availability slots
 * 
 * Protected: ALUMNI role only (own profile)
 */
router.put('/alumni/profile/:userId/availability', authenticate, requireAlumni, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { availabilitySlots } = req.body;

    // Verify user is updating their own profile
    if (req.user!.userId !== userId) {
      return res.status(403).json({ error: 'You can only update your own availability' });
    }

    if (!Array.isArray(availabilitySlots)) {
      return res.status(400).json({ error: 'availabilitySlots must be an array' });
    }

    const profile = await AlumniProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ error: 'Alumni profile not found' });
    }

    profile.availabilitySlots = availabilitySlots;
    await profile.save();

    res.json({
      success: true,
      message: 'Availability updated successfully',
      availabilitySlots: profile.availabilitySlots
    });

  } catch (error: any) {
    console.error('[Mentorship] Availability update failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== MATCHING ====================

/**
 * POST /api/mentorship/student/:userId/find-mentors
 * Find matching alumni mentors for a student
 * Uses LangChain to score and rank alumni
 * 
 * Protected: STUDENT role only (own profile)
 */
router.post('/student/:userId/find-mentors', authenticate, requireStudent, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { limit = 10 } = req.body;

    // Verify student is finding mentors for themselves
    if (req.user!.userId !== userId) {
      return res.status(403).json({ error: 'You can only find mentors for your own profile' });
    }

    // Get student profile
    const studentProfile = await StudentProfile.findOne({ userId });
    if (!studentProfile) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    // Get all alumni profiles
    const alumniProfiles = await AlumniProfile.find({});
    if (alumniProfiles.length === 0) {
      return res.json({
        success: true,
        matches: [],
        message: 'No alumni profiles available'
      });
    }

    // Prepare data for LangChain matching
    const studentMatchProfile = {
      userId: studentProfile.userId,
      skills: studentProfile.skills,
      careerGoals: studentProfile.careerGoals,
      domain: studentProfile.domain,
      matchKeywords: studentProfile.matchKeywords
    };

    const alumniMatchProfiles = alumniProfiles.map(alum => ({
      userId: alum.userId,
      skills: alum.skills,
      experience: alum.totalExperience || '0',
      domainsOfExpertise: alum.domainsOfExpertise,
      currentRole: alum.currentRole,
      totalExperience: alum.totalExperience,
      matchKeywords: alum.matchKeywords
    }));

    // Use LangChain to compute matches
    console.log(`[Mentorship] Computing matches for student: ${userId}`);
    const matchResults = await LangChainMatchingService.matchStudentWithAlumni(
      studentMatchProfile,
      alumniMatchProfiles
    );

    // Save match results to database
    const savedMatches = await Promise.all(
      matchResults.map(async (match) => {
        const mentorMatch = new MentorMatch({
          studentId: userId,
          alumniId: match.alumniId,
          matchScore: match.matchScore,
          reasons: match.reasons,
          skillOverlap: match.skillOverlap,
          domainOverlap: match.domainOverlap,
          computedAt: new Date()
        });
        await mentorMatch.save();
        return mentorMatch;
      })
    );

    // Sort by match score and limit results
    const topMatches = savedMatches
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);

    // Enrich with alumni details
    const enrichedMatches = await Promise.all(
      topMatches.map(async (match) => {
        const alumni = await AlumniProfile.findOne({ userId: match.alumniId });
        const alumniUser = await User.findOne({ userId: match.alumniId });
        
        return {
          matchScore: match.matchScore,
          reasons: match.reasons,
          skillOverlap: match.skillOverlap,
          domainOverlap: match.domainOverlap,
          alumni: {
            userId: alumni?.userId,
            name: alumniUser?.name,
            currentRole: alumni?.currentRole,
            company: alumni?.company,
            totalExperience: alumni?.totalExperience,
            domainsOfExpertise: alumni?.domainsOfExpertise,
            averageRating: alumni?.averageRating,
            sessionsCompleted: alumni?.sessionsCompleted,
            profilePicture: alumniUser?.profilePicture
          }
        };
      })
    );

    res.json({
      success: true,
      matches: enrichedMatches,
      totalMatched: enrichedMatches.length
    });

  } catch (error: any) {
    console.error('[Mentorship] Mentor matching failed:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/mentorship/alumni/list
 * Get all alumni (for browsing)
 * 
 * Protected: Authenticated users (students can browse alumni)
 */
router.get('/alumni/list', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { domain, minExperience, limit = 20 } = req.query;

    let query: any = {};
    
    if (domain) {
      query.domainsOfExpertise = { $in: [domain] };
    }
    
    // Note: minExperience filter not supported with string totalExperience

    const alumniProfiles = await AlumniProfile.find(query)
      .limit(parseInt(limit as string))
      .sort({ impactScore: -1, averageRating: -1 });

    // Enrich with user data
    const enrichedAlumni = await Promise.all(
      alumniProfiles.map(async (alumni) => {
        const user = await User.findOne({ userId: alumni.userId });
        return {
          userId: alumni.userId,
          name: user?.name,
          email: user?.email,
          profilePicture: user?.profilePicture,
          currentRole: alumni.currentRole,
          company: alumni.company,
          totalExperience: alumni.totalExperience,
          domainsOfExpertise: alumni.domainsOfExpertise,
          sessionsCompleted: alumni.sessionsCompleted,
          averageRating: alumni.averageRating,
          impactScore: alumni.impactScore,
          availabilitySlots: alumni.availabilitySlots
        };
      })
    );

    res.json({
      success: true,
      alumni: enrichedAlumni,
      total: enrichedAlumni.length
    });

  } catch (error: any) {
    console.error('[Mentorship] Alumni list fetch failed:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
