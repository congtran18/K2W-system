/**
 * K2W API Client
 * Centralized API client for all backend communications
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth tokens
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - clear auth token
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// API Response interface
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

// Generic API request function
export const apiRequest = async <T = unknown>(
  config: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    const response = await apiClient(config);
    return response.data;
  } catch (error: unknown) {
    console.error('API Request Error:', error);
    
    // Type guard for axios error
    const isAxiosError = (err: unknown): err is { response?: { data?: { error?: string; message?: string } }; message?: string } => {
      return typeof err === 'object' && err !== null;
    };
    
    // Return standardized error response
    return {
      success: false,
      error: isAxiosError(error) 
        ? (error.response?.data?.error || error.message || 'Unknown error occurred')
        : 'Unknown error occurred',
      message: isAxiosError(error) 
        ? (error.response?.data?.message || 'Request failed')
        : 'Request failed',
    };
  }
};

export default apiClient;