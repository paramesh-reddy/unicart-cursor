/**
 * API Client for UniCart
 * Handles API calls for both web (relative paths) and mobile (full URLs)
 */

const normalizeBaseUrl = (url: string | undefined | null): string => {
  if (!url) return '';
  const trimmed = url.trim().replace(/\/+$/, '');
  if (!trimmed) return '';
  return `${trimmed}/`;
};

export const getApiBaseUrl = (): string => {
  const envUrl = normalizeBaseUrl(process.env.NEXT_PUBLIC_API_URL);

  if (typeof window !== 'undefined') {
    const capacitor = (window as any).Capacitor;
    if (capacitor && typeof capacitor.isNativePlatform === 'function' && capacitor.isNativePlatform()) {
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
