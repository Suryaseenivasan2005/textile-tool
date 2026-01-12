import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import { JWT_CONFIG } from '../constants';

export interface JWTPayload {
  userId: string;
  mobile: string;
}

export const generateToken = (payload: JWTPayload): string => {
  // Ensure Secret is treated as Secret (string | Buffer)
  const secret = JWT_CONFIG.SECRET as Secret;

  // Ensure options.expiresIn is compatible
  // JWT_CONFIG.EXPIRES_IN comes from process.env (string) or default string
  const options: SignOptions = {
    expiresIn: JWT_CONFIG.EXPIRES_IN as string | number,
  };

  return jwt.sign({ ...payload }, secret, options);
};

export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, JWT_CONFIG.SECRET as Secret) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};
