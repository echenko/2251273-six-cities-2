import { inject, injectable } from 'inversify';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { TYPES } from '../container/container.types.js';
import { LoggerInterface } from '../logger/logger.interface.js';
import { ExceptionFilterInterface } from './exception-filter.interface.js';

interface HttpError extends Error {
  status?: number;
}

@injectable()
export class ExceptionFilter implements ExceptionFilterInterface {
  constructor(
    @inject(TYPES.Logger) private readonly logger: LoggerInterface,
  ) {
    this.logger.info('ExceptionFilter: Initialized');
  }

  public catch(error: Error, req: Request, res: Response, _next: NextFunction): void {
    this.logger.error(error, `ExceptionFilter: ${req.method} ${req.url} failed`);

    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    const httpError = error as HttpError;
    if (typeof httpError.status === 'number') {
      statusCode = httpError.status;
      message = error.message;
    } else if (error.name === 'ZodError' || error.name === 'ValidationError') {
      statusCode = StatusCodes.BAD_REQUEST;
      message = error.message;
    } else if (error.message.includes('not found')) {
      statusCode = StatusCodes.NOT_FOUND;
      message = error.message;
    }

    res.status(statusCode).json({
      statusCode,
      message,
      timestamp: new Date().toISOString(),
      path: req.url,
    });
  }
}
