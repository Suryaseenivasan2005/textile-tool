import jwt from 'jsonwebtoken';
import { JWT_CONFIG } from '../constants';

export interface JWTPayload {
  userId: string;
  mobile: string;
}

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_CONFIG.SECRET, {
    expiresIn: JWT_CONFIG.EXPIRES_IN,
  });
};

export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, JWT_CONFIG.SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};
