<<<<<<< HEAD
import type { Product } from './types';

// Use Next.js API routes as middleware
const BASE_URL = '/api';

// Debug logging
if (typeof window !== 'undefined') {
  console.log('API Base URL:', BASE_URL);
}

// Enhanced fetch with better error handling for mobile/tablet devices
const fetchWithRetry = async (url: string, options: RequestInit = {}, retries = 5): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout for slow mobile connections
  
  // Add authorization token from localStorage if available
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token && !options.headers) {
      options.headers = {
        'Authorization': `Bearer ${token}`
      };
    } else if (token && options.headers && !(options.headers as any)['Authorization']) {
      (options.headers as any)['Authorization'] = `Bearer ${token}`;
    }
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      credentials: 'include', // Include cookies for HttpOnly token
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    clearTimeout(timeoutId);
    
    // Handle token expiration
    if (response.status === 401 && typeof window !== 'undefined') {
      // Try to refresh token
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const refreshResponse = await fetch(`${BASE_URL}/auth/refresh-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
            credentials: 'include'
          });
          
          if (refreshResponse.ok) {
            const tokenData = await refreshResponse.json();
            localStorage.setItem('accessToken', tokenData.accessToken);
            
            // Retry original request with new token
            options.headers = {
              ...options.headers,
              'Authorization': `Bearer ${tokenData.accessToken}`
            };
            
            return fetchWithRetry(url, options, retries);
          } else {
            // Refresh failed, clear tokens and redirect to login
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            if (typeof window !== 'undefined' && !url.includes('/auth/login')) {
              window.location.href = '/login';
            }
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
        }
      }
    }
    
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (retries > 0 && (error instanceof Error && error.name !== 'AbortError')) {
      console.log(`Retrying API call to ${url}... attempts left: ${retries}`);
      // Exponential backoff: wait longer with each retry
      const waitTime = 1000 * Math.pow(2, 5 - retries); // Increased backoff factor
      await new Promise(resolve => setTimeout(resolve, waitTime)); 
      return fetchWithRetry(url, options, retries - 1);
    }
    console.error(`API call failed after retries: ${url}`, error);
    throw error;
  }
};

// Export individual functions for easier imports
export const login = async (phoneNumber: string, name?: string): Promise<{ success: boolean; user?: any; tokens?: any; message: string }> => {
  try {
    const response = await fetchWithRetry(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, name }),
      credentials: 'include'
    });
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server returned non-JSON response');
    }
    
    const data = await response.json();
    
    // Store user phone in localStorage for persistent login
    if (data.success && data.user) {
      localStorage.setItem('userPhone', phoneNumber);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('loginTimestamp', Date.now().toString());
    }
    
    return data;
  } catch (error) {
    console.error('Error during login:', error);
    return { success: false, message: 'Network error. Please try again.' };
  }
};

export const getUserProfile = async (phoneNumber: string): Promise<{ success: boolean; user?: any; message: string }> => {
  try {
    const response = await fetchWithRetry(`${BASE_URL}/auth/profile/${phoneNumber}`, {
      credentials: 'include'
    });
    
    if (response.status === 401) {
      return { success: false, message: 'Authentication required' };
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return { success: false, message: 'Network error. Please try again.' };
  }
};

export const updateUserProfile = async (phoneNumber: string, name: string): Promise<{ success: boolean; user?: any; message: string }> => {
  try {
    const response = await fetchWithRetry(`${BASE_URL}/auth/profile/${phoneNumber}`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating profile:', error);
    return { success: false, message: 'Network error. Please try again.' };
  }
};

export const logout = async (): Promise<{ success: boolean; message: string }> => {
  try {
    // Clear all login data from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('tokenExpiry');
      localStorage.removeItem('userPhone');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('loginTimestamp');
    }
    
    return { success: true, message: 'Logged out successfully' };
  } catch (error) {
    console.error('Error during logout:', error);
    return { success: true, message: 'Logged out locally' };
  }
};

export const refreshToken = async (): Promise<{ success: boolean; tokens?: any; message: string }> => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      return { success: false, message: 'No refresh token available' };
    }
    
    const response = await fetchWithRetry(`${BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
      credentials: 'include'
    });
    
    const data = await response.json();
    
    if (data.success && data.tokens) {
      localStorage.setItem('accessToken', data.tokens.accessToken);
      localStorage.setItem('tokenExpiry', data.tokens.tokenExpiry);
    }
    
    return data;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return { success: false, message: 'Failed to refresh token' };
  }
};

