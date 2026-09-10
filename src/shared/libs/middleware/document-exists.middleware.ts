import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { MiddlewareInterface } from './middleware.interface.js';
import { ExistsChecker } from './exists-checker.interface.js';

export class DocumentExistsMiddleware implements MiddlewareInterface {
  constructor(
    private readonly checker: ExistsChecker,
    private readonly paramName: string,
    private readonly entityName: string,
  ) {}

  public async execute(req: Request, res: Response, next: NextFunction): Promise<void> {
    const value = req.params[this.paramName];

    if (typeof value !== 'string') {
      res.status(StatusCodes.BAD_REQUEST).json({
        statusCode: StatusCodes.BAD_REQUEST,
        message: `Missing or invalid parameter: ${this.paramName}`,
      });
      return;
    }

    const exists = await this.checker.existsById(value);
    if (!exists) {
      res.status(StatusCodes.NOT_FOUND).json({
        statusCode: StatusCodes.NOT_FOUND,
        message: `${this.entityName} with id ${value} not found`,
      });
      return;
    }
    next();
  }
}
