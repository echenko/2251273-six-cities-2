import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'inversify';
import { BaseController } from '../../libs/controller/index.js';
import { TYPES } from '../../libs/container/container.types.js';
import { LoggerInterface } from '../../libs/logger/logger.interface.js';
import { AuthService } from './auth.service.js';

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
    const header = req.get('authorization') ?? '';
    const [scheme, token] = header.split(' ');

    if (scheme?.toLowerCase() !== 'bearer' || !token?.trim()) {
      this.unauthorized(res, 'Authorization token is required');
      return;
    }

    const payload = await this.authService.verifyToken(token.trim());
    if (!payload) {
      this.unauthorized(res, 'Invalid or revoked token');
      return;
    }

    req.tokenUserId = payload.userId;
    req.tokenEmail = payload.email;
    next();
  };
}
