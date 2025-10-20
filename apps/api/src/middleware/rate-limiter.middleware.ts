import { RateLimiterMemory } from 'rate-limiter-flexible';
import { Request, Response, NextFunction } from 'express';

interface RateLimiterError {
  remainingPoints?: number;
  msBeforeNext?: number;
  totalHits?: number;
}

const limiter = new RateLimiterMemory({
  points: 100, // Number of requests
  duration: 60, // Per 60 seconds
});

export const rateLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await limiter.consume(req.ip || 'anonymous');
    next();
  } catch (rateLimiterResponse: unknown) {
    const error = rateLimiterResponse as RateLimiterError;
    const remainingPoints = error?.remainingPoints || 0;
    const msBeforeNext = error?.msBeforeNext || 0;
    
    res.set({
      'Retry-After': Math.round(msBeforeNext / 1000) || 1,
      'X-RateLimit-Limit': 100,
      'X-RateLimit-Remaining': remainingPoints,
      'X-RateLimit-Reset': new Date(Date.now() + msBeforeNext).toISOString(),
    });
    
    res.status(429).json({
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
    });
  }
};