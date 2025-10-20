/**
 * Advanced Rate Limiting & API Protection
 * Adaptive rate limiting based on user tier, endpoint sensitivity, and system load
 * Protects against abuse while allowing legitimate usage
 */

import { Request, Response, NextFunction } from 'express';

// Extend Request interface for user data
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        tier?: string;
      };
    }
  }
}

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: Request) => string;
  onLimitReached?: (req: Request, res: Response) => void;
}

interface UserTier {
  name: string;
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  burstLimit: number;
}

interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

export class AdvancedRateLimiter {
  private requestCounts = new Map<string, Map<number, number>>();
  private lastRequestTime = new Map<string, number>();
  
  private readonly userTiers: Record<string, UserTier> = {
    free: {
      name: 'Free',
      requestsPerMinute: 10,
      requestsPerHour: 100,
      requestsPerDay: 1000,
      burstLimit: 5
    },
    pro: {
      name: 'Pro',
      requestsPerMinute: 50,
      requestsPerHour: 1000,
      requestsPerDay: 10000,
      burstLimit: 20
    },
    enterprise: {
      name: 'Enterprise',
      requestsPerMinute: 200,
      requestsPerHour: 5000,
      requestsPerDay: 50000,
      burstLimit: 100
    }
  };

  /**
   * Create adaptive rate limiter middleware
   */
  createLimiter(config: Partial<RateLimitConfig> = {}) {
    const defaultConfig: RateLimitConfig = {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 100,
      keyGenerator: (req) => this.generateKey(req),
      onLimitReached: (req, res) => this.handleLimitReached(req, res),
      ...config
    };

    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const key = defaultConfig.keyGenerator!(req);
        const userTier = this.getUserTier(req);
        
        // Check different time windows
        const checks = [
          { window: 60, limit: userTier.requestsPerMinute, name: 'minute' },
          { window: 3600, limit: userTier.requestsPerHour, name: 'hour' },
          { window: 86400, limit: userTier.requestsPerDay, name: 'day' }
        ];

        for (const check of checks) {
          const limitInfo = await this.checkLimit(key, check.window, check.limit);
          
          if (!limitInfo.remaining || limitInfo.remaining <= 0) {
            this.setRateLimitHeaders(res, limitInfo);
            
            res.status(429).json({
              success: false,
              error: 'Rate limit exceeded',
              message: `Too many requests. Limit: ${check.limit} per ${check.name}`,
              retryAfter: limitInfo.retryAfter,
              tier: userTier.name,
              upgradeInfo: userTier.name === 'free' ? {
                message: 'Upgrade to Pro for higher limits',
                limits: this.userTiers.pro
              } : undefined
            });
            return;
          }
        }

        // Check burst protection
        if (!this.checkBurstLimit(key, userTier.burstLimit)) {
          res.status(429).json({
            success: false,
            error: 'Burst limit exceeded',
            message: 'Too many requests in a short time. Please slow down.',
            retryAfter: 10
          });
          return;
        }

        // Record successful request
        this.recordRequest(key);
        this.setRateLimitHeaders(res, {
          limit: userTier.requestsPerMinute,
          remaining: userTier.requestsPerMinute - this.getCurrentCount(key, 60),
          resetTime: this.getResetTime(60)
        });

        next();
      } catch (error) {
        console.error('Rate limiter error:', error);
        next(); // Fail open for availability
      }
    };
  }

  /**
   * Endpoint-specific rate limiting
   */
  createEndpointLimiter(endpointConfig: Record<string, Partial<RateLimitConfig>>) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const endpoint = this.getEndpointKey(req);
      const config = endpointConfig[endpoint] || {};
      
      const limiter = this.createLimiter(config);
      limiter(req, res, next);
    };
  }

  /**
   * Cost-based rate limiting for expensive operations
   */
  createCostBasedLimiter(costCalculator: (req: Request) => number, maxCostPerHour: number = 100) {
    const costTracker = new Map<string, { cost: number; resetTime: number }>();

    return (req: Request, res: Response, next: NextFunction): void => {
      const key = this.generateKey(req);
      const requestCost = costCalculator(req);
      const now = Date.now();
      const hourMs = 60 * 60 * 1000;
      
      let userCost = costTracker.get(key);
      
      // Reset if hour has passed
      if (!userCost || now > userCost.resetTime) {
        userCost = { cost: 0, resetTime: now + hourMs };
      }
      
      // Check if adding this request would exceed cost limit
      if (userCost.cost + requestCost > maxCostPerHour) {
        const retryAfter = Math.ceil((userCost.resetTime - now) / 1000);
        
        res.status(429).json({
          success: false,
          error: 'Cost limit exceeded',
          message: `Request cost (${requestCost}) would exceed hourly limit (${maxCostPerHour})`,
          retryAfter,
          currentCost: userCost.cost,
          maxCost: maxCostPerHour
        });
        return;
      }
      
      // Record cost
      userCost.cost += requestCost;
      costTracker.set(key, userCost);
      
      // Add cost headers
      res.setHeader('X-Cost-Limit', maxCostPerHour);
      res.setHeader('X-Cost-Remaining', maxCostPerHour - userCost.cost);
      res.setHeader('X-Cost-Reset', userCost.resetTime);
      
      next();
    };
  }

  /**
   * Circuit breaker for system protection
   */
  createCircuitBreaker(failureThreshold: number = 10, timeoutMs: number = 60000) {
    let failureCount = 0;
    let lastFailureTime = 0;
    let state: 'closed' | 'open' | 'half-open' = 'closed';

    return (req: Request, res: Response, next: NextFunction): void => {
      const now = Date.now();
      
      // Reset if timeout has passed
      if (state === 'open' && now - lastFailureTime > timeoutMs) {
        state = 'half-open';
        failureCount = 0;
      }
      
      if (state === 'open') {
        res.status(503).json({
          success: false,
          error: 'Service temporarily unavailable',
          message: 'Circuit breaker is open. Please try again later.',
          retryAfter: Math.ceil((timeoutMs - (now - lastFailureTime)) / 1000)
        });
        return;
      }
      
      // Monitor response for failures
      const originalSend = res.send;
      res.send = function(body) {
        if (res.statusCode >= 500) {
          failureCount++;
          lastFailureTime = now;
          
          if (failureCount >= failureThreshold) {
            state = 'open';
          }
        } else if (state === 'half-open') {
          state = 'closed';
          failureCount = 0;
        }
        
        return originalSend.call(this, body);
      };
      
      next();
    };
  }

  /**
   * Get rate limit status for a user
   */
  async getRateLimitStatus(req: Request): Promise<{
    tier: string;
    limits: UserTier;
    usage: {
      minute: { used: number; limit: number; remaining: number };
      hour: { used: number; limit: number; remaining: number };
      day: { used: number; limit: number; remaining: number };
    };
    resetTimes: {
      minute: number;
      hour: number;
      day: number;
    };
  }> {
    const key = this.generateKey(req);
    const userTier = this.getUserTier(req);
    
    const usage = {
      minute: {
        used: this.getCurrentCount(key, 60),
        limit: userTier.requestsPerMinute,
        remaining: 0
      },
      hour: {
        used: this.getCurrentCount(key, 3600),
        limit: userTier.requestsPerHour,
        remaining: 0
      },
      day: {
        used: this.getCurrentCount(key, 86400),
        limit: userTier.requestsPerDay,
        remaining: 0
      }
    };
    
    usage.minute.remaining = Math.max(0, usage.minute.limit - usage.minute.used);
    usage.hour.remaining = Math.max(0, usage.hour.limit - usage.hour.used);
    usage.day.remaining = Math.max(0, usage.day.limit - usage.day.used);
    
    return {
      tier: userTier.name,
      limits: userTier,
      usage,
      resetTimes: {
        minute: this.getResetTime(60),
        hour: this.getResetTime(3600),
        day: this.getResetTime(86400)
      }
    };
  }

  // Private helper methods
  private generateKey(req: Request): string {
    const userId = req.user?.id || 'anonymous';
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    return `${userId}:${ip}`;
  }

  private getUserTier(req: Request): UserTier {
    const userTier = req.user?.tier || 'free';
    return this.userTiers[userTier] || this.userTiers.free;
  }

  private getEndpointKey(req: Request): string {
    const method = req.method.toLowerCase();
    const path = req.route?.path || req.path;
    return `${method}:${path}`;
  }

  private async checkLimit(key: string, windowSeconds: number, limit: number): Promise<RateLimitInfo> {
    const count = this.getCurrentCount(key, windowSeconds);
    const remaining = Math.max(0, limit - count);
    const resetTime = this.getResetTime(windowSeconds);
    
    return {
      limit,
      remaining,
      resetTime,
      retryAfter: remaining <= 0 ? Math.ceil((resetTime - Date.now()) / 1000) : undefined
    };
  }

  private getCurrentCount(key: string, windowSeconds: number): number {
    const now = Date.now();
    const windowStart = Math.floor(now / (windowSeconds * 1000));
    
    const userCounts = this.requestCounts.get(key);
    if (!userCounts) return 0;
    
    return userCounts.get(windowStart) || 0;
  }

  private recordRequest(key: string): void {
    const now = Date.now();
    const windows = [60, 3600, 86400]; // 1 min, 1 hour, 1 day
    
    for (const windowSeconds of windows) {
      const windowStart = Math.floor(now / (windowSeconds * 1000));
      
      if (!this.requestCounts.has(key)) {
        this.requestCounts.set(key, new Map());
      }
      
      const userCounts = this.requestCounts.get(key)!;
      userCounts.set(windowStart, (userCounts.get(windowStart) || 0) + 1);
      
      // Clean old windows
      for (const [window, count] of userCounts.entries()) {
        if (window < windowStart - 1) {
          userCounts.delete(window);
        }
      }
    }
    
    this.lastRequestTime.set(key, now);
  }

  private checkBurstLimit(key: string, burstLimit: number): boolean {
    const now = Date.now();
    const lastRequest = this.lastRequestTime.get(key);
    
    if (!lastRequest) return true;
    
    const timeDiff = now - lastRequest;
    const minInterval = (60 * 1000) / burstLimit; // Minimum ms between requests
    
    return timeDiff >= minInterval;
  }

  private getResetTime(windowSeconds: number): number {
    const now = Date.now();
    const windowMs = windowSeconds * 1000;
    const windowStart = Math.floor(now / windowMs) * windowMs;
    return windowStart + windowMs;
  }

  private setRateLimitHeaders(res: Response, info: RateLimitInfo): void {
    res.setHeader('X-RateLimit-Limit', info.limit);
    res.setHeader('X-RateLimit-Remaining', info.remaining);
    res.setHeader('X-RateLimit-Reset', info.resetTime);
    
    if (info.retryAfter) {
      res.setHeader('Retry-After', info.retryAfter);
    }
  }

  private handleLimitReached(req: Request, res: Response): void {
    const userTier = this.getUserTier(req);
    
    if (userTier.name === 'free') {
      res.setHeader('X-Upgrade-Available', 'true');
      res.setHeader('X-Upgrade-Url', '/pricing');
    }
  }
}

// Export singleton instance
export const rateLimiter = new AdvancedRateLimiter();

// Preset configurations for common endpoints
export const rateLimitPresets = {
  // Standard API endpoints
  api: rateLimiter.createLimiter({
    windowMs: 60 * 1000,
    maxRequests: 100
  }),

  // Expensive AI endpoints
  ai: rateLimiter.createCostBasedLimiter(
    (req) => {
      const wordCount = req.body?.content?.length || 100;
      return Math.ceil(wordCount / 1000); // Cost based on content length
    },
    50 // Max cost per hour
  ),

  // Authentication endpoints
  auth: rateLimiter.createLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5 // Very strict for auth
  }),

  // Health check endpoints
  health: rateLimiter.createLimiter({
    windowMs: 60 * 1000,
    maxRequests: 1000 // Very permissive
  }),

  // Circuit breaker for system protection
  systemProtection: rateLimiter.createCircuitBreaker(10, 60000)
};