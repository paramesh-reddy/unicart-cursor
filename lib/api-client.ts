/**
 * API Client for UniCart
 * Handles API calls for both web (relative paths) and mobile (full URLs)
 */
import { Capacitor, CapacitorHttp } from '@capacitor/core';

const normalizeBaseUrl = (url: string | undefined | null): string => {
  if (!url) return '';
  const trimmed = url.trim().replace(/\/+$/, '');
  if (!trimmed) return '';
  return `${trimmed}/`;
};

export const getApiBaseUrl = (): string => {
  const envUrl = normalizeBaseUrl(process.env.NEXT_PUBLIC_API_URL);

  if (typeof window !== 'undefined') {
    if (Capacitor?.isNativePlatform?.()) {
      // Mobile (Capacitor) - must use absolute URL
      return envUrl || 'https://unicart-cursor5.vercel.app/';
    }

    // Browser - use relative paths to avoid CORS
    return '';
  }

  // Server-side (SSR/ISR) - fall back to env URL if provided
  return envUrl;
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

      const nativeResponse = await CapacitorHttp.request({
        url: fullUrl,
        method,
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
    }

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
