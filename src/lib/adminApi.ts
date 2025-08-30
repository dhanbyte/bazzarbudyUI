'use client';

// Utility function to get the base URL for the API
const getApiBaseUrl = () => {
  return '/api';
};

// Custom fetch wrapper with retry logic and authorization
async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 3, backoff = 300) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, { ...options, headers });
      if (response.status < 500) { // Don't retry on client errors
        return response;
      }
      throw new Error(`Server error: ${response.status}`);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(res => setTimeout(res, backoff * (i + 1)));
    }
  }
  throw new Error('Failed to fetch after multiple retries');
}

// Type definitions
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface Product {
  _id: string;
  id: string;
  slug: string;
  name: string;
  category: string;
  subcategory?: string;
  brand: string;
  price: {
    original: number;
    discounted?: number;
    currency?: string;
  };
  quantity: number;
  description?: string;
  shortDescription?: string;
  images?: string[];
  features?: string[];
  tags?: string[];
  specifications?: Record<string, any>;
  ratings?: {
    average: number;
    count: number;
  };
  codAvailable?: boolean;
  returnPolicy?: {
    eligible?: boolean;
    duration?: number;
  };
  warranty?: string;
}

export type NewProduct = Omit<Product, '_id'>;

export interface Category {
  _id: string;
  name: string;
  subcategories: string[];
}

export interface User {
  _id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  createdAt: string;
  lastLogin?: string;
  orderCount?: number;
  cartItems?: number;
  wishlistItems?: number;
  addressCount?: number;
  isActive: boolean;
}

export interface AdminOrder {
  _id: string;
  orderId: string;
  userName: string;
  userPhone: string;
  orderDate: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    qty: number;
    image: string;
  }>;
  itemCount: number;
  address: {
    fullName: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
  total: number;
  paymentMethod: string;
  status: string;
  paymentId?: string;
}

