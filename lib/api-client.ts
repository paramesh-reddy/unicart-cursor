/**
 * API Client for UniCart
 * Handles API calls for both web (relative paths) and mobile (full URLs)
 */
import { Capacitor } from '@capacitor/core';
import { Http } from '@capacitor-community/http';

const normalizeBaseUrl = (url: string | undefined | null): string => {
  if (!url) return '';
  const trimmed = url.trim().replace(/\/+$/, '');
  if (!trimmed) return '';
  return `${trimmed}/`;
};

export const getApiBaseUrl = (): string => {
  const envUrl = normalizeBaseUrl(process.env.NEXT_PUBLIC_API_URL);
  const defaultBackendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

  if (typeof window !== 'undefined') {
    if (Capacitor?.isNativePlatform?.()) {
      // Mobile (Capacitor) - must use absolute URL
      return envUrl || defaultBackendUrl + '/';
    }

    // Browser - use backend URL from env or default
    return envUrl || defaultBackendUrl + '/';
  }

  // Server-side (SSR/ISR) - fall back to env URL if provided
  return envUrl || defaultBackendUrl + '/';
};

export const apiClient = {
  /**
   * Base fetch method with automatic URL handling
   */
  fetch: async (url: string, options?: RequestInit): Promise<Response> => {
    const baseUrl = getApiBaseUrl();
    const fullUrl = url.startsWith('/') ? `${baseUrl}${url}` : url;
    
    // Get auth token for authenticated requests
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('auth_token') 
      : null;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options?.headers as Record<string, string> || {}),
    };
    
    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const isNative = typeof window !== 'undefined' && Capacitor?.isNativePlatform?.();

    if (isNative) {
      const method = (options?.method || 'GET').toUpperCase();
      let data: any = undefined;

      if (options?.body) {
        try {
          data = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
        } catch {
          data = options.body;
        }
      }

      try {
        const nativeResponse = await Http.request({
          url: fullUrl,
          method: method as any,
          headers,
          data,
        });

        const ok = nativeResponse.status >= 200 && nativeResponse.status < 300;

        if (!ok) {
          const errorData = nativeResponse.data;
          const message =
            (typeof errorData === 'object' && errorData !== null && 'error' in errorData)
              ? (errorData as { error?: string }).error
              : undefined;
          throw new Error(message || `HTTP ${nativeResponse.status}`);
        }

        const responseLike = {
          ok: true,
          status: nativeResponse.status,
          statusText: nativeResponse.headers?.['Status'] || 'OK',
          json: async () => nativeResponse.data,
          text: async () =>
            typeof nativeResponse.data === 'string'
              ? nativeResponse.data
              : JSON.stringify(nativeResponse.data),
        } as unknown as Response;

        return responseLike;
      } catch (error: any) {
        // Handle network errors, connection failures, etc.
        if (error.message) {
          // If it's already a formatted error, re-throw it
          throw error;
        }
        // Handle Capacitor HTTP plugin errors
        if (error.error) {
          throw new Error(error.error || 'Network request failed');
        }
        // Generic network error
        throw new Error(error.toString() || 'Failed to connect to server. Please check your internet connection.');
      }
    }

    try {
      const response = await fetch(fullUrl, {
        ...options,
        headers,
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ 
          error: `HTTP ${response.status}: ${response.statusText}` 
        }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }
      
      return response;
    } catch (error: any) {
      // Handle network errors (CORS, connection refused, etc.)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Failed to connect to server. Please check your internet connection and try again.');
      }
      // Re-throw if it's already a formatted error
      if (error.message) {
        throw error;
      }
      // Generic error
      throw new Error(error.toString() || 'Network request failed');
    }
  },
  
  /**
   * GET request
   */
  get: async <T = any>(url: string): Promise<T> => {
    const response = await apiClient.fetch(url, { method: 'GET' });
    return response.json();
  },
  
  /**
   * POST request
   */
  post: async <T = any>(url: string, data?: any): Promise<T> => {
    const response = await apiClient.fetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  /**
   * PUT request
   */
  put: async <T = any>(url: string, data?: any): Promise<T> => {
    const response = await apiClient.fetch(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  /**
   * DELETE request
   */
  delete: async <T = any>(url: string): Promise<T> => {
    const response = await apiClient.fetch(url, { method: 'DELETE' });
    return response.json();
  },
};
