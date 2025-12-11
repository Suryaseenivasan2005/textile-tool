// Application configuration

export const config = {
  api: {
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    timeout: 30000,
  },
  app: {
    name: 'Textile Manager',
    version: '1.0.0',
  },
} as const;

