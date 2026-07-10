import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';
import { ValidationError } from '../types/errors';

/** Validates `req.body` against a Zod schema and replaces it with the parsed value. */
export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      next(new ValidationError('נתונים לא תקינים בבקשה', result.error.flatten()));
      return;
    }

    req.body = result.data;
    next();
  };
}
