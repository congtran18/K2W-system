/**
 * Common types for K2W API
 */

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface FilterOptions {
  [key: string]: any;
  project_id?: string;
  status?: string;
  userId?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}