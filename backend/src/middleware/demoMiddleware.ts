import { Request, Response, NextFunction } from 'express';

// Extend Express Request type to include isDemo
declare global {
  namespace Express {
    interface Request {
      isDemo?: boolean;
    }
  }
}

export const demoMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const isDemoHeader = req.headers['x-demo-mode'];
  
  if (isDemoHeader === 'true') {
    req.isDemo = true;
  }
  
  next();
};
