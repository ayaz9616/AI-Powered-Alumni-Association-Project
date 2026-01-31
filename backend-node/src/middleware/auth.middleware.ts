import { Request, Response, NextFunction } from 'express';
import { User, UserRole } from '../models/Mentorship';

/**
 * ROLE-BASED AUTHENTICATION MIDDLEWARE
 * 
 * Simple userId-based authentication (no JWT for now)
 * Frontend sends userId in headers
 * Backend validates user exists and has correct role
 */

// Extend Express Request to include user
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    name: string;
    role: UserRole;
  };
}

/**
 * Authenticate user from userId header
 * Adds user object to request
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      res.status(401).json({ 
        error: 'Authentication required',
        message: 'x-user-id header missing' 
      });
      return;
    }

    // Fetch user from database
    const user = await User.findOne({ userId });
    if (!user) {
      res.status(401).json({ 
        error: 'Invalid user',
        message: 'User not found' 
      });
      return;
    }

    // Attach user to request
    req.user = {
      userId: user.userId,
      email: user.email,
      name: user.name,
      role: user.role
    };

    next();
  } catch (error: any) {
    console.error('[Auth] Authentication failed:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
};

/**
 * Require specific role(s)
 * Must be used after authenticate middleware
 */
export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ 
        error: 'Authentication required' 
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ 
        error: 'Forbidden',
        message: `This action requires one of: ${allowedRoles.join(', ')}`,
        yourRole: req.user.role
      });
      return;
    }

    next();
  };
};

/**
 * Require student role
 */
export const requireStudent = requireRole(UserRole.STUDENT);

/**
 * Require alumni role
 */
export const requireAlumni = requireRole(UserRole.ALUMNI);

/**
 * Require admin role
 */
export const requireAdmin = requireRole(UserRole.ADMIN);

/**
 * Require student or alumni (mentorship participants)
 */
export const requireMentorshipUser = requireRole(UserRole.STUDENT, UserRole.ALUMNI);

/**
 * Optional authentication - attaches user if present but doesn't require it
 */
export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.headers['x-user-id'] as string;

    if (userId) {
      const user = await User.findOne({ userId });
      if (user) {
        req.user = {
          userId: user.userId,
          email: user.email,
          name: user.name,
          role: user.role
        };
      }
    }

    next();
  } catch (error) {
    // Continue without auth on error
    next();
  }
};
