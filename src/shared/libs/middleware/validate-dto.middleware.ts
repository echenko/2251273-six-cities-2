import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { z, ZodError } from 'zod';
import { MiddlewareInterface } from './middleware.interface.js';

/**
 * Middleware для валидации тела запроса с помощью Zod-схемы.
 *
 * Использование:
 * new ValidateDtoMiddleware(createOfferSchema) — валидирует req.body
 *
 * Если валидация не пройдена, возвращает 400 Bad Request
 * с массивом ошибок валидации.
 */
export class ValidateDtoMiddleware<T> implements MiddlewareInterface {
  // Используем z.ZodType вместо устаревшего ZodSchema
  constructor(private readonly schema: z.ZodType<T>) {}

  public execute(req: Request, res: Response, next: NextFunction): void {
    try {
      // Валидируем и парсим тело запроса.
      req.body = this.schema.parse(req.body) as T;

      // Явный return удовлетворяет правилу consistent-return
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        }));

        res.status(StatusCodes.BAD_REQUEST).json({
          statusCode: StatusCodes.BAD_REQUEST,
          message: 'Validation error',
          errors,
          path: req.url,
        });

        return;
      }

      // Если это не ZodError — передаём дальше в ExceptionFilter
      return next(error);
    }
  }
}
