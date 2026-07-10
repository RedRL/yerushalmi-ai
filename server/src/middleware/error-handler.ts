import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../types/errors';
import { logger } from '../utils/logger';

/** Must be registered last. Converts thrown errors into a consistent JSON shape. */
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error(err.message, { path: req.path, details: err.details });
    } else {
      logger.warn(err.message, { path: req.path, details: err.details });
    }

    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        details: err.details,
      },
    });
    return;
  }

  logger.error('Unhandled error', {
    path: req.path,
    error: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
  });

  res.status(500).json({
    success: false,
    error: { message: 'שגיאה בלתי צפויה בשרת' },
  });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: { message: `הנתיב ${req.method} ${req.path} לא נמצא` },
  });
}
