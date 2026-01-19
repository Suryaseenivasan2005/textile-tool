import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import { JWT_CONFIG } from '../constants';

export interface JWTPayload {
  userId: string;
  mobile: string;
}

export const generateToken = (payload: JWTPayload): string => {
  const secret = JWT_CONFIG.SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  const options: SignOptions = {
    expiresIn: JWT_CONFIG.EXPIRES_IN as SignOptions['expiresIn'],
  };

  return jwt.sign(payload, secret, options);
};

export const verifyToken = (token: string): JWTPayload => {
  const secret = JWT_CONFIG.SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }

  try {
    return jwt.verify(token, secret) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};