export const api = {
  // Get all products
  getAllProducts: async (category?: string): Promise<Product[]> => {
    try {
      const url = new URL(`${BASE_URL}/products`);
      if (category) {
        url.searchParams.append('category', category);
      }
      
      console.log(`Fetching products from: ${url.toString()}`);
      const response = await fetchWithRetry(url.toString());
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'No error details');
        console.error(`Failed to fetch products: HTTP ${response.status}`, errorText);
        throw new Error(`HTTP ${response.status}: Failed to fetch products`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Non-JSON response received:', contentType);
        throw new Error('Server returned non-JSON response');
      }
      
      const data = await response.json();
      console.log('🔍 API Response received:', data);
      
      // Handle Next.js API response format
      if (data.success && Array.isArray(data.data)) {
        console.log(`Successfully fetched ${data.data.length} products`);
        return data.data;
      }
      
      // Fallback for old format
      if (Array.isArray(data)) {
        console.log(`Successfully fetched ${data.length} products (legacy format)`);
        return data;
      }
      
      console.warn('Products API did not return expected format, got:', typeof data);
      return [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  },

  // Get single product by ID
  getProductById: async (id: string): Promise<Product | null> => {
    try {
      const url = `${BASE_URL}/products/${id}`;
      console.log(`Fetching product details from: ${url}`);
      
      const response = await fetchWithRetry(url);
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'No error details');
        console.error(`Failed to fetch product: HTTP ${response.status}`, errorText);
        return null;
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Non-JSON response received:', contentType);
        return null;
      }
      
      const data = await response.json();
      
      // Handle new API response format with success field
      if (data.success && data.data) {
        console.log(`Successfully fetched product: ${id}`);
        return data.data;
      }
      
      // Fallback for old format
      if (data && !data.success) {
        console.log(`Successfully fetched product: ${id} (legacy format)`);
        return data;
      }
      
      console.log(`Successfully fetched product: ${id}`);
      return data;
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      return null;
    }
  },

  // Search products
  searchProducts: async (query: string): Promise<Product[]> => {
    try {
      const url = new URL(`${BASE_URL}/products`);
      url.searchParams.append('q', query);
      const response = await fetchWithRetry(url.toString());
      if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to search products`);
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }
      
      const data = await response.json();
      
      // Handle Next.js API response format
      if (data.success && Array.isArray(data.data)) {
        return data.data;
      }
      
      // Fallback for old format
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  },

  // Get products by category
  getProductsByCategory: async (category: string): Promise<Product[]> => {
    try {
      return await api.getAllProducts(category);
    } catch (error) {
      console.error('Error fetching products by category:', error);
      return [];
    }
  },

  // Add new product
  addProduct: async (product: Product): Promise<boolean> => {
    try {
      const response = await fetchWithRetry(`${BASE_URL}/products`, {
        method: 'POST',
        body: JSON.stringify(product),
      });
      return response.ok;
    } catch (error) {
      console.error('Error adding product:', error);
      return false;
    }
  },

  // Update product
  updateProduct: async (id: string, product: Partial<Product>): Promise<boolean> => {
    try {
      const response = await fetchWithRetry(`${BASE_URL}/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(product),
      });
      return response.ok;
    } catch (error) {
      console.error('Error updating product:', error);
      return false;
    }
  },

  // Delete product
  deleteProduct: async (id: string): Promise<boolean> => {
    try {
      const response = await fetchWithRetry(`${BASE_URL}/products/${id}`, {
        method: 'DELETE',
      });
      return response.ok;
    } catch (error) {
      console.error('Error deleting product:', error);
      return false;
    }
  },

  // Authentication APIs
  login: async (phoneNumber: string, name?: string): Promise<{ success: boolean; user?: any; tokens?: any; message: string }> => {
    try {
      const response = await fetchWithRetry(`${BASE_URL}/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ phoneNumber, name }),
        credentials: 'include' // For HttpOnly cookies
      });
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }
      
      const data = await response.json();
      
      // Store user phone in localStorage for persistent login
      if (data.success && data.user) {
        localStorage.setItem('userPhone', phoneNumber);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('loginTimestamp', Date.now().toString());
      }
      
      return data;
    } catch (error) {
      console.error('Error during login:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  getUserProfile: async (phoneNumber: string): Promise<{ success: boolean; user?: any; message: string }> => {
    try {
      const response = await fetchWithRetry(`${BASE_URL}/auth/profile/${phoneNumber}`, {
        credentials: 'include' // For HttpOnly cookies
      });
      
      // Handle unauthorized access
      if (response.status === 401) {
        // Token handling is done in fetchWithRetry
        return { success: false, message: 'Authentication required' };
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  updateUserProfile: async (phoneNumber: string, name: string): Promise<{ success: boolean; user?: any; message: string }> => {
    try {
      const response = await fetchWithRetry(`${BASE_URL}/auth/profile/${phoneNumber}`, {
        method: 'PUT',
        body: JSON.stringify({ name }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  // Check if phone number exists in database
  checkPhoneExists: async (phoneNumber: string): Promise<{ exists: boolean; user?: any }> => {
    try {
      const response = await fetchWithRetry(`${BASE_URL}/auth/profile/${phoneNumber}`);
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          return { exists: false };
        }
        const data = await response.json();
        return { exists: data.success, user: data.user };
      }
      return { exists: false };
    } catch (error) {
      console.error('Error checking phone:', error);
      return { exists: false };
    }
  },
  
  // Refresh token
  refreshToken: async (): Promise<{ success: boolean; tokens?: any; message: string }> => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        return { success: false, message: 'No refresh token available' };
      }

      const response = await fetch(`${BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        return { success: false, message: 'Token refresh failed' };
      }
      
      const data = await response.json();
      
      // Update tokens in localStorage
      if (data.success && data.tokens) {
        localStorage.setItem('accessToken', data.tokens.accessToken);
        localStorage.setItem('refreshToken', data.tokens.refreshToken);
        localStorage.setItem('tokenExpiry', data.tokens.tokenExpiry);
      }
      
      return data;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return { success: false, message: 'Network error during token refresh' };
    }
  },
  
  // Logout user
  logout: async (): Promise<{ success: boolean; message: string }> => {
    try {
      // Clear all login data from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('tokenExpiry');
        localStorage.removeItem('userPhone');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('loginTimestamp');
      }
      
      return { success: true, message: 'Logged out successfully' };
    } catch (error) {
      console.error('Error during logout:', error);
      return { success: true, message: 'Logged out locally' };
    }
  },
  

  // Cart management APIs
  updateCart: async (phoneNumber: string, productId: string, qty: number): Promise<{ success: boolean; cart?: any[] }> => {
    try {
      const response = await fetchWithRetry(`${BASE_URL}/auth/cart/${phoneNumber}`, {
        method: 'POST',
        body: JSON.stringify({ productId, qty }),
      });
      
      // Check if response is ok first
      if (!response.ok) {
        console.warn('Cart update API response not ok:', response.status, response.statusText);
        // Return success for local operation even if backend fails
        return { success: true };
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('Non-JSON response received from cart update:', contentType);
        // Return success for local operation even if backend fails
        return { success: true };
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.warn('Error updating cart API, continuing with local operation:', error);
      return { success: true };
    }
  },

  removeFromCart: async (phoneNumber: string, productId: string): Promise<{ success: boolean; cart?: any[] }> => {
    try {
      const response = await fetchWithRetry(`${BASE_URL}/auth/cart/${phoneNumber}/${productId}`, {
        method: 'DELETE',
      });
      
      // Check if response is ok first
      if (!response.ok) {
        console.warn('Cart remove API response not ok:', response.status, response.statusText);
        // Return success for local operation even if backend fails
        return { success: true };
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('Non-JSON response received from cart remove:', contentType);
        // Return success for local operation even if backend fails
        return { success: true };
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.warn('Error removing from cart API, continuing with local operation:', error);
      return { success: true };
    }
  },

  // Wishlist management APIs
  addToWishlist: async (phoneNumber: string, productId: string): Promise<{ success: boolean; wishlist?: any[] }> => {
    try {
      const response = await fetchWithRetry(`${BASE_URL}/auth/wishlist/${phoneNumber}`, {
        method: 'POST',
        body: JSON.stringify({ productId }),
      });
      
      if (!response.ok) {
        console.warn('Wishlist add API response not ok:', response.status, response.statusText);
        return { success: true };
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('Non-JSON response received from wishlist add:', contentType);
        return { success: true };
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.warn('Error adding to wishlist API, continuing with local operation:', error);
      return { success: true };
    }
  },

  removeFromWishlist: async (phoneNumber: string, productId: string): Promise<{ success: boolean; wishlist?: any[] }> => {
    try {
      const response = await fetchWithRetry(`${BASE_URL}/auth/wishlist/${phoneNumber}/${productId}`, {
        method: 'DELETE',
      });
      
      // Check if response is ok first
      if (!response.ok) {
        console.warn('Wishlist remove API response not ok:', response.status, response.statusText);
        return { success: true };
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('Non-JSON response received from wishlist remove:', contentType);
        return { success: true };
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.warn('Error removing from wishlist API, continuing with local operation:', error);
      return { success: true };
    }
  },

  // Address management APIs
  getAddresses: async (phoneNumber: string): Promise<{ success: boolean; addresses?: any[] }> => {
    try {
      const response = await fetchWithRetry(`${BASE_URL}/auth/addresses/${phoneNumber}`);
      if (!response.ok) {
        console.error('Get addresses API error:', response.status, response.statusText);
        return { success: false, addresses: [] };
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching addresses:', error);
      return { success: false, addresses: [] };
    }
  },

  addAddress: async (phoneNumber: string, addressData: any): Promise<{ success: boolean; addresses?: any[] }> => {
    try {
      // Clean the address data before sending
      const cleanAddressData = {
        fullName: addressData.fullName?.trim(),
        phone: addressData.phone?.trim(),
        line1: addressData.line1?.trim(),
        line2: addressData.line2?.trim() || '',
        city: addressData.city?.trim(),
        state: addressData.state?.trim(),
        pincode: addressData.pincode?.trim(),
        landmark: addressData.landmark?.trim() || '',
        default: addressData.default || false
      };

      console.log('Sending address data:', cleanAddressData);

      const response = await fetchWithRetry(`${BASE_URL}/auth/addresses/${phoneNumber}`, {
        method: 'POST',
        body: JSON.stringify(cleanAddressData),
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Add address API error:', response.status, response.statusText, errorData);
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Add address success:', result);
      return result;
    } catch (error) {
      console.error('Error adding address:', error);
      return { success: false };
    }
  },

  updateAddress: async (phoneNumber: string, addressId: string, addressData: any): Promise<{ success: boolean; addresses?: any[] }> => {
    try {
      const response = await fetchWithRetry(`${BASE_URL}/auth/addresses/${phoneNumber}/${addressId}`, {
        method: 'PUT',
        body: JSON.stringify(addressData),
      });
      if (!response.ok) {
        console.error('Update address API error:', response.status, response.statusText);
        return { success: false };
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating address:', error);
      return { success: false };
    }
  },

  deleteAddress: async (phoneNumber: string, addressId: string): Promise<{ success: boolean; addresses?: any[] }> => {
    try {
      const response = await fetchWithRetry(`${BASE_URL}/auth/addresses/${phoneNumber}/${addressId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        console.error('Delete address API error:', response.status, response.statusText);
        return { success: false };
      }
      return await response.json();
    } catch (error) {
      console.error('Error deleting address:', error);
      return { success: false };
    }
  },

  setDefaultAddress: async (phoneNumber: string, addressId: string): Promise<{ success: boolean; addresses?: any[] }> => {
    try {
      const response = await fetchWithRetry(`${BASE_URL}/auth/addresses/${phoneNumber}/${addressId}/default`, {
        method: 'PATCH',
      });
      if (!response.ok) {
        console.error('Set default address API error:', response.status, response.statusText);
        return { success: false };
      }
      return await response.json();
    } catch (error) {
      console.error('Error setting default address:', error);
      return { success: false };
    }
  },

  // Order management APIs
  createOrder: async (phoneNumber: string, items: any[], total: number, deliveryAddress: string): Promise<{ success: boolean; order?: any; orders?: any[] }> => {
    try {
      const response = await fetchWithRetry(`${BASE_URL}/auth/orders/${phoneNumber}`, {
        method: 'POST',
        body: JSON.stringify({ items, total, deliveryAddress }),
      });
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating order:', error);
      return { success: false };
    }
  },

  getUserOrders: async (phoneNumber: string): Promise<{ success: boolean; orders?: any[] }> => {
    try {
      const response = await fetchWithRetry(`${BASE_URL}/auth/orders/${phoneNumber}`);
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      return { success: false };
    }
  }
};
=======
/**
 * API client for Buddy Bazaar e-commerce platform
 * Handles all API requests to the backend server
 */

import { API_BASE_URL, ENDPOINTS, getApiUrl, replacePathParams } from './api-endpoints';

// HTTP method types
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

// Default admin credentials
const DEFAULT_ADMIN = {
  username: 'admin',
  password: 'admin123'
};

/**
 * Generic API fetch function for making HTTP requests
 */
export async function apiFetch<T>(
  path: string,
  options: {
    method?: HttpMethod;
    body?: any;
    adminPassword?: string;
    bearerToken?: string;
  } = {}
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (options.adminPassword) headers['x-admin-key'] = options.adminPassword;
  if (options.bearerToken) headers['Authorization'] = `Bearer ${options.bearerToken}`;

  const res = await fetch(`${path.startsWith('http') ? '' : API_BASE_URL}${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json();
}

// Product API
export const ProductAPI = {
  /**
   * Get all products with optional filtering
   */
  getProducts: async (filters?: { 
    category?: string; 
    brand?: string; 
    minPrice?: number; 
    maxPrice?: number; 
    q?: string;
    page?: number;
    limit?: number;
  }) => {
    let queryString = '';
    if (filters) {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });
      queryString = `?${params.toString()}`;
    }
    return apiFetch(`${getApiUrl(ENDPOINTS.PRODUCTS)}${queryString}`);
  },

  /**
   * Get a single product by ID
   */
  getProductById: async (id: string) => {
    const endpoint = replacePathParams(ENDPOINTS.PRODUCT_DETAIL, { id });
    return apiFetch(getApiUrl(endpoint));
  },

  /**
   * Get multiple products by their IDs
   */
  getProductsByIds: async (ids: string[]) => {
    return apiFetch(getApiUrl(ENDPOINTS.PRODUCTS + '/by-ids'), {
      method: 'POST',
      body: { ids }
    });
  },

  /**
   * Create a new product (admin only)
   */
  createProduct: async (productData: any, adminPassword: string) => {
    return apiFetch(getApiUrl(ENDPOINTS.PRODUCTS), {
      method: 'POST',
      body: productData,
      adminPassword
    });
  },

  /**
   * Update an existing product (admin only)
   */
  updateProduct: async (id: string, productData: any, adminPassword: string) => {
    const endpoint = replacePathParams(ENDPOINTS.PRODUCT_DETAIL, { id });
    return apiFetch(getApiUrl(endpoint), {
      method: 'PUT',
      body: productData,
      adminPassword
    });
  },

  /**
   * Delete a product (admin only)
   */
  deleteProduct: async (id: string, adminPassword: string) => {
    const endpoint = replacePathParams(ENDPOINTS.PRODUCT_DETAIL, { id });
    return apiFetch(getApiUrl(endpoint), {
      method: 'DELETE',
      adminPassword
    });
  },

  /**
   * Get all products (admin only)
   */
  getAllProducts: async (adminPassword: string) => {
    return apiFetch(getApiUrl('/admin/products'), {
      adminPassword
    });
  }
};

// User API
export const UserAPI = {
  /**
   * Get current user profile
   */
  getProfile: async (token: string) => {
    return apiFetch(getApiUrl(ENDPOINTS.USER_PROFILE), {
      bearerToken: token
    });
  },

  /**
   * Add a new shipping address
   */
  addAddress: async (addressData: any, token: string) => {
    return apiFetch(getApiUrl(ENDPOINTS.USER_PROFILE + '/address'), {
      method: 'POST',
      body: addressData,
      bearerToken: token
    });
  },

  /**
   * Get user's wishlist
   */
  getWishlist: async (token: string) => {
    return apiFetch(getApiUrl(ENDPOINTS.USER_PROFILE + '/wishlist'), {
      bearerToken: token
    });
  },

  /**
   * Add product to wishlist
   */
  addToWishlist: async (productId: string, token: string) => {
    return apiFetch(getApiUrl(ENDPOINTS.USER_PROFILE + '/wishlist'), {
      method: 'POST',
      body: { productId },
      bearerToken: token
    });
  },

  /**
   * Remove product from wishlist
   */
  removeFromWishlist: async (productId: string, token: string) => {
    return apiFetch(getApiUrl(ENDPOINTS.USER_PROFILE + '/wishlist/' + productId), {
      method: 'DELETE',
      bearerToken: token
    });
  },

  /**
   * Get all users (admin only)
   */
  getAllUsers: async (adminPassword: string) => {
    return apiFetch(getApiUrl(ENDPOINTS.USERS), {
      adminPassword
    });
  },

  /**
   * Update user status (admin only)
   */
  updateUserStatus: async (userId: string, status: string, adminPassword: string) => {
    const endpoint = replacePathParams(ENDPOINTS.USER_DETAIL, { id: userId });
    return apiFetch(getApiUrl(endpoint + '/status'), {
      method: 'PUT',
      body: { status },
      adminPassword
    });
  }
};

// Order API
export const OrderAPI = {
  /**
   * Place a new order
   */
  placeOrder: async (orderData: {
    items: Array<{product: string, quantity: number}>;
    addressIndex: number;
    paymentMethod: string;
  }, token: string) => {
    return apiFetch(getApiUrl(ENDPOINTS.PLACE_ORDER), {
      method: 'POST',
      body: orderData,
      bearerToken: token
    });
  },

  /**
   * Get user's orders or all orders for admin
   */
  getOrders: async (token: string) => {
    return apiFetch(getApiUrl(ENDPOINTS.USER_ORDERS), {
      bearerToken: token
    });
  },

  /**
   * Get a specific order by ID
   */
  getOrderById: async (orderId: string, token: string) => {
    const endpoint = replacePathParams(ENDPOINTS.ORDER_DETAIL, { id: orderId });
    return apiFetch(getApiUrl(endpoint), {
      bearerToken: token
    });
  },

  /**
   * Update order status (admin only)
   */
  updateOrderStatus: async (orderId: string, status: string, adminPassword: string) => {
    const endpoint = replacePathParams(ENDPOINTS.ORDER_STATUS, { id: orderId });
    return apiFetch(getApiUrl(endpoint), {
      method: 'PUT',
      body: { status },
      adminPassword
    });
  },

  /**
   * Get all orders (admin only)
   */
  getAllOrders: async (adminPassword: string) => {
    return apiFetch(getApiUrl(ENDPOINTS.ORDERS_ALL), {
      adminPassword
    });
  }
};

// Admin API
export const AdminAPI = {
  /**
   * Get dashboard statistics
   */
  getDashboardStats: async (adminPassword: string) => {
    return apiFetch(getApiUrl(ENDPOINTS.ADMIN_DASHBOARD), {
      adminPassword
    });
  },

  /**
   * Login as admin
   */
  login: async (credentials: {username: string, password: string}) => {
    // For demo purposes, check against default credentials
    if (credentials.username === DEFAULT_ADMIN.username && 
        credentials.password === DEFAULT_ADMIN.password) {
      return { success: true, adminKey: DEFAULT_ADMIN.password };
    }
    
    // If not using default credentials, try the API
    try {
      return apiFetch(getApiUrl(ENDPOINTS.ADMIN_LOGIN), {
        method: 'POST',
        body: credentials
      });
    } catch (error) {
      throw new Error('Invalid admin credentials');
    }
  }
};

// Search API
export const SearchAPI = {
  /**
   * Search for products with query string
   */
  searchProducts: async (query: string | object) => {
    // If query is a string, use it as a search term
    if (typeof query === 'string') {
      return apiFetch(getApiUrl(`${ENDPOINTS.SEARCH}?q=${query}`));
    }
    
    // If query is an object, convert it to query parameters
    const params = new URLSearchParams();
    const queryObj = query as Record<string, string>;
    
    Object.keys(queryObj).forEach(key => {
      if (queryObj[key]) {
        params.append(key, queryObj[key]);
      }
    });
    
    return apiFetch(getApiUrl(`${ENDPOINTS.SEARCH}?${params.toString()}`));
  }
};

// Review API
export const ReviewAPI = {
  /**
   * Get reviews for a product
   */
  getProductReviews: async (productId: string) => {
    const endpoint = replacePathParams(ENDPOINTS.PRODUCT_REVIEWS, { id: productId });
    return apiFetch(getApiUrl(endpoint));
  },

  /**
   * Add a review for a product
   */
  addReview: async (productId: string, reviewData: {rating: number, comment: string}, token: string) => {
    return apiFetch(getApiUrl(ENDPOINTS.ADD_REVIEW), {
      method: 'POST',
      body: { productId, ...reviewData },
      bearerToken: token
    });
  }
};

// Checkout API
export const CheckoutAPI = {
  /**
   * Calculate checkout total
   */
  calculateTotal: async (items: Array<{productId: string, quantity: number}>, couponCode?: string) => {
    return apiFetch(getApiUrl(ENDPOINTS.CHECKOUT_CALCULATE), {
      method: 'POST',
      body: { items, couponCode }
    });
  },

  /**
   * Validate coupon code
   */
  validateCoupon: async (couponCode: string) => {
    return apiFetch(getApiUrl(ENDPOINTS.VALIDATE_COUPON), {
      method: 'POST',
      body: { code: couponCode }
    });
  }
};

// Auth API
export const AuthAPI = {
  /**
   * Login user
   */
  login: async (credentials: {email: string, password: string}) => {
    return apiFetch(getApiUrl(ENDPOINTS.AUTH_LOGIN), {
      method: 'POST',
      body: credentials
    });
  },

  /**
   * Register user
   */
  register: async (userData: {name: string, email: string, password: string}) => {
    return apiFetch(getApiUrl(ENDPOINTS.AUTH_REGISTER), {
      method: 'POST',
      body: userData
    });
  }
};


>>>>>>> a52e61c6daf1dd14d101128805613104207d3505
