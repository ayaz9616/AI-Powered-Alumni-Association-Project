import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { MentorshipSession, SessionStatus, AlumniProfile, StudentProfile } from '../models/Mentorship';
import { authenticate, requireStudent, requireAlumni, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// ==================== SESSION SCHEDULING ====================

/**
 * POST /api/mentorship/session/request
 * Student requests a mentorship session with alumni
 * 
 * Protected: STUDENT role only
 */
router.post('/session/request', authenticate, requireStudent, async (req: AuthRequest, res: Response) => {
  try {
    const {
      alumniId,
      sessionType,
      scheduledDate,
      startTime,
      endTime,
      agenda
    } = req.body;

    const studentId = req.user!.userId;

    // Validate required fields
    if (!alumniId || !sessionType || !scheduledDate || !startTime || !endTime) {
      return res.status(400).json({
        error: 'Missing required fields: alumniId, sessionType, scheduledDate, startTime, endTime'
      });
    }

    // Verify alumni exists
    const alumniProfile = await AlumniProfile.findOne({ userId: alumniId });
    if (!alumniProfile) {
      return res.status(404).json({ error: 'Alumni profile not found' });
    }

    // Verify student profile exists
    const studentProfile = await StudentProfile.findOne({ userId: studentId });
    if (!studentProfile) {
      return res.status(404).json({ error: 'Student profile not found. Please create your profile first.' });
    }

    // Check for scheduling conflicts
    const dateObj = new Date(scheduledDate);
    const existingSession = await MentorshipSession.findOne({
      alumniId,
      scheduledDate: dateObj,
      startTime,
      status: { $in: [SessionStatus.SCHEDULED, SessionStatus.ACCEPTED] }
    });

    if (existingSession) {
      return res.status(409).json({
        error: 'Time slot conflict',
        message: 'Alumni already has a session scheduled at this time'
      });
    }

    // Create session request
    const session = new MentorshipSession({
      sessionId: uuidv4(),
      studentId,
      alumniId,
      sessionType,
      scheduledDate: dateObj,
      startTime,
      endTime,
      status: SessionStatus.REQUESTED,
      agenda: agenda || ''
    });

    await session.save();

    res.status(201).json({
      success: true,
      message: 'Session request created successfully',
      session
    });

  } catch (error: any) {
    console.error('[Session] Session request failed:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/mentorship/session/:sessionId/accept
 * Alumni accepts a session request
 * 
 * Protected: ALUMNI role only
 */
router.post('/session/:sessionId/accept', authenticate, requireAlumni, async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { meetingLink } = req.body;
    const alumniId = req.user!.userId;

    const session = await MentorshipSession.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Verify this is the correct alumni
    if (session.alumniId !== alumniId) {
      return res.status(403).json({ error: 'You can only accept your own session requests' });
    }

    // Verify session is in REQUESTED state
    if (session.status !== SessionStatus.REQUESTED) {
      return res.status(400).json({
        error: 'Invalid session state',
        message: `Session is already ${session.status}`
      });
    }

    // Update session
    session.status = SessionStatus.ACCEPTED;
    session.meetingLink = meetingLink || '';
    await session.save();

    res.json({
      success: true,
      message: 'Session accepted successfully',
      session
    });

  } catch (error: any) {
    console.error('[Session] Session accept failed:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/mentorship/session/:sessionId/reject
 * Alumni rejects a session request
 * 
 * Protected: ALUMNI role only
 */
router.post('/session/:sessionId/reject', authenticate, requireAlumni, async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const alumniId = req.user!.userId;

    const session = await MentorshipSession.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.alumniId !== alumniId) {
      return res.status(403).json({ error: 'You can only reject your own session requests' });
    }

    if (session.status !== SessionStatus.REQUESTED) {
      return res.status(400).json({
        error: 'Invalid session state',
        message: `Session is already ${session.status}`
      });
    }

    session.status = SessionStatus.CANCELLED;
    await session.save();

    res.json({
      success: true,
      message: 'Session rejected',
      session
    });

  } catch (error: any) {
    console.error('[Session] Session reject failed:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/mentorship/session/:sessionId/complete
 * Mark session as completed
 * 
 * Protected: STUDENT or ALUMNI (participants only)
 */
router.post('/session/:sessionId/complete', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { notes } = req.body;
    const userId = req.user!.userId;

    const session = await MentorshipSession.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Verify user is a participant
    if (session.studentId !== userId && session.alumniId !== userId) {
      return res.status(403).json({ error: 'Only session participants can mark it as completed' });
    }

    if (session.status !== SessionStatus.ACCEPTED && session.status !== SessionStatus.SCHEDULED) {
      return res.status(400).json({
        error: 'Invalid session state',
        message: 'Only accepted/scheduled sessions can be completed'
      });
    }

    session.status = SessionStatus.COMPLETED;
    if (notes) {
      session.notes = notes;
    }
    await session.save();

    res.json({
      success: true,
      message: 'Session marked as completed',
      session
    });

  } catch (error: any) {
    console.error('[Session] Session completion failed:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/mentorship/session/my-sessions
 * Get all sessions for current user (student or alumni)
 * 
 * Protected: Authenticated users
 */
router.get('/session/my-sessions', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { status } = req.query;

    let query: any = {
      $or: [
        { studentId: userId },
        { alumniId: userId }
      ]
    };

    if (status) {
      query.status = status;
    }

    const sessions = await MentorshipSession.find(query)
      .sort({ scheduledDate: -1, createdAt: -1 });

    res.json({
      success: true,
      sessions,
      total: sessions.length
    });

  } catch (error: any) {
    console.error('[Session] Fetch sessions failed:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/mentorship/session/:sessionId
 * Get session details
 * 
 * Protected: Authenticated users (participants only)
 */
router.get('/session/:sessionId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user!.userId;

    const session = await MentorshipSession.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Verify user is a participant
    if (session.studentId !== userId && session.alumniId !== userId) {
      return res.status(403).json({ error: 'You can only view your own sessions' });
    }

    res.json({ session });

  } catch (error: any) {
    console.error('[Session] Fetch session failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== FEEDBACK SYSTEM ====================

/**
 * POST /api/mentorship/session/:sessionId/feedback/student
 * Student submits feedback for completed session
 * 
 * Protected: STUDENT role only (session participant)
 */
router.post('/session/:sessionId/feedback/student', authenticate, requireStudent, async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { rating, usefulness, clarity, comments } = req.body;
    const studentId = req.user!.userId;

    // Validate ratings
    if (!rating || !usefulness || !clarity) {
      return res.status(400).json({
        error: 'Missing required fields: rating, usefulness, clarity (all 1-5)'
      });
    }

    const session = await MentorshipSession.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Verify correct student
    if (session.studentId !== studentId) {
      return res.status(403).json({ error: 'You can only provide feedback for your own sessions' });
    }

    // Verify session is completed
    if (session.status !== SessionStatus.COMPLETED) {
      return res.status(400).json({
        error: 'Cannot submit feedback for incomplete session'
      });
    }

    // Check if feedback already exists
    if (session.studentFeedback) {
      return res.status(409).json({
        error: 'Feedback already submitted for this session'
      });
    }

    // Add student feedback
    session.studentFeedback = {
      rating: Math.min(Math.max(rating, 1), 5),
      usefulness: Math.min(Math.max(usefulness, 1), 5),
      clarity: Math.min(Math.max(clarity, 1), 5),
      comments: comments || '',
      submittedAt: new Date()
    };

    await session.save();

    // Update alumni metrics
    const alumni = await AlumniProfile.findOne({ userId: session.alumniId });
    if (alumni) {
      alumni.sessionsCompleted += 1;

      // Recalculate average rating
      const completedSessions = await MentorshipSession.find({
        alumniId: session.alumniId,
        status: SessionStatus.COMPLETED,
        'studentFeedback.rating': { $exists: true }
      });

      const totalRatings = completedSessions.reduce((sum, s) => sum + (s.studentFeedback?.rating || 0), 0);
      alumni.averageRating = totalRatings / completedSessions.length;

      // Calculate impact score (weighted metric)
      alumni.impactScore = (
        alumni.averageRating * 0.6 +
        Math.min(alumni.sessionsCompleted / 10, 1) * 2 +
        alumni.averageRating * 0.4
      );

      await alumni.save();
    }

    res.json({
      success: true,
      message: 'Feedback submitted successfully',
      feedback: session.studentFeedback
    });

  } catch (error: any) {
    console.error('[Feedback] Student feedback failed:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/mentorship/session/:sessionId/feedback/alumni
 * Alumni submits feedback for completed session
 * 
 * Protected: ALUMNI role only (session participant)
 */
router.post('/session/:sessionId/feedback/alumni', authenticate, requireAlumni, async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { rating, preparedness, engagement, comments } = req.body;
    const alumniId = req.user!.userId;

    if (!rating || !preparedness || !engagement) {
      return res.status(400).json({
        error: 'Missing required fields: rating, preparedness, engagement (all 1-5)'
      });
    }

    const session = await MentorshipSession.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.alumniId !== alumniId) {
      return res.status(403).json({ error: 'You can only provide feedback for your own sessions' });
    }

    if (session.status !== SessionStatus.COMPLETED) {
      return res.status(400).json({
        error: 'Cannot submit feedback for incomplete session'
      });
    }

    if (session.alumniFeedback) {
      return res.status(409).json({
        error: 'Feedback already submitted for this session'
      });
    }

    session.alumniFeedback = {
      rating: Math.min(Math.max(rating, 1), 5),
      preparedness: Math.min(Math.max(preparedness, 1), 5),
      engagement: Math.min(Math.max(engagement, 1), 5),
      comments: comments || '',
      submittedAt: new Date()
    };

    await session.save();

    res.json({
      success: true,
      message: 'Feedback submitted successfully',
      feedback: session.alumniFeedback
    });

  } catch (error: any) {
    console.error('[Feedback] Alumni feedback failed:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
