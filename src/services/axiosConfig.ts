import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { logout, refreshToken } from './auth';
import toast from 'react-hot-toast';
import { decryptToken } from './encryption';

// Define API error response type
interface ApiErrorResponse {
  detail?: string;
  message?: string;
}

// Extend axios request config to include custom properties
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  noAuth?: boolean;
}

// Create axios instance with base URL
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 30 * 1000, // 30 seconds
  timeoutErrorMessage: 'Request timed out. Please try again.'
});

// Flag to prevent multiple refresh token requests
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token as string);
    }
  });
  failedQueue = [];
};

// Add request interceptor
axiosInstance.interceptors.request.use(
  (config: ExtendedAxiosRequestConfig) => {
    // Add token to request if available and not marked as noAuth
    const encryptedToken = localStorage.getItem('token');
    if (encryptedToken && !config.noAuth) {
      const token = decryptToken(encryptedToken);
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as ExtendedAxiosRequestConfig;
    
    if (!error.response) {
      // Network error
      toast.error('Network error. Please check your connection.', {
        duration: 5000,
        icon: '📡'
      });
      return Promise.reject(error);
    }

    // Handle specific error status codes
    switch (error.response.status) {
      case 400:
        toast.error(error.response.data?.detail || 'Bad request. Please check your input.', {
          duration: 5000,
          icon: '⚠️'
        });
        break;
      case 401:
        // Only attempt refresh if not already retrying and not a noAuth request
        if (!originalRequest?._retry && !originalRequest?.noAuth) {
          if (isRefreshing) {
            try {
              const token = await new Promise<string>((resolve, reject) => {
                failedQueue.push({ resolve, reject });
              });
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return axiosInstance(originalRequest);
            } catch (err) {
              return Promise.reject(err);
            }
          }

          originalRequest._retry = true;
          isRefreshing = true;

          try {
            const response = await refreshToken();
            const { access_token } = response;
            
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
            
            processQueue(null, access_token);
            return axiosInstance(originalRequest);
          } catch (refreshError) {
            processQueue(refreshError, null);
            
            // If refresh token fails, logout user
            toast.error('Session expired. Please login again.', {
              duration: 5000,
              icon: '🔒'
            });
            
            await logout(false);
            window.location.href = '/login';
            
            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        }
        // Skip showing toast for noAuth requests (like login) as they handle their own errors
        break;
      case 403:
        toast.error('Access denied. You do not have permission for this action.', {
          duration: 5000,
          icon: '🚫'
        });
        break;
      case 404:
        toast.error('Resource not found.', {
          duration: 5000,
          icon: '🔍'
        });
        break;
      case 422:
        toast.error(error.response.data?.detail || 'Validation error. Please check your input.', {
          duration: 5000,
          icon: '⚠️'
        });
        break;
      case 500:
        toast.error('Server error. Please try again later.', {
          duration: 5000,
          icon: '🔧'
        });
        break;
      default:
        toast.error('An unexpected error occurred. Please try again.', {
          duration: 5000,
          icon: '❗'
        });
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance; 