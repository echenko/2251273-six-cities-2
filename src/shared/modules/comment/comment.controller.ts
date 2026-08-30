import { Router, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import asyncHandler from 'express-async-handler';
import { ZodError } from 'zod';
import { BaseController } from '../../libs/controller/index.js';
import { TYPES } from '../../libs/container/container.types.js';
import { LoggerInterface } from '../../libs/logger/logger.interface.js';
import { CommentService, ForbiddenError } from './comment.service.js';
import { createCommentSchema } from './comment.dto.js';
import { AuthMiddleware } from '../auth/auth.middleware.js';

type ParamOfferId = { offerId: string };
type ParamOfferAndCommentId = { offerId: string; commentId: string };

@injectable()
export class CommentController extends BaseController {
  private readonly router: Router;

  constructor(
    @inject(TYPES.Logger) protected override readonly logger: LoggerInterface,
    @inject(TYPES.CommentService) private readonly commentService: CommentService,
    @inject(TYPES.AuthMiddleware) private readonly authMiddleware: AuthMiddleware,
  ) {
    super(logger);
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes(): void {
    this.router.get(
      '/offers/:offerId/comments',
      asyncHandler(this.getByOfferId),
    );

    this.router.post(
      '/offers/:offerId/comments',
      this.authMiddleware.execute,
      asyncHandler(this.create),
    );

    this.router.delete(
      '/offers/:offerId/comments/:commentId',
      this.authMiddleware.execute,
      asyncHandler(this.delete),
    );
  }

  private getByOfferId = async (
    req: Request<ParamOfferId>,
    res: Response,
  ): Promise<void> => {
    const { offerId } = req.params;
    const limit = req.query.limit ? Number(req.query.limit) : 50;
    const safeLimit = Math.min(Math.max(1, limit), 50);

    try {
      const comments = await this.commentService.findByOfferId(offerId, safeLimit);
      this.ok(res, comments);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        this.notFound(res, error.message);
        return;
      }
      throw error;
    }
  };

  private create = async (req: Request<ParamOfferId>, res: Response): Promise<void> => {
    try {
      const { offerId } = req.params;
      const dto = createCommentSchema.parse(req.body);
      const userId = req.tokenUserId;

      if (!userId) {
        this.unauthorized(res, 'User is not authenticated');
        return;
      }

      const comment = await this.commentService.create(offerId, dto, userId);
      this.logger.info(`CommentController: Comment created with id ${comment.id}`);
      this.created(res, comment);
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.issues.map((i) => i.message).join(', ') || 'Validation error';
        this.badRequest(res, message);
        return;
      }
      if (error instanceof Error && error.message.includes('not found')) {
        this.notFound(res, error.message);
        return;
      }
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`CommentController: create failed: ${msg}`);
      this.internalServerError(res, 'Failed to create comment');
    }
  };

  private delete = async (
    req: Request<ParamOfferAndCommentId>,
    res: Response,
  ): Promise<void> => {
    try {
      const { commentId } = req.params;
      const userId = req.tokenUserId;

      if (!userId) {
        this.unauthorized(res, 'User is not authenticated');
        return;
      }

      const isDeleted = await this.commentService.deleteById(commentId, userId);
      if (!isDeleted) {
        this.notFound(res, `Comment with id ${commentId} not found`);
        return;
      }

      this.logger.info(`CommentController: Comment ${commentId} deleted by user ${userId}`);
      this.noContent(res);
    } catch (error) {
      if (error instanceof ForbiddenError) {
        this.forbidden(res, error.message);
        return;
      }
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`CommentController: delete failed: ${msg}`);
      this.internalServerError(res, 'Failed to delete comment');
    }
  };

  public getRouter(): Router {
    return this.router;
  }
}
