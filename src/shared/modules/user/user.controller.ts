import { Router, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import asyncHandler from 'express-async-handler';
import { ZodError } from 'zod';
import { BaseController } from '../../libs/controller/index.js';
import { TYPES } from '../../libs/container/container.types.js';
import { LoggerInterface } from '../../libs/logger/logger.interface.js';
import { UserService } from './user.service.js';
import { createUserSchema } from './user.dto.js';

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
    this.router.post('/', asyncHandler(this.create));
    this.router.get('/:id', asyncHandler(this.getById));
  }

  private create = async (req: Request, res: Response): Promise<void> => {
    try {
      const dto = createUserSchema.parse(req.body);
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
      this.logger.error(`UserController: Unexpected error while creating user: ${errorMessage}`);
      this.internalServerError(res, 'Failed to create user');
    }
  };

  private getById = async (req: Request<ParamId>, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id || id.trim().length === 0) {
        this.badRequest(res, 'User id is required');
        return;
      }
      const user = await this.userService.findById(id.trim());
      if (!user) {
        this.notFound(res, `User with id ${id} not found`);
        return;
      }
      this.ok(res, user);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`UserController: Unexpected error while getting user: ${errorMessage}`);
      this.internalServerError(res, 'Failed to get user');
    }
  };

  public getRouter(): Router {
    return this.router;
  }
}

function isMongoDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: number }).code === 11000
  );
}
