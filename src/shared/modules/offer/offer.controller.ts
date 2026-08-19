import { Router, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import asyncHandler from 'express-async-handler';
import { ZodError } from 'zod';
import { BaseController } from '../../libs/controller/index.js';
import { TYPES } from '../../libs/container/container.types.js';
import { LoggerInterface } from '../../libs/logger/logger.interface.js';
import { OfferService } from './offer.service.js';
import { AuthMiddleware } from '../auth/auth.middleware.js';
import { createOfferSchema } from './offer.dto.js';
import { CityName } from './offer.interface.js';

type ParamId = { id: string };

@injectable()
export class OfferController extends BaseController {
  private readonly router: Router;

  constructor(
    @inject(TYPES.Logger) protected override readonly logger: LoggerInterface,
    @inject(TYPES.OfferService) private readonly offerService: OfferService,
    @inject(TYPES.AuthMiddleware) private readonly authMiddleware: AuthMiddleware,
  ) {
    super(logger);
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes(): void {
    this.router.get('/', asyncHandler(this.getAll));
    this.router.get('/users/:userId', asyncHandler(this.getByUserId));
    this.router.get('/:id', asyncHandler(this.getById));

    this.router.post(
      '/',
      this.authMiddleware.execute,
      asyncHandler(this.create),
    );
    this.router.delete(
      '/:id',
      this.authMiddleware.execute,
      asyncHandler(this.delete),
    );
  }

  private getAll = async (req: Request, res: Response): Promise<void> => {
    const limit = req.query.limit ? Number(req.query.limit) : 60;
    const cityQuery = req.query.city as string | undefined;
    const validCities: CityName[] = [
      'Paris', 'Cologne', 'Brussels', 'Amsterdam', 'Hamburg', 'Dusseldorf',
    ];
    const city =
      cityQuery && validCities.includes(cityQuery as CityName)
        ? (cityQuery as CityName)
        : undefined;

    const offers = city
      ? await this.offerService.findByCity(city)
      : await this.offerService.findAll(limit);

    this.ok(res, offers);
  };

  private getByUserId = async (
    req: Request<{ userId: string }>,
    res: Response,
  ): Promise<void> => {
    const { userId } = req.params;
    const limit = req.query.limit ? Number(req.query.limit) : 60;

    try {
      const offers = await this.offerService.findByUserId(userId, limit);
      this.ok(res, offers);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        this.notFound(res, `User with id ${userId} not found`);
        return;
      }
      throw error;
    }
  };

  private getById = async (
    req: Request<ParamId>,
    res: Response,
  ): Promise<void> => {
    const { id } = req.params;
    const offer = await this.offerService.findById(id);

    if (!offer) {
      this.notFound(res, `Offer with id ${id} not found`);
      return;
    }

    this.ok(res, offer);
  };

  private create = async (req: Request, res: Response): Promise<void> => {
    try {
      const dto = createOfferSchema.parse(req.body);
      const userId = req.tokenUserId;

      if (!userId) {
        this.unauthorized(res, 'User is not authenticated');
        return;
      }

      const offer = await this.offerService.create(userId, dto);
      this.logger.info(
        `OfferController: Offer created with id ${offer.id} by user ${userId}`,
      );
      this.created(res, offer);
    } catch (error) {
      if (error instanceof ZodError) {
        const message =
          error.issues.map((i) => i.message).join(', ') || 'Validation error';
        this.badRequest(res, message);
        return;
      }
      if (error instanceof Error && error.message.includes('not found')) {
        this.notFound(res, error.message);
        return;
      }
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`OfferController: create failed: ${msg}`);
      this.internalServerError(res, 'Failed to create offer');
    }
  };

  private delete = async (
    req: Request<ParamId>,
    res: Response,
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.tokenUserId;

      if (!userId) {
        this.unauthorized(res, 'User is not authenticated');
        return;
      }

      const offer = await this.offerService.findById(id);
      if (!offer) {
        this.notFound(res, `Offer with id ${id} not found`);
        return;
      }

      const userRef = offer.user as unknown as Record<string, unknown>;
      const offerUserId = String(
        userRef?.id || (userRef?._id && String(userRef._id)) || offer.user
      );

      if (offerUserId !== userId) {
        this.forbidden(res, 'You can only delete your own offers');
        return;
      }

      const isDeleted = await this.offerService.deleteById(id);
      if (!isDeleted) {
        this.notFound(res, `Offer with id ${id} not found`);
        return;
      }

      this.logger.info(
        `OfferController: Offer ${id} deleted by user ${userId}`,
      );
      this.noContent(res);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`OfferController: delete failed: ${msg}`);
      this.internalServerError(res, 'Failed to delete offer');
    }
  };

  public getRouter(): Router {
    return this.router;
  }
}
