import { Router, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import asyncHandler from 'express-async-handler';
import { BaseController } from '../../libs/controller/index.js';
import { TYPES } from '../../libs/container/container.types.js';
import { LoggerInterface } from '../../libs/logger/logger.interface.js';
import { AuthService } from './auth.service.js';

@injectable()
export class AuthController extends BaseController {
  private readonly router: Router;

  constructor(
    @inject(TYPES.Logger) protected override readonly logger: LoggerInterface,
    @inject(TYPES.AuthService) private readonly authService: AuthService,
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
          const { email, password } = req.body;

          if (!email || !password) {
            this.badRequest(res, 'Email and password are required');
            return;
          }

          const { token, user } = await this.authService.login(email, password);

          this.ok(res, { token, user });
        } catch (error) {
          this.logger.warn(`AuthController: Login failed for ${req.body.email}`);
          this.unauthorized(res, 'Invalid email or password');
        }
      }),
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
