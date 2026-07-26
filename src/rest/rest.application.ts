import { LoggerInterface } from '../shared/libs/logger/logger.interface.js';
import { RestConfig } from './../shared/libs/config/index.js';
import { DatabaseClientInterface } from './../shared/libs/database/index.js';
import { UserRepository } from '../shared/modules/user/user.repository.interface.js';
import { OfferModel } from '../shared/modules/offer/index.js';
import { DocumentUser } from '../shared/modules/user/user.entity.js';
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
    @inject(TYPES.UserRepository) private readonly userRepository: UserRepository
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
      // 1. Тестируем поиск по email
      let user = await this.userRepository.findByEmail('test@example.com');

      if (!user) {
        // 2. Если нет — хешируем пароль и создаем через репозиторий
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('securePassword123', salt);

        user = await this.userRepository.create({
          email: 'test@example.com',
          firstname: 'John',
          lastname: 'Doe',
          password: hashedPassword,
          type: 'pro',
        });
        this.logger.info(`RestApplication: New user created via Repository: ${user._id}`);
      } else {
        this.logger.info(`RestApplication: User found via Repository: ${user.email}`);
      }

      // 3. Тестируем поиск по ID
      const foundById = await this.userRepository.findById(user._id.toString());
      this.logger.info(`RestApplication: Found by ID: ${foundById?.firstname}`);

      // 4. Создаем тестовый оффер со связью с пользователем
      const testOffer = await OfferModel.create({
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
        user: user._id as Types.ObjectId,
        commentsCount: 0,
        location: { latitude: 48.8566, longitude: 2.3522 },
      });

      this.logger.info(`RestApplication: Test offer created with ID: ${testOffer._id}`);

      // 5. Проверяем populate — заменяем any на правильный тип
      const populatedOffer = await OfferModel
        .findById(testOffer._id)
        .populate('user')
        .exec();

      if (populatedOffer) {
        // ✅ Правильная типизация вместо any
        const author = populatedOffer.user as unknown as DocumentUser;
        this.logger.info(`RestApplication: Populated offer author: ${author.email}`);
      }

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
