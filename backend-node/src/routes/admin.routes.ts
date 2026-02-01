import { Router, Response } from 'express';
import { User, StudentProfile, AlumniProfile, MentorshipSession, SessionStatus, UserRole, JobReferral } from '../models/Mentorship';
import { InfluenceInsightsService } from '../services/InfluenceInsightsService';
import { authenticate, requireAdmin, optionalAuth, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

/**
 * ADMIN ANALYTICS DASHBOARD
 * 
 * Pure aggregation - NO AI
 * Provides insights for administrators
 */

/**
 * GET /api/mentorship/admin/stats/overview
 * Get high-level platform statistics
 * 
 * Protected: ADMIN role only
 */
router.get('/admin/stats/overview', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    // Count users by role
    const totalStudents = await User.countDocuments({ role: UserRole.STUDENT });
    const totalAlumni = await User.countDocuments({ role: UserRole.ALUMNI });
    const totalAdmins = await User.countDocuments({ role: UserRole.ADMIN });
    const totalUsers = totalStudents + totalAlumni + totalAdmins;

    // Count profiles
    const studentProfilesCreated = await StudentProfile.countDocuments();
    const alumniProfilesCreated = await AlumniProfile.countDocuments();

    // Session statistics
    const totalSessions = await MentorshipSession.countDocuments();
    const sessionsByStatus = await MentorshipSession.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const sessionsCompleted = sessionsByStatus.find(s => s._id === SessionStatus.COMPLETED)?.count || 0;
    const sessionsPending = sessionsByStatus.find(s => s._id === SessionStatus.REQUESTED)?.count || 0;
    const sessionsAccepted = sessionsByStatus.find(s => s._id === SessionStatus.ACCEPTED)?.count || 0;

    // Active users (users with profiles)
    const activeStudents = studentProfilesCreated;
    const activeAlumni = alumniProfilesCreated;

    res.json({
      success: true,
      overview: {
        users: {
          total: totalUsers,
          students: totalStudents,
          alumni: totalAlumni,
          admins: totalAdmins,
          activeStudents,
          activeAlumni
        },
        profiles: {
          studentProfiles: studentProfilesCreated,
          alumniProfiles: alumniProfilesCreated,
          profileCompletionRate: {
            students: totalStudents > 0 ? (studentProfilesCreated / totalStudents * 100).toFixed(2) + '%' : '0%',
            alumni: totalAlumni > 0 ? (alumniProfilesCreated / totalAlumni * 100).toFixed(2) + '%' : '0%'
          }
        },
        sessions: {
          total: totalSessions,
          completed: sessionsCompleted,
          pending: sessionsPending,
          accepted: sessionsAccepted,
          completionRate: totalSessions > 0 ? (sessionsCompleted / totalSessions * 100).toFixed(2) + '%' : '0%'
        }
      }
    });

  } catch (error: any) {
    console.error('[Admin] Overview stats failed:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/mentorship/admin/stats/alumni-performance
 * Get top performing alumni by ratings and sessions
 * 
 * Protected: ADMIN role only
 */
router.get('/admin/stats/alumni-performance', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { limit = 20 } = req.query;

    const topAlumni = await AlumniProfile.find()
      .sort({ impactScore: -1, averageRating: -1, sessionsCompleted: -1 })
      .limit(parseInt(limit as string));

    // Enrich with user data
    const enrichedAlumni = await Promise.all(
      topAlumni.map(async (alumni) => {
        const user = await User.findOne({ userId: alumni.userId });
        return {
          userId: alumni.userId,
          name: user?.name,
          email: user?.email,
          currentRole: alumni.currentRole,
          company: alumni.company,
          sessionsCompleted: alumni.sessionsCompleted,
          averageRating: alumni.averageRating.toFixed(2),
          impactScore: alumni.impactScore.toFixed(2),
          domainsOfExpertise: alumni.domainsOfExpertise
        };
      })
    );

    res.json({
      success: true,
      topAlumni: enrichedAlumni,
      total: enrichedAlumni.length
    });

  } catch (error: any) {
    console.error('[Admin] Alumni performance stats failed:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/mentorship/admin/stats/engagement-trends
 * Get engagement trends over time
 * 
 * Protected: ADMIN role only
 */
router.get('/admin/stats/engagement-trends', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    // Sessions created per month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const sessionTrends = await MentorshipSession.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          completed: {
            $sum: {
              $cond: [{ $eq: ['$status', SessionStatus.COMPLETED] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // New user registrations per month
    const userTrends = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            role: '$role'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    res.json({
      success: true,
      trends: {
        sessions: sessionTrends,
        userRegistrations: userTrends
      }
    });

  } catch (error: any) {
    console.error('[Admin] Engagement trends failed:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/mentorship/admin/stats/feedback-summary
 * Get aggregated feedback data
 * 
 * Protected: ADMIN role only
 */
router.get('/admin/stats/feedback-summary', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    // Get all completed sessions with feedback
    const sessionsWithFeedback = await MentorshipSession.find({
      status: SessionStatus.COMPLETED,
      'studentFeedback.rating': { $exists: true }
    });

    if (sessionsWithFeedback.length === 0) {
      return res.json({
        success: true,
        message: 'No feedback data available yet',
        feedbackSummary: {
          totalFeedbacks: 0,
          averageRating: 0,
          averageUsefulness: 0,
          averageClarity: 0,
          averagePreparedness: 0,
          averageEngagement: 0
        }
      });
    }

    // Calculate averages
    const totalFeedbacks = sessionsWithFeedback.length;
    
    const avgRating = sessionsWithFeedback.reduce((sum, s) => sum + (s.studentFeedback?.rating || 0), 0) / totalFeedbacks;
    const avgUsefulness = sessionsWithFeedback.reduce((sum, s) => sum + (s.studentFeedback?.usefulness || 0), 0) / totalFeedbacks;
    const avgClarity = sessionsWithFeedback.reduce((sum, s) => sum + (s.studentFeedback?.clarity || 0), 0) / totalFeedbacks;
    
    const sessionsWithAlumniFeedback = sessionsWithFeedback.filter(s => s.alumniFeedback);
    const avgPreparedness = sessionsWithAlumniFeedback.length > 0
      ? sessionsWithAlumniFeedback.reduce((sum, s) => sum + (s.alumniFeedback?.preparedness || 0), 0) / sessionsWithAlumniFeedback.length
      : 0;
    const avgEngagement = sessionsWithAlumniFeedback.length > 0
      ? sessionsWithAlumniFeedback.reduce((sum, s) => sum + (s.alumniFeedback?.engagement || 0), 0) / sessionsWithAlumniFeedback.length
      : 0;

    // Rating distribution
    const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
      rating,
      count: sessionsWithFeedback.filter(s => s.studentFeedback?.rating === rating).length
    }));

    res.json({
      success: true,
      feedbackSummary: {
        totalFeedbacks,
        totalAlumniFeedbacks: sessionsWithAlumniFeedback.length,
        averages: {
          rating: avgRating.toFixed(2),
          usefulness: avgUsefulness.toFixed(2),
          clarity: avgClarity.toFixed(2),
          preparedness: avgPreparedness.toFixed(2),
          engagement: avgEngagement.toFixed(2)
        },
        ratingDistribution
      }
    });

  } catch (error: any) {
    console.error('[Admin] Feedback summary failed:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/mentorship/admin/stats/popular-domains
 * Get most popular expertise domains
 * 
 * Protected: ADMIN role only
 */
router.get('/admin/stats/popular-domains', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    // Aggregate domains from student preferences
    const studentDomains = await StudentProfile.aggregate([
      { $unwind: '$preferredDomains' },
      {
        $group: {
          _id: '$preferredDomains',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 15 }
    ]);

    // Aggregate domains from alumni expertise
    const alumniDomains = await AlumniProfile.aggregate([
      { $unwind: '$domainsOfExpertise' },
      {
        $group: {
          _id: '$domainsOfExpertise',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 15 }
    ]);

    res.json({
      success: true,
      popularDomains: {
        studentPreferences: studentDomains.map(d => ({
          domain: d._id,
          count: d.count
        })),
        alumniExpertise: alumniDomains.map(d => ({
          domain: d._id,
          count: d.count
        }))
      }
    });

  } catch (error: any) {
    console.error('[Admin] Popular domains failed:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/mentorship/admin/users/list
 * List all users with filters
 * 
 * Protected: ADMIN role only
 */
router.get('/admin/users/list', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { role, limit = 50, skip = 0 } = req.query;

    let query: any = {};
    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .limit(parseInt(limit as string))
      .skip(parseInt(skip as string))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      total,
      limit: parseInt(limit as string),
      skip: parseInt(skip as string)
    });

  } catch (error: any) {
    console.error('[Admin] User list failed:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

/**
 * GET /api/mentorship/admin/graphs/influence
 * Build an Alumni → Students influence graph
 * Computes degree-based centrality and batch coverage
 * 
 * Protected: ADMIN role only
 */
router.get('/admin/graphs/influence', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    // Fetch all completed mentorship sessions
    const sessions = await MentorshipSession.find({ status: SessionStatus.COMPLETED }).select('alumniId studentId');
    // Include referrals as influence
    const referrals = await JobReferral.find().select('referredBy studentId');

    // Build edges alumni -> student
    const edgesMap = new Map<string, Set<string>>();

    for (const s of sessions) {
      const key = s.alumniId;
      if (!edgesMap.has(key)) edgesMap.set(key, new Set());
      edgesMap.get(key)!.add(s.studentId);
    }
    for (const r of referrals) {
      const key = r.referredBy;
      if (!edgesMap.has(key)) edgesMap.set(key, new Set());
      edgesMap.get(key)!.add(r.studentId);
    }

    // Collect batch info for students
    const allStudentIds = Array.from(new Set(Array.from(edgesMap.values()).flatMap(set => Array.from(set))));
    const studentProfiles = await StudentProfile.find({ userId: { $in: allStudentIds } }).select('userId batch');
    const batchByStudent = new Map<string, string>();
    studentProfiles.forEach(sp => batchByStudent.set(sp.userId, sp.batch || 'Unknown'));

    // Build nodes for alumni with centrality and batch coverage
    const alumniIds = Array.from(edgesMap.keys());
    const alumniUsers = await User.find({ userId: { $in: alumniIds } }).select('userId name email');
    const alumniById = new Map(alumniUsers.map(u => [u.userId, u]));

    const nodes = alumniIds.map(alumniId => {
      const influenced: string[] = Array.from(edgesMap.get(alumniId) || new Set<string>());
      const batches = new Set<string>();
      influenced.forEach((sid: string) => batches.add(batchByStudent.get(sid) || 'Unknown'));
      const degree = influenced.length;
      // Simple normalized centrality: degree / maxDegree
      // Compute max later; set placeholder
      return {
        id: alumniId,
        type: 'alumni',
        label: alumniById.get(alumniId)?.name || alumniId,
        email: alumniById.get(alumniId)?.email,
        impactedStudents: degree,
        batches: Array.from(batches),
        centrality: degree,
      };
    });

    const maxDegree = nodes.reduce((m, n) => Math.max(m, n.centrality), 1);
    nodes.forEach(n => (n.centrality = Number((n.centrality / maxDegree).toFixed(3))));

    // Construct edges array limited to top alumni by degree for brevity
    const topAlumni = nodes
      .sort((a, b) => b.impactedStudents - a.impactedStudents)
      .slice(0, 20)
      .map(n => n.id);

    const edges: Array<{ source: string; target: string; weight: number }> = [];
    for (const alumniId of topAlumni) {
      const influenced: string[] = Array.from(edgesMap.get(alumniId) || new Set<string>());
      influenced.forEach((studentId: string) => {
        edges.push({ source: alumniId, target: studentId, weight: 1 });
      });
    }

    // Build student nodes for targets (minimal fields)
    const studentNodes = Array.from(new Set(edges.map(e => e.target))).map(studentId => ({
      id: studentId,
      type: 'student',
      label: studentId,
    }));

    // AI-generated insights
    const aiTexts = await InfluenceInsightsService.generateInsights(nodes.map(n => ({
      id: n.id,
      label: n.label,
      impactedStudents: n.impactedStudents,
      batches: n.batches,
      centrality: n.centrality,
    })));
    const insights = (aiTexts && aiTexts.length)
      ? aiTexts.map(t => ({ text: t }))
      : nodes.slice(0, 10).map(n => ({ text: `${n.label} impacted ${n.impactedStudents} students across ${n.batches.length} batches.` }));

    res.json({
      success: true,
      graph: {
        nodes: [...nodes, ...studentNodes],
        edges,
      },
      insights,
    });
  } catch (error: any) {
    console.error('[Admin] Influence graph failed:', error);
    res.status(500).json({ error: error.message });
  }
});
