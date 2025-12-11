import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError | ZodError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const statusCode = 400;
    const message = err.errors.map(e => ({
      path: e.path.join('.'),
      message: e.message,
    }));

    console.error('Validation Error:', message);

    res.status(statusCode).json({
      error: 'Validation failed',
      details: message,
    });
    return;
  }

  // Handle other errors
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  console.error('Error:', {
    message,
    statusCode,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export const createError = (message: string, statusCode: number = 500): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};

