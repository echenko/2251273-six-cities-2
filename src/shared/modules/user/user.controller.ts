import { Router, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import asyncHandler from 'express-async-handler';
import { BaseController } from '../../libs/controller/index.js';
import { TYPES } from '../../libs/container/container.types.js';
import { LoggerInterface } from '../../libs/logger/logger.interface.js';
import { UserService } from './user.service.js';
import { CreateUser } from './user.interface.js';
 
type ParamId = { id: string };

@injectable()
export class UserController extends BaseController {
  private readonly router: Router;

  constructor(
    @inject(TYPES.Logger) protected override readonly logger: LoggerInterface,
    @inject(TYPES.UserService) private readonly userService: UserService,
  ) {
    super(logger);
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes(): void {
    // POST /users — регистрация нового пользователя
    this.router.post(
      '/',
      asyncHandler(async (req: Request<Record<string, never>, Record<string, never>, CreateUser>, res: Response) => {
        try {
          const dto = req.body;

          if (!dto.name || !dto.email || !dto.password) {
            this.badRequest(res, 'Name, email and password are required');
            return;
          }

          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(dto.email)) {
            this.badRequest(res, 'Invalid email format');
            return;
          }

          if (dto.password.length < 6) {
            this.badRequest(res, 'Password must be at least 6 characters long');
            return;
          }

          const user = await this.userService.create(dto);

          this.logger.info(`UserController: User created with email ${dto.email}`);
          this.created(res, user);
        } catch (error) {
          const message = (error as Error).message;

          if (message.includes('already exists')) {
            this.conflict(res, message);
            return;
          }

          this.logger.error('UserController: Unexpected error');
          this.internalServerError(res, 'Failed to create user');
        }
      }),
    );

    // GET /users/:id — получение пользователя по публичному id
    this.router.get(
      '/:id',
      asyncHandler(async (req: Request<ParamId>, res: Response) => {
        const { id } = req.params;

        const user = await this.userService.findById(id);
        if (!user) {
          this.notFound(res, `User with id ${id} not found`);
          return;
        }

        this.ok(res, user);
      }),
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
