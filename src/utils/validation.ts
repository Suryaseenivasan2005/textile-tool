import { VALIDATION } from '@/constants';

export const validateMobile = (mobile: string): boolean => {
  return VALIDATION.MOBILE_REGEX.test(mobile);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= VALIDATION.PASSWORD_MIN_LENGTH;
};

export const formatMobile = (mobile: string): string => {
  return mobile.replace(/\D/g, '').slice(0, VALIDATION.MOBILE_LENGTH);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

