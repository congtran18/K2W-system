/**
 * Common API Types
 * Shared type definitions across the application
 */

// Base API Response
export interface ApiResponse<T = unknown> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
  offset?: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Loading States
export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

// Form States
export interface FormState<T> extends LoadingState {
  data: T;
  isDirty: boolean;
  isValid: boolean;
}

// Filter and Sort
export interface FilterParams {
  [key: string]: string | number | boolean | string[] | undefined;
}

export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

// Date Range
export interface DateRange {
  start: string;
  end: string;
}

// File Upload
export interface FileUploadResult {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}