export const adminApi = {
  /**
   * Fetches all users
   */
  getUsers: async (): Promise<{ success: boolean; users?: User[]; message?: string }> => {
    try {
      const response = await fetchWithRetry(`${getApiBaseUrl()}/admin/users`, {
        headers: {
          'x-admin-key': 'admin123'
        }
      });
      const data = await response.json();
      if (!response.ok) {
        return { success: false, message: data.message || 'Failed to fetch users' };
      }
      return { success: true, users: data.users };
    } catch (error) {
      console.error('Error fetching users:', error);
      return { success: false, message: 'Network error while fetching users' };
    }
  },

  updateUserStatus: async (userId: string, isActive: boolean): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetchWithRetry(
        `${getApiBaseUrl()}/auth/admin/users/${userId}/status`,
        {
          method: 'PUT',
          body: JSON.stringify({ isActive }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        return { success: false, message: data.message || 'Failed to update user status' };
      }
      return { success: true, message: data.message };
    } catch (error) {
      console.error('Error updating user status:', error);
      return { success: false, message: 'Network error while updating user status' };
    }
  },

  /**
   * Fetches new users who have logged in recently (last 24 hours)
   */
  getNewUsers: async (): Promise<ApiResponse<User[]>> => {
    try {
      const response = await fetchWithRetry(`${getApiBaseUrl()}/admin/users/new`, {
        headers: {
          'x-admin-key': 'admin123'
        }
      });
      const data = await response.json();
      if (!response.ok) {
        return { success: false, message: data.message || 'Failed to fetch new users' };
      }
      return { success: true, data: data.data };
    } catch (error) {
      console.error('Error fetching new users:', error);
      return { success: false, message: 'Network error while fetching new users' };
    }
  },

  /**
   * Get admin dashboard stats
   */
  getStats: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await fetchWithRetry(`${getApiBaseUrl()}/admin/stats`, {
        headers: {
          'x-admin-key': 'admin123'
        }
      });
      const data = await response.json();
      if (!response.ok) {
        return { success: false, message: data.message || 'Failed to fetch stats' };
      }
      return { success: true, data: data.stats };
    } catch (error) {
      console.error('Error fetching stats:', error);
      return { success: false, message: 'Network error while fetching stats' };
    }
  },

  /**
   * Toggles the active status of a user
   */
  toggleUserStatus: async (userId: string, isActive: boolean): Promise<ApiResponse> => {
    try {
      const response = await fetchWithRetry(
        `${getApiBaseUrl()}/users/${userId}/status`,
        {
          method: 'PUT',
          body: JSON.stringify({ isActive }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        return { success: false, message: data.message || 'Failed to update user status' };
      }
      return { success: true, message: data.message };
    } catch (error) {
      console.error('Error updating user status:', error);
      return { success: false, message: 'Network error while updating user status' };
    }
  },

  /**
   * Fetches all products
   */
  getProducts: async (): Promise<ApiResponse<Product[]>> => {
    try {
      const response = await fetchWithRetry(`${getApiBaseUrl()}/admin/products`, {
        headers: {
          'x-admin-key': 'admin123'
        }
      });
      const data = await response.json();
      if (!response.ok) {
        return { success: false, message: 'Failed to fetch products', data: [] };
      }
      return { success: true, data: data.products };
    } catch (error) {
      console.error('Error fetching products:', error);
      return { success: false, message: 'Network error while fetching products', data: [] };
    }
  },

  /**
   * Adds a new product
   */
  addProduct: async (productData: Partial<Product>): Promise<ApiResponse<Product>> => {
    try {
      const response = await fetchWithRetry(
        `${getApiBaseUrl()}/admin/products`,
        {
          method: 'POST',
          body: JSON.stringify(productData),
          headers: {
            'x-admin-key': 'admin123'
          }
        }
      );
      const data = await response.json();
      if (!response.ok) {
        return { success: false, message: data.error || 'Failed to add product' };
      }
      return { success: true, message: 'Product added successfully', data };
    } catch (error) {
      console.error('Error adding product:', error);
      return { success: false, message: 'Network error while adding product' };
    }
  },

  /**
   * Updates an existing product
   */
  updateProduct: async (productId: string, productData: Partial<Product>): Promise<ApiResponse<Product>> => {
    try {
      const response = await fetchWithRetry(
        `${getApiBaseUrl()}/admin/products/${productId}`,
        {
          method: 'PUT',
          body: JSON.stringify(productData),
          headers: {
            'x-admin-key': 'admin123'
          }
        }
      );
      const data = await response.json();
      if (!response.ok) {
        return { success: false, message: data.message || 'Failed to update product' };
      }
      return { success: true, message: 'Product updated successfully', data };
    } catch (error) {
      console.error('Error updating product:', error);
      return { success: false, message: 'Network error while updating product' };
    }
  },

  /**
   * Deletes a product
   */
  deleteProduct: async (productId: string): Promise<ApiResponse> => {
    try {
      const response = await fetchWithRetry(
        `${getApiBaseUrl()}/admin/products/${productId}`,
        { 
          method: 'DELETE',
          headers: {
            'x-admin-key': 'admin123'
          }
        }
      );
      if (response.status === 204 || response.ok) {
        return { success: true, message: 'Product deleted successfully' };
      }
      const data = await response.json();
      return { success: false, message: data.message || 'Failed to delete product' };
    } catch (error) {
      console.error('Error deleting product:', error);
      return { success: false, message: 'Network error while deleting product' };
    }
  },

  /**
   * Fetches all orders
   */
  getOrders: async (): Promise<ApiResponse<AdminOrder[]>> => {
    try {
      const response = await fetchWithRetry(`${getApiBaseUrl()}/orders`);
      const data = await response.json();
      if (!response.ok) {
        return { success: false, message: data.message || 'Failed to fetch orders' };
      }
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching orders:', error);
      return { success: false, message: 'Network error while fetching orders' };
    }
  },

  /**
   * Fetches all orders with detailed information for admin panel
   */
  getAllOrders: async (): Promise<{success: boolean, message?: string, allOrders?: AdminOrder[]}> => {
    try {
      const response = await fetchWithRetry(`${getApiBaseUrl()}/admin/orders`, {
        headers: {
          'x-admin-key': 'admin123'
        }
      });
      const data = await response.json();
      if (!response.ok) {
        return { success: false, message: data.message || 'Failed to fetch all orders' };
      }
      return { success: true, allOrders: data.allOrders };
    } catch (error) {
      console.error('Error fetching all orders:', error);
      return { success: false, message: 'Network error while fetching all orders' };
    }
  },

  /**
   * Updates an order's status
   */
  updateOrderStatus: async (orderId: string, status: string): Promise<ApiResponse> => {
    try {
      const response = await fetchWithRetry(
        `${getApiBaseUrl()}/admin/orders/${orderId}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status }),
          headers: {
            'x-admin-key': 'admin123'
          }
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        return { success: false, message: data.message || 'Failed to update order status' };
      }

      return { success: true, message: data.message };
    } catch (error) {
      console.error('Error updating order status:', error);
      return { success: false, message: 'Network error while updating order status' };
    }
  },
  
  /**
   * Fetches detailed information for a specific order
   */
  getOrderDetails: async (orderId: string): Promise<{success: boolean, message?: string, order?: any}> => {
    try {
      const response = await fetchWithRetry(`${getApiBaseUrl()}/orders/details/${orderId}`);
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        return { success: false, message: data.message || 'Failed to fetch order details' };
      }
      
      return { success: true, order: data.order };
    } catch (error) {
      console.error('Error fetching order details:', error);
      return { success: false, message: 'Network error while fetching order details' };
    }
  },

  /**
   * Fetches all categories
   */
  getCategories: async (): Promise<ApiResponse<Category[]>> => {
    try {
      const response = await fetchWithRetry(`${getApiBaseUrl()}/categories`);
      const data = await response.json();
      
      if (!response.ok) {
        return { 
          success: false, 
          message: (data as any).message || 'Failed to fetch categories',
          data: []
        };
      }
      
      return { 
        success: true, 
        data: data
      };
    } catch (error) {
      console.error('Error fetching categories:', error);
      return { 
        success: false, 
        message: 'An unexpected error occurred while fetching categories',
        data: []
      };
    }
  },

  /**
   * Adds a new category
   */
  addCategory: async (name: string): Promise<ApiResponse<Category>> => {
    try {
      const response = await fetchWithRetry(
        `${getApiBaseUrl()}/categories`,
        {
          method: 'POST',
          body: JSON.stringify({ name }),
        }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        return { 
          success: false, 
          message: data.message || 'Failed to add category' 
        };
      }
      
      return { 
        success: true, 
        message: 'Category added successfully',
        data
      };
    } catch (error) {
      console.error('Error adding category:', error);
      return { 
        success: false, 
        message: 'Network error while adding category' 
      };
    }
  },

  /**
   * Adds a new subcategory to an existing category
   */
  addSubcategory: async (categoryId: string, name: string): Promise<ApiResponse<Category>> => {
    try {
      const response = await fetchWithRetry(
        `${getApiBaseUrl()}/categories/${categoryId}/subcategories`,
        {
          method: 'POST',
          body: JSON.stringify({ name }),
        }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        return { 
          success: false, 
          message: data.message || 'Failed to add subcategory' 
        };
      }
      
      return { 
        success: true, 
        message: 'Subcategory added successfully',
        data
      };
    } catch (error) {
      console.error('Error adding subcategory:', error);
      return { 
        success: false, 
        message: 'Network error while adding subcategory' 
      };
    }
  },
};
