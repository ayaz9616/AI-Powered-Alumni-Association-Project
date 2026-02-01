import { Router, Request, Response } from 'express';
import { Job, JobReferral, StudentProfile, JobStatus, ReferralStatus, JobInterest } from '../models/Mentorship';
import { LangChainMatchingService } from '../services/LangChainMatchingService';
import { authenticate, requireAlumni, requireStudent, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// ==================== JOB POSTING ====================

/**
 * POST /api/jobs/create
 * Alumni posts a new job
 */
router.post('/create', authenticate, requireAlumni, async (req: AuthRequest, res: Response) => {
  try {
    const postedBy = req.user!.userId;
    const {
      title, company, location, jobType, experienceRequired, salary,
      description, responsibilities, requirements,
      requiredSkills, preferredSkills,
      minCGPA, eligibleBranches, eligibleBatches,
      applicationDeadline, jobLink
    } = req.body;

    // Validate required fields
    if (!title || !company || !location || !jobType || !description) {
      return res.status(400).json({
        error: 'Missing required fields: title, company, location, jobType, description'
      });
    }

    // Generate jobId
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Generate match keywords from job data
    const matchKeywords = [
      ...(requiredSkills || []),
      ...(preferredSkills || []),
      title,
      company,
      jobType
    ].filter(k => k && k.length > 0);

    const job = new Job({
      jobId,
      postedBy,
      title,
      company,
      location,
      jobType,
      experienceRequired: experienceRequired || '',
      salary,
      description,
      responsibilities: responsibilities || [],
      requirements: requirements || [],
      requiredSkills: requiredSkills || [],
      preferredSkills: preferredSkills || [],
      minCGPA,
      eligibleBranches: eligibleBranches || [],
      eligibleBatches: eligibleBatches || [],
      status: JobStatus.ACTIVE,
      applicationDeadline,
      jobLink,
      matchKeywords,
      viewCount: 0,
      referralCount: 0
    });

    await job.save();

    res.status(201).json({
      success: true,
      message: 'Job posted successfully',
      job
    });

  } catch (error: any) {
    console.error('[Jobs] Job creation failed:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/jobs/my-jobs
 * Get all jobs posted by the logged-in alumni
 */
router.get('/my-jobs', authenticate, requireAlumni, async (req: AuthRequest, res: Response) => {
  try {
    const postedBy = req.user!.userId;
    const { status } = req.query;

    const query: any = { postedBy };
    if (status) {
      query.status = status;
    }

    const jobs = await Job.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      jobs
    });

  } catch (error: any) {
    console.error('[Jobs] Failed to fetch jobs:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/jobs/all
 * Get all active jobs (for students)
 */
router.get('/all', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const jobs = await Job.find({ status: 'active' }).sort({ createdAt: -1 });

    res.json({
      success: true,
      jobs
    });

  } catch (error: any) {
    console.error('[Jobs] Failed to fetch all jobs:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/jobs/my-referrals
 * Get all referrals made by the alumni (pending ones to be referred)
 */
router.get('/my-referrals', authenticate, requireAlumni, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { status } = req.query;

    // Build query
    const query: any = { referredBy: userId };
    if (status) {
      query.status = status;
    }

    const referrals = await JobReferral.find(query).sort({ createdAt: -1 });

    // Enrich with student and job details
    const studentIds = referrals.map(r => r.studentId);
    const jobIds = [...new Set(referrals.map(r => r.jobId))];
    
    const students = await StudentProfile.find({ userId: { $in: studentIds } });
    const jobs = await Job.find({ jobId: { $in: jobIds } });

    const enrichedReferrals = referrals.map(ref => {
      const student = students.find(s => s.userId === ref.studentId);
      const job = jobs.find(j => j.jobId === ref.jobId);
      return {
        ...ref.toObject(),
        student: student ? {
          userId: student.userId,
          name: student.name,
          email: student.email,
          branch: student.branch,
          batch: student.batch,
          cgpa: student.cgpa,
          skills: student.skills
        } : null,
        job: job ? {
          jobId: job.jobId,
          title: job.title,
          company: job.company,
          location: job.location
        } : null
      };
    });

    res.json({
      success: true,
      referrals: enrichedReferrals
    });

  } catch (error: any) {
    console.error('[Jobs] Failed to fetch my referrals:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/jobs/:jobId
 * Get job details
 */
router.get('/:jobId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findOne({ jobId });
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Increment view count
    job.viewCount += 1;
    await job.save();

    res.json({
      success: true,
      job
    });

  } catch (error: any) {
    console.error('[Jobs] Failed to fetch job:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/jobs/:jobId
 * Update job details
 */
router.put('/:jobId', authenticate, requireAlumni, async (req: AuthRequest, res: Response) => {
  try {
    const { jobId } = req.params;
    const userId = req.user!.userId;

    const job = await Job.findOne({ jobId });
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Verify ownership
    if (job.postedBy !== userId) {
      return res.status(403).json({ error: 'You can only edit your own jobs' });
    }

    // Update fields
    const {
      title, company, location, jobType, experienceRequired, salary,
      description, responsibilities, requirements,
      requiredSkills, preferredSkills,
      minCGPA, eligibleBranches, eligibleBatches,
      status, applicationDeadline, jobLink
    } = req.body;

    if (title) job.title = title;
    if (company) job.company = company;
    if (location) job.location = location;
    if (jobType) job.jobType = jobType;
    if (experienceRequired !== undefined) job.experienceRequired = experienceRequired;
    if (salary !== undefined) job.salary = salary;
    if (description) job.description = description;
    if (responsibilities) job.responsibilities = responsibilities;
    if (requirements) job.requirements = requirements;
    if (requiredSkills) job.requiredSkills = requiredSkills;
    if (preferredSkills) job.preferredSkills = preferredSkills;
    if (minCGPA !== undefined) job.minCGPA = minCGPA;
    if (eligibleBranches) job.eligibleBranches = eligibleBranches;
    if (eligibleBatches) job.eligibleBatches = eligibleBatches;
    if (status) job.status = status;
    if (applicationDeadline !== undefined) job.applicationDeadline = applicationDeadline;
    if (jobLink !== undefined) job.jobLink = jobLink;

    // Regenerate match keywords
    job.matchKeywords = [
      ...job.requiredSkills,
      ...job.preferredSkills,
      job.title,
      job.company,
      job.jobType
    ].filter(k => k && k.length > 0);

    await job.save();

    res.json({
      success: true,
      message: 'Job updated successfully',
      job
    });

  } catch (error: any) {
    console.error('[Jobs] Job update failed:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/jobs/:jobId
 * Delete (or close) a job
 */
router.delete('/:jobId', authenticate, requireAlumni, async (req: AuthRequest, res: Response) => {
  try {
    const { jobId } = req.params;
    const userId = req.user!.userId;

    const job = await Job.findOne({ jobId });
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Verify ownership
    if (job.postedBy !== userId) {
      return res.status(403).json({ error: 'You can only delete your own jobs' });
    }

    // Mark as closed instead of deleting
    job.status = JobStatus.CLOSED;
    await job.save();

    res.json({
      success: true,
      message: 'Job closed successfully'
    });

  } catch (error: any) {
    console.error('[Jobs] Job deletion failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== STUDENT MATCHING ====================

/**
 * POST /api/jobs/:jobId/match-students
 * Get AI-matched students for a job with filters
 */
router.post('/:jobId/match-students', authenticate, requireAlumni, async (req: AuthRequest, res: Response) => {
  try {
    const { jobId } = req.params;
    const userId = req.user!.userId;
    const {
      minCGPA,
      branches,
      batches,
      requiredSkills,
      limit = 50
    } = req.body;

    const job = await Job.findOne({ jobId });
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Verify ownership
    if (job.postedBy !== userId) {
      return res.status(403).json({ error: 'You can only match students for your own jobs' });
    }

    // Build query with filters
    const query: any = {};
    
    // Apply filters
    // Only apply filters if explicitly provided (not undefined/null and not empty array)
    // If minCGPA is explicitly provided (even if 0), use it; otherwise skip
    if (minCGPA !== undefined && minCGPA !== null) {
      query.cgpa = { $gte: minCGPA.toString() };
    }

    // Only filter by branches if explicitly provided and not empty
    if (branches && branches.length > 0) {
      query.branch = { $in: branches };
    }

    // Only filter by batches if explicitly provided and not empty
    if (batches && batches.length > 0) {
      query.batch = { $in: batches };
    }

    // Optional: Filter by required skills (not used for relevance ranking)
    // Removed to show ALL students regardless of skills

    // Fetch eligible students
    const students = await StudentProfile.find(query).limit(limit);

    if (students.length === 0) {
      return res.json({
        success: true,
        message: 'No students match the criteria',
        matches: []
      });
    }

    // Prepare student data for LangChain matching
    const studentData = students.map(s => ({
      userId: s.userId,
      name: s.name,
      skills: s.skills,
      cgpa: s.cgpa,
      branch: s.branch,
      batch: s.batch,
      domain: s.domain,
      careerGoals: s.careerGoals,
      totalExperience: s.totalExperience,
      projects: s.projects,
      internships: s.internships
    }));

    // Use LangChain to match students to job
    const matchResults = await LangChainMatchingService.matchStudentsToJob(
      job.description,
      job.requiredSkills,
      job.preferredSkills,
      studentData
    );

    // Sort by match score (descending)
    matchResults.sort((a, b) => b.matchScore - a.matchScore);

    // Enrich with student details
    const enrichedMatches = matchResults.map(match => {
      const student = students.find(s => s.userId === match.studentId);
      return {
        ...match,
        student: student ? {
          userId: student.userId,
          name: student.name,
          email: student.email,
          phone: student.phone,
          branch: student.branch,
          batch: student.batch,
          cgpa: student.cgpa,
          domain: student.domain,
          skills: student.skills,
          linkedIn: student.linkedIn,
          github: student.github,
          portfolioUrl: student.portfolioUrl
        } : null
      };
    });

    res.json({
      success: true,
      jobTitle: job.title,
      totalMatches: enrichedMatches.length,
      matches: enrichedMatches
    });

  } catch (error: any) {
    console.error('[Jobs] Student matching failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== REFERRALS ====================

/**
 * POST /api/jobs/:jobId/refer
 * Refer selected students to a job
 */
router.post('/:jobId/refer', authenticate, requireAlumni, async (req: AuthRequest, res: Response) => {
  try {
    const { jobId } = req.params;
    const referredBy = req.user!.userId;
    const { studentIds, alumniNotes } = req.body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ error: 'Student IDs are required' });
    }

    const job = await Job.findOne({ jobId });
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Verify ownership
    if (job.postedBy !== referredBy) {
      return res.status(403).json({ error: 'You can only refer students for your own jobs' });
    }

    // Create referrals
    const referrals = [];
    for (const studentData of studentIds) {
      // Handle both string IDs and objects with match data
      const studentId = typeof studentData === 'string' ? studentData : studentData.studentId;
      const matchScore = typeof studentData === 'object' ? studentData.matchScore : 0;
      const matchReasons = typeof studentData === 'object' ? studentData.matchReasons : [];
      
      // Check if already referred
      const existingReferral = await JobReferral.findOne({ jobId, studentId });
      if (existingReferral) {
        continue; // Skip if already referred
      }

      const referralId = `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const referral = new JobReferral({
        referralId,
        jobId,
        studentId,
        referredBy,
        matchScore,
        matchReasons,
        status: ReferralStatus.PENDING,
        statusHistory: [{
          status: ReferralStatus.PENDING,
          timestamp: new Date(),
          notes: 'Selected for referral'
        }],
        alumniNotes
      });

      await referral.save();
      referrals.push(referral);
    }

    // Update job referral count
    job.referralCount += referrals.length;
    await job.save();

    res.json({
      success: true,
      message: `Successfully referred ${referrals.length} student(s)`,
      referrals
    });

  } catch (error: any) {
    console.error('[Jobs] Referral creation failed:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/jobs/:jobId/referrals
 * Get all referrals for a job
 */
router.get('/:jobId/referrals', authenticate, requireAlumni, async (req: AuthRequest, res: Response) => {
  try {
    const { jobId } = req.params;
    const userId = req.user!.userId;

    const job = await Job.findOne({ jobId });
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Verify ownership
    if (job.postedBy !== userId) {
      return res.status(403).json({ error: 'You can only view referrals for your own jobs' });
    }

    const referrals = await JobReferral.find({ jobId }).sort({ createdAt: -1 });

    // Enrich with student details
    const studentIds = referrals.map(r => r.studentId);
    const students = await StudentProfile.find({ userId: { $in: studentIds } });

    const enrichedReferrals = referrals.map(ref => {
      const student = students.find(s => s.userId === ref.studentId);
      return {
        ...ref.toObject(),
        student: student ? {
          name: student.name,
          email: student.email,
          branch: student.branch,
          batch: student.batch,
          cgpa: student.cgpa
        } : null
      };
    });

    res.json({
      success: true,
      referrals: enrichedReferrals
    });

  } catch (error: any) {
    console.error('[Jobs] Failed to fetch referrals:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/jobs/referrals/:referralId/status
 * Update referral status
 */
router.put('/referrals/:referralId/status', authenticate, requireAlumni, async (req: AuthRequest, res: Response) => {
  try {
    const { referralId } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const referral = await JobReferral.findOne({ referralId });
    if (!referral) {
      return res.status(404).json({ error: 'Referral not found' });
    }

    // Update status
    referral.status = status;
    referral.statusHistory.push({
      status,
      timestamp: new Date(),
      notes
    });

    await referral.save();

    res.json({
      success: true,
      message: 'Referral status updated',
      referral
    });

  } catch (error: any) {
    console.error('[Jobs] Referral status update failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== STUDENT INTEREST ====================

/**
 * POST /api/mentorship/jobs/:jobId/interest
 * Student marks interest in a job (eligibility enforced)
 */
router.post('/:jobId/interest', authenticate, requireStudent, async (req: AuthRequest, res: Response) => {
  try {
    const { jobId } = req.params;
    const studentId = req.user!.userId;

    const job = await Job.findOne({ jobId });
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.status !== JobStatus.ACTIVE) {
      return res.status(400).json({ error: 'Job is not active' });
    }

    const student = await StudentProfile.findOne({ userId: studentId });
    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    // Eligibility checks
    const reasons: string[] = [];
    const cgpaVal = parseFloat(student.cgpa || '0');
    if (typeof job.minCGPA === 'number' && !isNaN(job.minCGPA)) {
      if (isNaN(cgpaVal) || cgpaVal < job.minCGPA) {
        reasons.push(`CGPA below minimum requirement (${student.cgpa || 'N/A'} < ${job.minCGPA})`);
      }
    }

    if (Array.isArray(job.eligibleBranches) && job.eligibleBranches.length > 0) {
      if (!student.branch || !job.eligibleBranches.includes(student.branch)) {
        reasons.push(`Branch not eligible (${student.branch || 'N/A'})`);
      }
    }

    if (Array.isArray(job.eligibleBatches) && job.eligibleBatches.length > 0) {
      if (!student.batch || !job.eligibleBatches.includes(student.batch)) {
        reasons.push(`Batch not eligible (${student.batch || 'N/A'})`);
      }
    }

    if (reasons.length > 0) {
      return res.status(403).json({
        success: false,
        error: 'Not eligible for this job',
        reasons
      });
    }

    // Upsert interest (ensure unique per jobId+studentId)
    let interest = await JobInterest.findOne({ jobId, studentId });
    if (!interest) {
      const interestId = `interest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      interest = new JobInterest({
        interestId,
        jobId,
        studentId,
        eligible: true,
        ineligibleReasons: []
      });
      await interest.save();
    }

    res.json({
      success: true,
      message: 'Interest recorded',
      interest
    });

  } catch (error: any) {
    console.error('[Jobs] Mark interest failed:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/mentorship/jobs/:jobId/interested
 * Alumni fetches interested students for their job, sorted by match score
 */
router.get('/:jobId/interested', authenticate, requireAlumni, async (req: AuthRequest, res: Response) => {
  try {
    const { jobId } = req.params;
    const userId = req.user!.userId;

    const job = await Job.findOne({ jobId });
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Verify ownership
    if (job.postedBy !== userId) {
      return res.status(403).json({ error: 'You can only view interested students for your own jobs' });
    }

    const interests = await JobInterest.find({ jobId });
    if (interests.length === 0) {
      return res.json({ success: true, totalInterested: 0, students: [] });
    }

    const studentIds = interests.map(i => i.studentId);
    const students = await StudentProfile.find({ userId: { $in: studentIds } });

    // Prepare data for matching
    const studentData = students.map(s => ({
      userId: s.userId,
      name: s.name,
      skills: s.skills,
      cgpa: s.cgpa,
      branch: s.branch,
      batch: s.batch,
      domain: s.domain,
      careerGoals: s.careerGoals,
      totalExperience: s.totalExperience,
      projects: s.projects,
      internships: s.internships
    }));

    // Compute match scores (uses fallback if AI keys missing)
    const matches = await LangChainMatchingService.matchStudentsToJob(
      job.description,
      job.requiredSkills || [],
      job.preferredSkills || [],
      studentData
    );

    // Enrich and sort by matchScore desc
    const enriched = matches.map(m => {
      const student = students.find(s => s.userId === m.studentId);
      return {
        studentId: m.studentId,
        matchScore: m.matchScore,
        matchReasons: m.matchReasons,
        skillMatches: m.skillMatches,
        skillGaps: m.skillGaps,
        student: student ? {
          userId: student.userId,
          name: student.name,
          email: student.email,
          branch: student.branch,
          batch: student.batch,
          cgpa: student.cgpa,
          skills: student.skills,
          linkedIn: student.linkedIn,
          github: student.github,
          portfolioUrl: student.portfolioUrl
        } : null
      };
    }).sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      totalInterested: enriched.length,
      students: enriched
    });

  } catch (error: any) {
    console.error('[Jobs] Fetch interested students failed:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
