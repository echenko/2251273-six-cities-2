import { LoggerInterface } from '../shared/libs/logger/logger.interface.js';
import { RestConfig } from './../shared/libs/config/index.js';
import { DatabaseClientInterface } from './../shared/libs/database/index.js';
import { UserRepository } from '../shared/modules/user/user.repository.interface.js';
import { OfferRepository } from '../shared/modules/offer/offer.repository.interface.js';
import { injectable, inject } from 'inversify';
import { TYPES } from '../shared/libs/container/container.types.js';
import { Types } from 'mongoose';
import * as bcrypt from 'bcrypt';

@injectable()
export class RestApplication {
  constructor(
    @inject(TYPES.Logger) private readonly logger: LoggerInterface,
    @inject(TYPES.Config) private readonly config: RestConfig,
    @inject(TYPES.DatabaseClient) private readonly databaseClient: DatabaseClientInterface,
    @inject(TYPES.UserRepository) private readonly userRepository: UserRepository,
    @inject(TYPES.OfferRepository) private readonly offerRepository: OfferRepository // ✅
  ) {}

  public async init(): Promise<void> {
    const port = this.config.get('port');
    this.logger.info(`RestApplication: Rest application started on port ${port}`);

    try {
      await this.databaseClient.connect();
      this.logger.info('RestApplication: Database connection ready for operations.');
    } catch (error) {
      this.logger.error(error as Error, 'RestApplication: Failed to connect to DB. Stopping app.');
      throw error;
    }

    this.setupGracefulShutdown();

    try {
      // ============================================================
      // ТЕСТ 1: Пользователь
      // ============================================================
      let user = await this.userRepository.findByEmail('test@example.com');

      if (!user) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('securePassword123', salt);
        user = await this.userRepository.create({
          email: 'test@example.com',
          firstname: 'John',
          lastname: 'Doe',
          password: hashedPassword,
          type: 'pro',
        });
        this.logger.info(`RestApplication: New user created: ${user._id}`);
      } else {
        this.logger.info(`RestApplication: User found: ${user.email}`);
      }

      // ============================================================
      // ТЕСТ 2: Создание оффера через репозиторий
      // ============================================================
      const testOffer = await this.offerRepository.create({
        title: 'Cozy apartment in Paris center',
        description: 'Beautiful apartment with a view of the Eiffel Tower. Perfect for couples.',
        city: 'Paris',
        preview: 'preview.jpg',
        images: ['image1.jpg', 'image2.jpg', 'image3.jpg'],
        isPremium: true,
        isFavorite: false,
        rating: 4.5,
        type: 'apartment',
        rooms: 2,
        maxPeople: 4,
        price: 15000,
        features: ['Breakfast', 'Washer', 'Fridge'],
        user: user._id as Types.ObjectId, // Связь с пользователем
        commentsCount: 0,
        location: { latitude: 48.8566, longitude: 2.3522 },
      });
      this.logger.info(`RestApplication: Offer created: ${testOffer._id}`);

      // ============================================================
      // ТЕСТ 3: Поиск оффера по ID (с populate)
      // ============================================================
      const foundOffer = await this.offerRepository.findById(testOffer._id.toString());
      if (foundOffer) {
        // После populate поле user — это объект пользователя
        const author = foundOffer.user as unknown as { email: string; firstname: string };
        this.logger.info(`RestApplication: Found offer "${foundOffer.title}" by ${author.email}`);
      }

      // ============================================================
      // ТЕСТ 4: Поиск всех офферов пользователя
      // ============================================================
      const userOffers = await this.offerRepository.findByUserId(user._id.toString());
      this.logger.info(`RestApplication: User has ${userOffers.length} offer(s)`);

      // ============================================================
      // ТЕСТ 5: Поиск офферов по городу
      // ============================================================
      const parisOffers = await this.offerRepository.findByCity('Paris');
      this.logger.info(`RestApplication: Paris has ${parisOffers.length} offer(s)`);

      // ============================================================
      // ТЕСТ 6: Получение всех офферов (с лимитом)
      // ============================================================
      const allOffers = await this.offerRepository.findAll(10);
      this.logger.info(`RestApplication: Fetched ${allOffers.length} offer(s) from DB`);

    } catch (error) {
      this.logger.error(error as Error, 'RestApplication: Error in repository test');
    }
  }

  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      this.logger.info(`RestApplication: Received ${signal}. Shutting down gracefully...`);
      try {
        await this.databaseClient.disconnect();
        this.logger.info('RestApplication: Graceful shutdown completed.');
      } catch (error) {
        this.logger.error(error as Error, 'RestApplication: Error during shutdown');
        throw error;
      }
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  }
}
