import { Product, User, Order, AdminStats, Review } from '../types';

const API_BASE = '/api';

export class ApiError extends Error {
  status: number;
  data: any;
  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

function getAuthToken(): string | null {
  try {
    return localStorage.getItem('bgy_token');
  } catch {
    return null;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'bypass-tunnel-reminder': 'true',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (networkError: any) {
    console.warn(`Network error requesting ${endpoint}:`, networkError);
    throw new ApiError(networkError?.message || 'Network connection failed', 0);
  }

  // Handle 401 Unauthorized globally: clear stale credentials & notify state
  if (res.status === 401) {
    try {
      localStorage.removeItem('bgy_token');
    } catch {
      // ignore
    }
    window.dispatchEvent(new CustomEvent('bgy:unauthorized', { detail: { endpoint } }));

    // For profile check (/auth/me), return null user instead of throwing fatal error
    if (endpoint === '/auth/me') {
      return { user: null } as unknown as T;
    }

    let errorData: any = {};
    try {
      errorData = await res.json();
    } catch {
      errorData = { error: 'Authentication required or session expired' };
    }
    throw new ApiError(errorData.error || 'Authentication required', 401, errorData);
  }

  let data: any;
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await res.json();
    } catch (parseErr) {
      throw new ApiError('Invalid response format received from server', res.status);
    }
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    const errorMsg = (typeof data === 'object' && data?.error) ? data.error : `Request failed with status ${res.status}`;
    throw new ApiError(errorMsg, res.status, data);
  }

  return data as T;
}

export const api = {
  // --- Auth ---
  async login(credentials: { email: string; password: string }): Promise<{ user: User; token: string }> {
    return request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  async register(userInfo: { name: string; email: string; password: string; phone?: string }): Promise<{ user: User; token: string }> {
    return request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userInfo),
    });
  },

  async getMe(): Promise<{ user: User | null }> {
    return request<{ user: User | null }>('/auth/me');
  },

  async updateProfile(updates: Partial<User>): Promise<{ user: User }> {
    return request<{ user: User }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // --- Products ---
  async getProducts(params: Record<string, string | number | boolean> = {}): Promise<{ total: number; products: Product[] }> {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '' && value !== null) {
        query.append(key, String(value));
      }
    }
    const qs = query.toString();
    return request<{ total: number; products: Product[] }>(`/products${qs ? `?${qs}` : ''}`);
  },

  async getProductById(id: string): Promise<Product> {
    return request<Product>(`/products/${id}`);
  },

  async submitReview(productId: string, review: { rating: number; title: string; comment: string }): Promise<Product> {
    return request<Product>(`/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(review),
    });
  },

  // --- Wishlist ---
  async getWishlist(): Promise<{ ids: string[]; products: Product[] }> {
    return request<{ ids: string[]; products: Product[] }>('/wishlist');
  },

  async toggleWishlist(productId: string): Promise<{ ids: string[]; isSaved: boolean }> {
    return request<{ ids: string[]; isSaved: boolean }>('/wishlist/toggle', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  },

  // --- Orders ---
  async createOrder(orderData: any): Promise<Order> {
    return request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  async getMyOrders(): Promise<Order[]> {
    return request<Order[]>('/orders/my-orders');
  },

  async getOrderById(id: string): Promise<Order> {
    return request<Order>(`/orders/${id}`);
  },

  // --- Contact ---
  async sendContact(msg: { name: string; email: string; phone?: string; message: string }): Promise<{ message: string }> {
    return request<{ message: string }>('/contact', {
      method: 'POST',
      body: JSON.stringify(msg),
    });
  },

  // --- Admin ---
  async getAdminStats(): Promise<AdminStats> {
    return request<AdminStats>('/admin/stats');
  },

  async getAdminOrders(): Promise<Order[]> {
    return request<Order[]>('/admin/orders');
  },

  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    return request<Order>(`/admin/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  async getAdminUsers(): Promise<User[]> {
    return request<User[]>('/admin/users');
  },

  async updateUserRole(userId: string, role: 'customer' | 'admin'): Promise<{ _id: string; role: string }> {
    return request<{ _id: string; role: string }>(`/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  },

  async createAdminProduct(productData: any): Promise<Product> {
    return request<Product>('/admin/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  },

  async updateAdminProduct(id: string, productData: any): Promise<Product> {
    return request<Product>(`/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  },

  async deleteAdminProduct(id: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/admin/products/${id}`, {
      method: 'DELETE',
    });
  },
};
