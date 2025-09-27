// Authentication middleware for multi-tenant system
import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedUser {
  id: string;
  email: string;
  collegeId: string;
  role: 'super_admin' | 'college_admin' | 'faculty' | 'student';
  firstName: string;
  lastName: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
  collegeId?: string;
}

export class AuthMiddleware {
  // Authenticate user and extract user information
  static authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          error: 'No authentication token provided'
        });
      }
      
      const token = authHeader.substring(7);
      
      // TODO: Verify JWT token with Firebase Admin SDK
      // const decodedToken = await admin.auth().verifyIdToken(token);
      
      // Mock user for now - replace with actual Firebase verification
      const mockUser: AuthenticatedUser = {
        id: 'user_123',
        email: 'admin@nit-srinagar.ac.in',
        collegeId: 'nit-srinagar-001',
        role: 'college_admin',
        firstName: 'Admin',
        lastName: 'User'
      };
      
      (req as AuthenticatedRequest).user = mockUser;
      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        error: 'Invalid authentication token'
      });
    }
  };

  // Check if user has specific role
  static requireRole = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const authReq = req as AuthenticatedRequest;
      if (!authReq.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }
      
      if (!roles.includes(authReq.user.role)) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions'
        });
      }
      
      next();
    };
  };

  // Check if user is college admin or super admin
  static requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    if (authReq.user.role !== 'college_admin' && authReq.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }
    
    next();
  };

  // Check if user is super admin
  static requireSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    if (authReq.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        error: 'Super admin access required'
      });
    }
    
    next();
  };

  // Check if user belongs to the same college
  static requireSameCollege = (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    if (!authReq.collegeId) {
      return res.status(400).json({
        success: false,
        error: 'College context not found'
      });
    }
    
    if (authReq.user.collegeId !== authReq.collegeId && authReq.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this college'
      });
    }
    
    next();
  };

  // Optional authentication - doesn't fail if no token
  static optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        
        // TODO: Verify JWT token with Firebase Admin SDK
        // const decodedToken = await admin.auth().verifyIdToken(token);
        
        // Mock user for now
        const mockUser: AuthenticatedUser = {
          id: 'user_123',
          email: 'admin@nit-srinagar.ac.in',
          collegeId: 'nit-srinagar-001',
          role: 'college_admin',
          firstName: 'Admin',
          lastName: 'User'
        };
        
        (req as AuthenticatedRequest).user = mockUser;
      }
      
      next();
    } catch (error) {
      // Continue without authentication
      next();
    }
  };
}
