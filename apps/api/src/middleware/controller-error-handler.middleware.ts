/**
 * Controller Error Handler Middleware
 * Enhanced error handling for API controllers
 */

import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}

/**
 * Enhanced error handler middleware for controllers
 */
export const errorHandler = (
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log error for monitoring
  console.error('Controller Error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
    timestamp: new Date().toISOString()
  });

  // Default error response
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal server error';
  
  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed: ' + error.message;
  } else if (error.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized access';
  } else if (error.name === 'NotFoundError') {
    statusCode = 404;
    message = 'Resource not found';
  } else if (error.name === 'ConflictError') {
    statusCode = 409;
    message = 'Resource conflict';
  } else if (error.code === 'ENOTFOUND') {
    statusCode = 503;
    message = 'External service unavailable';
  } else if (error.code === 'ECONNREFUSED') {
    statusCode = 503;
    message = 'Connection refused to external service';
  } else if (error.code === 'ETIMEDOUT') {
    statusCode = 504;
    message = 'Request timeout';
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: message,
    code: error.code,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    ...(process.env.NODE_ENV === 'development' && {
      stack: error.stack,
      details: error
    })
  });
};

/**
 * Async handler wrapper to catch async errors in controllers
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Validation error creator
 */
export const createValidationError = (message: string): ApiError => {
  const error = new Error(message) as ApiError;
  error.name = 'ValidationError';
  error.statusCode = 400;
  return error;
};

/**
 * Not found error creator
 */
export const createNotFoundError = (resource: string = 'Resource'): ApiError => {
  const error = new Error(`${resource} not found`) as ApiError;
  error.name = 'NotFoundError';
  error.statusCode = 404;
  return error;
};

/**
 * Unauthorized error creator
 */
export const createUnauthorizedError = (message: string = 'Unauthorized access'): ApiError => {
  const error = new Error(message) as ApiError;
  error.name = 'UnauthorizedError';
  error.statusCode = 401;
  return error;
};