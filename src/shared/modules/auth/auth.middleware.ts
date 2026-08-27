import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'inversify';
import { BaseController } from '../../libs/controller/index.js';
import { TYPES } from '../../libs/container/container.types.js';
import { LoggerInterface } from '../../libs/logger/logger.interface.js';
import { AuthService } from './auth.service.js';
import { extractBearerToken } from './../../helpers/auth.helpers.js';

@injectable()
export class AuthMiddleware extends BaseController {
  constructor(
    @inject(TYPES.Logger)
    protected override readonly logger: LoggerInterface,
    @inject(TYPES.AuthService)
    private readonly authService: AuthService,
  ) {
    super(logger);
  }

  public execute = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const token = extractBearerToken(req);

    if (!token) {
      this.unauthorized(res, 'Authorization token is required');
      return;
    }

    const payload = await this.authService.verifyToken(token);
    if (!payload) {
      this.unauthorized(res, 'Invalid or revoked token');
      return;
    }

    req.tokenUserId = payload.userId;
    req.tokenEmail = payload.email;
    next();
  };
}
