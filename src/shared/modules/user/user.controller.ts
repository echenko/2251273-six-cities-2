import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { ZodError } from 'zod';
import { BaseController } from '../../libs/controller/index.js';
import { HttpMethod } from '../../libs/controller/http-method.enum.js';
import { TYPES } from '../../libs/container/container.types.js';
import { LoggerInterface } from '../../libs/logger/logger.interface.js';
import { ValidateObjectIdMiddleware } from '../../libs/middleware/validate-objectid.middleware.js';
import { ValidateDtoMiddleware } from '../../libs/middleware/validate-dto.middleware.js';
import { UserService } from './user.service.js';
import { createUserSchema } from './user.dto.js';

type ParamId = { id: string };

@injectable()
export class UserController extends BaseController {
  constructor(
    @inject(TYPES.Logger) protected override readonly logger: LoggerInterface,
    @inject(TYPES.UserService) private readonly userService: UserService,
  ) {
    super(logger);
    this.initRoutes();
  }

  private initRoutes(): void {
    // POST /users — регистрация пользователя
    this.addRoute(
      HttpMethod.Post,
      '/',
      this.create,
      [new ValidateDtoMiddleware(createUserSchema)],
    );

    // GET /users/:id — получение пользователя по ID
    this.addRoute(
      HttpMethod.Get,
      '/:id',
      this.show,
      [new ValidateObjectIdMiddleware('id')],
    );
  }

  /**
   * Регистрация нового пользователя.
   */
  private create = async (req: Request, res: Response): Promise<void> => {
    try {
      const dto = req.body;
      const user = await this.userService.create(dto);
      this.logger.info(`UserController: User created with id ${user.id}`);
      this.created(res, user);
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.issues.map((i) => i.message).join(', ') || 'Validation error';
        this.badRequest(res, message);
        return;
      }
      if (isMongoDuplicateKeyError(error)) {
        this.conflict(res, 'User with this email already exists');
        return;
      }
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`UserController: Unexpected error: ${errorMessage}`);
      this.internalServerError(res, 'Failed to create user');
    }
  };

  private show = async (req: Request<ParamId>, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await this.userService.findById(id.trim());
      if (!user) {
        this.notFound(res, `User with id ${id} not found`);
        return;
      }
      this.ok(res, user);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`UserController: Unexpected error: ${errorMessage}`);
      this.internalServerError(res, 'Failed to get user');
    }
  };
}

function isMongoDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: number }).code === 11000
  );
}
