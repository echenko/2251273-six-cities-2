import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { BaseController } from '../../libs/controller/index.js';
import { HttpMethod } from '../../libs/controller/http-method.enum.js';
import { TYPES } from '../../libs/container/container.types.js';
import { LoggerInterface } from '../../libs/logger/logger.interface.js';
import { ValidateObjectIdMiddleware } from '../../libs/middleware/validate-objectid.middleware.js';
import { ValidateDtoMiddleware } from '../../libs/middleware/validate-dto.middleware.js';
import { OfferService } from './offer.service.js';
import { createOfferSchema } from './offer.dto.js';
import { AuthMiddleware } from '../auth/auth.middleware.js';
import { CityName } from './offer.interface.js';

type ParamOfferId = { offerId: string };
type ParamUserId = { userId: string };

@injectable()
export class OfferController extends BaseController {
  constructor(
    @inject(TYPES.Logger) protected override readonly logger: LoggerInterface,
    @inject(TYPES.OfferService) private readonly offerService: OfferService,
    @inject(TYPES.AuthMiddleware) private readonly authMiddleware: AuthMiddleware,
  ) {
    super(logger);
    this.initRoutes();
  }

  private initRoutes(): void {
    // ✅ GET /offers — список всех офферов
    this.addRoute(HttpMethod.Get, '/offers', this.index);

    // ✅ GET /users/:userId/offers — офферы конкретного пользователя
    this.addRoute(
      HttpMethod.Get,
      '/users/:userId/offers',
      this.getByUserId,
      [new ValidateObjectIdMiddleware('userId')]
    );

    // ✅ GET /offers/:offerId — получение оффера по ID
    this.addRoute(
      HttpMethod.Get,
      '/offers/:offerId',
      this.show,
      [new ValidateObjectIdMiddleware('offerId')]
    );

    // ✅ POST /offers — создание оффера
    this.addRoute(
      HttpMethod.Post,
      '/offers',
      this.create,
      [
        this.authMiddleware,
        new ValidateDtoMiddleware(createOfferSchema),
      ]
    );

    // ✅ DELETE /offers/:offerId — удаление оффера
    this.addRoute(
      HttpMethod.Delete,
      '/offers/:offerId',
      this.delete,
      [
        this.authMiddleware,
        new ValidateObjectIdMiddleware('offerId'),
      ]
    );
  }

  /**
   * Получение списка всех офферов с фильтрацией по городу и лимитом.
   */
  private index = async (req: Request, res: Response): Promise<void> => {
    const limitParam = req.query.limit ? Number(req.query.limit) : 60;
    const limit = Math.min(Math.max(1, limitParam), 100);

    const cityQuery = req.query.city as string | undefined;
    const validCities: CityName[] = ['Paris', 'Cologne', 'Brussels', 'Amsterdam', 'Hamburg', 'Dusseldorf'];
    const city = cityQuery && validCities.includes(cityQuery as CityName)
      ? (cityQuery as CityName)
      : undefined;

    const offers = city
      ? await this.offerService.findByCity(city, limit)
      : await this.offerService.findAll(limit);

    this.ok(res, offers);
  };

  /**
   * Получение офферов конкретного пользователя.
   */
  private getByUserId = async (
    req: Request<ParamUserId>,
    res: Response,
  ): Promise<void> => {
    const { userId } = req.params;
    const limitParam = req.query.limit ? Number(req.query.limit) : 60;
    const limit = Math.min(Math.max(1, limitParam), 100);

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

  /**
   * Получение оффера по ID.
   */
  private show = async (req: Request<ParamOfferId>, res: Response): Promise<void> => {
    const { offerId } = req.params;
    const offer = await this.offerService.findById(offerId);
    if (!offer) {
      this.notFound(res, `Offer with id ${offerId} not found`);
      return;
    }
    this.ok(res, offer);
  };

  /**
   * Создание нового оффера.
   */
  private create = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.tokenUserId;
      if (!userId) {
        this.unauthorized(res, 'User is not authenticated');
        return;
      }

      const dto = req.body;
      const offer = await this.offerService.create(userId, dto);
      this.logger.info(`OfferController: Offer created with id ${offer.id}`);
      this.created(res, offer);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        this.notFound(res, error.message);
        return;
      }
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`OfferController: create failed: ${msg}`);
      this.internalServerError(res, 'Failed to create offer');
    }
  };

  /**
   * Удаление оффера.
   */
  private delete = async (req: Request<ParamOfferId>, res: Response): Promise<void> => {
    try {
      const { offerId } = req.params;
      const offer = await this.offerService.findById(offerId);
      if (!offer) {
        this.notFound(res, `Offer with id ${offerId} not found`);
        return;
      }

      const isDeleted = await this.offerService.deleteById(offerId);
      if (!isDeleted) {
        this.notFound(res, `Offer with id ${offerId} not found`);
        return;
      }

      this.logger.info(`OfferController: Offer ${offerId} deleted`);
      this.noContent(res);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`OfferController: delete failed: ${msg}`);
      this.internalServerError(res, 'Failed to delete offer');
    }
  };
}
