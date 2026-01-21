import { API_BASE_URL, STORAGE_KEYS } from '@/constants';
import {
  Vendor,
  Customer,
  Product,
  Category,
  Color,
  Purchase,
  Sale,
  Return,
  Payment,
  Settings,
} from '@/types';

export interface LoginResponse {
  message: string;
  user: {
    id: string;
    mobile: string;
    name: string;
  };
  token: string;
}

export interface RegisterResponse {
  message: string;
  user: {
    id: string;
    mobile: string;
    name: string;
    createdAt: string;
  };
  token: string;
}

export interface DashboardStats {
  total_products: number;
  total_purchases: number;
  total_sales: number;
  profit: number;
}

export interface LedgerEntry {
  date: string;
  type: string;
  reference_id: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface LedgerResponse {
  type: string;
  reference_id: string;
  entries: LedgerEntry[];
  current_balance: number;
}

class ApiService {
  private getAuthToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token is invalid or expired
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }
      const error = await response.json().catch(() => ({ error: 'An error occurred' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async login(mobile: string, password: string): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ mobile, password }),
    });
  }

  async register(mobile: string, password: string, name?: string): Promise<RegisterResponse> {
    return this.request<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ mobile, password, name }),
    });
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  // Vendors
  async getVendors(params?: { search?: string; status?: string }): Promise<Vendor[]> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    const query = queryParams.toString();
    return this.request<Vendor[]>(`/vendors${query ? `?${query}` : ''}`);
  }

  async getVendor(id: string): Promise<Vendor> {
    return this.request<Vendor>(`/vendors/${id}`);
  }

  async createVendor(data: Omit<Vendor, 'id' | 'created_at' | 'updated_at'>): Promise<Vendor> {
    return this.request<Vendor>('/vendors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateVendor(id: string, data: Partial<Vendor>): Promise<Vendor> {
    return this.request<Vendor>(`/vendors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteVendor(id: string): Promise<void> {
    return this.request<void>(`/vendors/${id}`, {
      method: 'DELETE',
    });
  }

  // Customers
  async getCustomers(params?: { search?: string }): Promise<Customer[]> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    const query = queryParams.toString();
    return this.request<Customer[]>(`/customers${query ? `?${query}` : ''}`);
  }

  async getCustomer(id: string): Promise<Customer> {
    return this.request<Customer>(`/customers/${id}`);
  }

  async createCustomer(data: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<Customer> {
    return this.request<Customer>('/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCustomer(id: string, data: Partial<Customer>): Promise<Customer> {
    return this.request<Customer>(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCustomer(id: string): Promise<void> {
    return this.request<void>(`/customers/${id}`, {
      method: 'DELETE',
    });
  }

  // Products
  async getProducts(params?: { search?: string; category?: string; status?: string }): Promise<Product[]> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.status) queryParams.append('status', params.status);
    const query = queryParams.toString();
    return this.request<Product[]>(`/products${query ? `?${query}` : ''}`);
  }

  async getProduct(id: string): Promise<Product> {
    return this.request<Product>(`/products/${id}`);
  }

  async createProduct(data: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    return this.request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    return this.request<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id: string): Promise<void> {
    return this.request<void>(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Categories
  async getCategories(params?: { search?: string; status?: string }): Promise<Category[]> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    const query = queryParams.toString();
    return this.request<Category[]>(`/categories${query ? `?${query}` : ''}`);
  }

  async getCategory(id: string): Promise<Category> {
    return this.request<Category>(`/categories/${id}`);
  }

  async createCategory(data: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> {
    return this.request<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    return this.request<Category>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: string): Promise<void> {
    return this.request<void>(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Colors
  async getColors(params?: { search?: string; status?: string }): Promise<Color[]> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    const query = queryParams.toString();
    return this.request<Color[]>(`/colors${query ? `?${query}` : ''}`);
  }

  async getColor(id: string): Promise<Color> {
    return this.request<Color>(`/colors/${id}`);
  }

  async createColor(data: Omit<Color, 'id' | 'created_at' | 'updated_at'>): Promise<Color> {
    return this.request<Color>('/colors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateColor(id: string, data: Partial<Color>): Promise<Color> {
    return this.request<Color>(`/colors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteColor(id: string): Promise<void> {
    return this.request<void>(`/colors/${id}`, {
      method: 'DELETE',
    });
  }

  // Purchases
  async getPurchases(params?: { search?: string; vendor_id?: string; payment_status?: string }): Promise<Purchase[]> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.vendor_id) queryParams.append('vendor_id', params.vendor_id);
    if (params?.payment_status) queryParams.append('payment_status', params.payment_status);
    const query = queryParams.toString();
    return this.request<Purchase[]>(`/purchases${query ? `?${query}` : ''}`);
  }

  async getPurchase(id: string): Promise<Purchase> {
    return this.request<Purchase>(`/purchases/${id}`);
  }

  async createPurchase(data: Omit<Purchase, 'id' | 'created_at' | 'updated_at'>): Promise<Purchase> {
    return this.request<Purchase>('/purchases', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePurchase(id: string, data: Partial<Purchase>): Promise<Purchase> {
    return this.request<Purchase>(`/purchases/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updatePurchaseStatus(id: string, payment_status: 'pending' | 'paid' | 'partial'): Promise<void> {
    return this.request<void>(`/purchases/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ payment_status }),
    });
  }

  // Sales
  async getSales(params?: { search?: string; customer_id?: string; payment_type?: string }): Promise<Sale[]> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.customer_id) queryParams.append('customer_id', params.customer_id);
    if (params?.payment_type) queryParams.append('payment_type', params.payment_type);
    const query = queryParams.toString();
    return this.request<Sale[]>(`/sales${query ? `?${query}` : ''}`);
  }

  async getSale(id: string): Promise<Sale> {
    return this.request<Sale>(`/sales/${id}`);
  }

  async createSale(data: Omit<Sale, 'id' | 'created_at' | 'updated_at'>): Promise<Sale> {
    return this.request<Sale>('/sales', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSale(id: string, data: Partial<Sale>): Promise<Sale> {
    return this.request<Sale>(`/sales/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Returns
  async getReturns(params?: { search?: string; type?: string }): Promise<Return[]> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.type) queryParams.append('type', params.type);
    const query = queryParams.toString();
    return this.request<Return[]>(`/returns${query ? `?${query}` : ''}`);
  }

  async getReturn(id: string): Promise<Return> {
    return this.request<Return>(`/returns/${id}`);
  }

  async createReturn(data: Omit<Return, 'id' | 'created_at' | 'updated_at'>): Promise<Return> {
    return this.request<Return>('/returns', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Inventory
  async getInventory(params?: { product_id?: string }): Promise<any[]> {
    const queryParams = new URLSearchParams();
    if (params?.product_id) queryParams.append('product_id', params.product_id);
    const query = queryParams.toString();
    return this.request<any[]>(`/inventory${query ? `?${query}` : ''}`);
  }

  async adjustInventory(data: {
    product_id: string;
    quantity: number;
    type: 'in' | 'out' | 'adjustment';
    reason?: string;
  }): Promise<any> {
    return this.request<any>('/inventory/adjust', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Payments
  async getPayments(params?: {
    reference_type?: string;
    reference_id?: string;
    payment_mode?: string;
  }): Promise<Payment[]> {
    const queryParams = new URLSearchParams();
    if (params?.reference_type) queryParams.append('reference_type', params.reference_type);
    if (params?.reference_id) queryParams.append('reference_id', params.reference_id);
    if (params?.payment_mode) queryParams.append('payment_mode', params.payment_mode);
    const query = queryParams.toString();
    return this.request<Payment[]>(`/payments${query ? `?${query}` : ''}`);
  }

  async createPayment(data: Omit<Payment, 'id' | 'created_at' | 'updated_at'>): Promise<Payment> {
    return this.request<Payment>('/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getLedger(type: 'vendor' | 'customer', id: string): Promise<LedgerResponse> {
    return this.request<LedgerResponse>(`/payments/ledger/${type}/${id}`);
  }

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>('/dashboard/stats');
  }

  // Settings
  async getSettings(): Promise<Settings> {
    return this.request<Settings>('/settings');
  }

  async updateSettings(data: Partial<Settings>): Promise<Settings> {
    return this.request<Settings>('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}

export const apiService = new ApiService();

