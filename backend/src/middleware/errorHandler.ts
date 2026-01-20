import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError | ZodError | Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log all errors to console for Render logs
  console.error('🚨 ERROR CAUGHT BY GLOBAL HANDLER:');
  console.error('  Path:', req.method, req.path);
  console.error('  Error:', err);

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const statusCode = 400;
    const message = err.errors.map(e => ({
      path: e.path.join('.'),
      message: e.message,
    }));

    console.error('  Type: Validation Error');
    console.error('  Details:', JSON.stringify(message));

    res.status(statusCode).json({
      error: 'Validation failed',
      details: message,
    });
    return;
  }

  // Handle custom AppError
  if ('statusCode' in err && err.statusCode) {
    console.error('  Type: Application Error');
    console.error('  Status Code:', err.statusCode);
    console.error('  Message:', err.message);

    res.status(err.statusCode).json({
      error: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
    return;
  }

  // Handle all other errors (including database, JWT, etc.)
  console.error('  Type: Unhandled Error');
  console.error('  Message:', err.message);
  console.error('  Stack:', err.stack);

  // Always return 500 for unknown errors
  res.status(500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err
    }),
  });
};

export const createError = (message: string, statusCode: number = 500): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};


