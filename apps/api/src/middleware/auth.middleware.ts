import { Request, Response, NextFunction } from 'express';
import { supabase } from '@k2w/database';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    [key: string]: any;
  };
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        status: 'error',
        message: 'No valid authorization token provided'
      });
      return;
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify the JWT token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({
        status: 'error',
        message: 'Invalid or expired token'
      });
      return;
    }

    // Add user to request object
    req.user = {
      id: user.id,
      email: user.email || '',
      ...user.user_metadata
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Authentication service error'
    });
  }
};