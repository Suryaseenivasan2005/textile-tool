export const API_ROUTES = {
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    PROFILE: '/api/auth/profile',
  },
  DEMO: {
    START: '/api/demo/start',
    RESET: '/api/demo/reset',
    STATUS: '/api/demo/status',
  },
} as const;

// Validation
export const VALIDATION = {
  MOBILE_LENGTH: 10,
  PASSWORD_MIN_LENGTH: 6,
  MOBILE_REGEX: /^[0-9]{10}$/,
} as const;

// JWT Configuration
// CRITICAL: JWT_SECRET must be set in environment variables
// The application will fail at runtime if JWT_SECRET is not configured
export const JWT_CONFIG = {
  EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  SECRET: process.env.JWT_SECRET, // No fallback - must be set in .env
} as const;

// Database
export const DB_CONFIG = {
  DATABASE_NAME: 'tex-tool',
  COLLECTIONS: {
    USERS: 'users',
    VENDORS: 'vendors',
    CUSTOMERS: 'customers',
    PRODUCTS: 'products',
    CATEGORIES: 'categories',
    COLORS: 'colors',
    INVENTORY: 'inventory',
    PURCHASES: 'purchases',
    PURCHASE_ITEMS: 'purchase_items',
    SALES: 'sales',
    SALE_ITEMS: 'sale_items',
    RETURNS: 'returns',
    RETURN_ITEMS: 'return_items',
    PAYMENTS: 'payments',
    SETTINGS: 'settings',
  },
} as const;

// Demo Mode
export const DEMO_USER_ID = 'demo-user-fixed-id';

