// auth.controller.ts (ПРАВИЛЬНАЯ ВЕРСИЯ)
import { Router, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import asyncHandler from 'express-async-handler';
import { ZodError } from 'zod';
import { BaseController } from '../../libs/controller/index.js';
import { TYPES } from '../../libs/container/container.types.js';
import { LoggerInterface } from '../../libs/logger/logger.interface.js';
import { AuthService, AuthError } from './auth.service.js';
import { loginSchema } from './auth.dto.js';
import { AUTH_CONSTANTS } from './auth.constant.js';

@injectable()
export class AuthController extends BaseController {
  private readonly router: Router;

  constructor(
    @inject(TYPES.Logger)
    protected override readonly logger: LoggerInterface,
    @inject(TYPES.AuthService)
    private readonly authService: AuthService,
  ) {
    super(logger);
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes(): void {
    this.router.post(
      '/login',
      asyncHandler(async (req: Request, res: Response) => {
        try {
          const dto = loginSchema.parse(req.body);
          const result = await this.authService.login(dto, {
            userAgent: req.get('user-agent'),
            ip: req.ip,
          });

          res.cookie(AUTH_CONSTANTS.COOKIE_NAME, result.token, {
            httpOnly: true,
            sameSite: 'lax',
            maxAge: AUTH_CONSTANTS.COOKIE_MAX_AGE,
          });

          this.ok(res, result);
        } catch (error) {
          if (error instanceof ZodError) {
            const message =
              error.issues.map((i) => i.message).join(', ') || 'Validation error';
            this.badRequest(res, message);
            return;
          }
          if (error instanceof AuthError) {
            this.unauthorized(res, error.message);
            return;
          }
          const msg = error instanceof Error ? error.message : String(error);
          this.logger.error(`AuthController: login failed: ${msg}`);
          this.internalServerError(res, 'Login failed');
        }
      }),
    );

    this.router.post(
      '/logout',
      asyncHandler(async (req: Request, res: Response) => {
        try {
          const token = this.extractBearer(req);
          if (!token) {
            this.unauthorized(res, 'Authorization token is required');
            return;
          }

          const revoked = await this.authService.revoke(token);
          if (!revoked) {
            this.notFound(res, 'Active session not found');
            return;
          }

          res.clearCookie(AUTH_CONSTANTS.COOKIE_NAME);
          this.ok(res, { message: 'Logged out successfully' });
        } catch (error) {
          const msg = error instanceof Error ? error.message : String(error);
          this.logger.error(`AuthController: logout failed: ${msg}`);
          this.internalServerError(res, 'Logout failed');
        }
      }),
    );
  }

  private extractBearer(req: Request): string | null {
    const header = req.get('authorization') ?? '';
    const [scheme, token] = header.split(' ');
    if (scheme?.toLowerCase() !== 'bearer' || !token) {
      return null;
    }
    return token.trim() || null;
  }

  public getRouter(): Router {
    return this.router;
  }
}
