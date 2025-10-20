/**
 * Common API Response Handlers
 * Standardized response utilities for K2W API
 */

import { Request, Response, NextFunction } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  required_fields?: string[];
  timestamp?: string;
}

export class ResponseHandler {
  /**
   * Success response with data
   */
  static success<T>(res: Response, data: T, message?: string, statusCode: number = 200): Response {
    return res.status(statusCode).json({
      success: true,
      data,
      message,
      timestamp: new Date().toISOString()
    } as ApiResponse<T>);
  }

  /**
   * Success response without data
   */
  static successMessage(res: Response, message: string, statusCode: number = 200): Response {
    return res.status(statusCode).json({
      success: true,
      message,
      timestamp: new Date().toISOString()
    } as ApiResponse);
  }

  /**
   * Created response (201)
   */
  static created<T>(res: Response, data: T, message: string = 'Resource created successfully'): Response {
    return this.success(res, data, message, 201);
  }

  /**
   * Bad Request (400)
   */
  static badRequest(res: Response, error: string, requiredFields?: string[]): Response {
    return res.status(400).json({
      success: false,
      error,
      required_fields: requiredFields,
      timestamp: new Date().toISOString()
    } as ApiResponse);
  }

  /**
   * Unauthorized (401)
   */
  static unauthorized(res: Response, error: string = 'Unauthorized access'): Response {
    return res.status(401).json({
      success: false,
      error,
      timestamp: new Date().toISOString()
    } as ApiResponse);
  }

  /**
   * Forbidden (403)
   */
  static forbidden(res: Response, error: string = 'Access forbidden'): Response {
    return res.status(403).json({
      success: false,
      error,
      timestamp: new Date().toISOString()
    } as ApiResponse);
  }

  /**
   * Not Found (404)
   */
  static notFound(res: Response, error: string = 'Resource not found'): Response {
    return res.status(404).json({
      success: false,
      error,
      timestamp: new Date().toISOString()
    } as ApiResponse);
  }

  /**
   * Conflict (409)
   */
  static conflict(res: Response, error: string): Response {
    return res.status(409).json({
      success: false,
      error,
      timestamp: new Date().toISOString()
    } as ApiResponse);
  }

  /**
   * Unprocessable Entity (422)
   */
  static unprocessableEntity(res: Response, error: string, details?: unknown): Response {
    return res.status(422).json({
      success: false,
      error,
      details,
      timestamp: new Date().toISOString()
    } as ApiResponse);
  }

  /**
   * Too Many Requests (429)
   */
  static tooManyRequests(res: Response, error: string = 'Too many requests'): Response {
    return res.status(429).json({
      success: false,
      error,
      timestamp: new Date().toISOString()
    } as ApiResponse);
  }

  /**
   * Internal Server Error (500)
   */
  static internalError(res: Response, error: string = 'Internal server error'): Response {
    return res.status(500).json({
      success: false,
      error,
      timestamp: new Date().toISOString()
    } as ApiResponse);
  }

  /**
   * Service Unavailable (503)
   */
  static serviceUnavailable(res: Response, error: string = 'Service temporarily unavailable'): Response {
    return res.status(503).json({
      success: false,
      error,
      timestamp: new Date().toISOString()
    } as ApiResponse);
  }

  /**
   * Generic error handler with automatic status code detection
   */
  static error(res: Response, error: Error | string, statusCode?: number): Response {
    const errorMessage = error instanceof Error ? error.message : error;
    const status = statusCode || 500;

    console.error(`API Error [${status}]:`, errorMessage);

    return res.status(status).json({
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString()
    } as ApiResponse);
  }

  /**
   * Validation error helper
   */
  static validationError(res: Response, errors: Record<string, string>): Response {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      validation_errors: errors,
      timestamp: new Date().toISOString()
    } as ApiResponse);
  }

  /**
   * Paginated response
   */
  static paginated<T>(
    res: Response, 
    data: T[], 
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    },
    message?: string
  ): Response {
    return res.status(200).json({
      success: true,
      data,
      pagination,
      message,
      timestamp: new Date().toISOString()
    } as ApiResponse<T[]>);
  }
}

/**
 * Express middleware for handling async route errors
 */
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void | Response>) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Common validation helpers
 */
export class ValidationHelper {
  static validateRequiredFields(body: Record<string, unknown>, requiredFields: string[]): string[] {
    const missingFields: string[] = [];
    
    for (const field of requiredFields) {
      if (!body[field] || (typeof body[field] === 'string' && body[field].trim() === '')) {
        missingFields.push(field);
      }
    }
    
    return missingFields;
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static validateUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
}