import { VALIDATION } from '../constants';

export const validateMobile = (mobile: string): boolean => {
  return VALIDATION.MOBILE_REGEX.test(mobile);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= VALIDATION.PASSWORD_MIN_LENGTH;
};

