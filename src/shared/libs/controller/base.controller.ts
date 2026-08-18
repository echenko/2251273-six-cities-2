import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { inject, injectable } from 'inversify';
import { TYPES } from '../container/container.types.js';
import { LoggerInterface } from '../logger/logger.interface.js';

@injectable()
export abstract class BaseController {
  private readonly DEFAULT_CONTENT_TYPE = 'application/json';

  constructor(
    @inject(TYPES.Logger) protected readonly logger: LoggerInterface,
  ) {}

  public send<T>(res: Response, statusCode: number, data: T): void {
    res
      .status(statusCode)
      .type(this.DEFAULT_CONTENT_TYPE)
      .json(data);
  }

  public ok<T>(res: Response, data: T): void {
    this.send(res, StatusCodes.OK, data);
  }

  public created<T>(res: Response, data: T): void {
    this.send(res, StatusCodes.CREATED, data);
  }

  public noContent(res: Response): void {
    res
      .status(StatusCodes.NO_CONTENT)
      .send();
  }

  public badRequest(res: Response, message: string): void {
    this.send(res, StatusCodes.BAD_REQUEST, {
      statusCode: StatusCodes.BAD_REQUEST,
      message,
    });
  }

  public unauthorized(res: Response, message: string): void {
    this.send(res, StatusCodes.UNAUTHORIZED, {
      statusCode: StatusCodes.UNAUTHORIZED,
      message,
    });
  }

  public forbidden(res: Response, message: string): void {
    this.send(res, StatusCodes.FORBIDDEN, {
      statusCode: StatusCodes.FORBIDDEN,
      message,
    });
  }

  public notFound(res: Response, message: string): void {
    this.send(res, StatusCodes.NOT_FOUND, {
      statusCode: StatusCodes.NOT_FOUND,
      message,
    });
  }

  public conflict(res: Response, message: string): void {
    this.send(res, StatusCodes.CONFLICT, {
      statusCode: StatusCodes.CONFLICT,
      message,
    });
  }

  public internalServerError(res: Response, message: string): void {
    this.send(res, StatusCodes.INTERNAL_SERVER_ERROR, {
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message,
    });
  }
}
