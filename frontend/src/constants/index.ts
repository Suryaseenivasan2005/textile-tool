// API Configuration
export const API_BASE_URL: string = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Routes
export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  VENDORS: '/vendors',
  CUSTOMERS: '/customers',
  PRODUCTS: '/products',
  INVENTORY: '/inventory',
  PURCHASES: '/purchases',
  SALES: '/sales',
  RETURNS: '/returns',
  PAYMENTS: '/payments',
  REPORTS: '/reports',
  SETTINGS: '/settings',
} as const;

// Validation
export const VALIDATION = {
  MOBILE_LENGTH: 10,
  PASSWORD_MIN_LENGTH: 6,
  MOBILE_REGEX: /^[0-9]{10}$/,
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  USER: 'user',
  TOKEN: 'token',
} as const;

// Status
export const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;

// Payment Types
export const PAYMENT_TYPES = {
  CASH: 'cash',
  CREDIT: 'credit',
  BANK: 'bank',
  CHEQUE: 'cheque',
  ONLINE: 'online',
} as const;

// Product Units
export const PRODUCT_UNITS = {
  METER: 'meter',
  YARD: 'yard',
  PIECE: 'piece',
  KG: 'kg',
  ROLL: 'roll',
} as const;

