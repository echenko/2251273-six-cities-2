import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Types } from 'mongoose';
import { validate as isUuid } from 'uuid';
import { MiddlewareInterface } from './middleware.interface.js';

export class ValidateObjectIdMiddleware implements MiddlewareInterface {
  constructor(private readonly param: string) {}

  public execute(req: Request, res: Response, next: NextFunction): void {
    const value = req.params[this.param];

    // Проверяем, что значение является строкой и представляет собой
    // либо валидный UUID, либо валидный ObjectId (для универсальности)
    const isValid = typeof value === 'string' && (isUuid(value) || Types.ObjectId.isValid(value));

    if (!isValid) {
      res.status(StatusCodes.BAD_REQUEST).json({
        statusCode: StatusCodes.BAD_REQUEST,
        message: `Invalid ${this.param} format. Expected UUID or ObjectId.`,
        path: req.url,
      });
      return;
    }

    next();
  }
}
