import { LoggerInterface } from '../shared/libs/logger/logger.interface.js';
import { RestConfig } from './../shared/libs/config/index.js';
import { DatabaseClientInterface } from './../shared/libs/database/index.js';
import { injectable, inject } from 'inversify';
import { TYPES } from '../shared/libs/container/container.types.js';
import { UserModel } from '../shared/modules/user/index.js';
import { OfferModel } from '../shared/modules/offer/index.js';
import * as bcrypt from 'bcrypt';

@injectable()
export class RestApplication {
  constructor(
    @inject(TYPES.Logger) private readonly logger: LoggerInterface,
    @inject(TYPES.Config) private readonly config: RestConfig,
    @inject(TYPES.DatabaseClient) private readonly databaseClient: DatabaseClientInterface
  ) { }

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

    try {
      const plainPassword = 'securePassword123';
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(plainPassword, salt);

      const testUser = await UserModel.findOneAndUpdate(
        { email:`test${Math.random()}@example.com` },
        {
          email: `test${Math.random()}@example.com`,
          firstname: 'John',
          lastname: 'Doe',
          password: hashedPassword,
          type: 'pro',
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      this.logger.info(`RestApplication: User created with ID: ${testUser._id}`);

      const testOffer = await OfferModel.create({
        title: 'Cozy apartment in Paris center',
        description: 'Beautiful apartment with a view of the Eiffel Tower...',
        city: 'Paris',
        preview: 'preview.jpg',
        images: ['image1.jpg', 'image2.jpg'],
        isPremium: true,
        isFavorite: false,
        rating: 4.5,
        type: 'apartment',
        rooms: 2,
        maxPeople: 4,
        price: 15000,
        features: ['Breakfast', 'Washer', 'Fridge'],
        user: testUser._id,
        commentsCount: 0,
        location: { latitude: 48.8566, longitude: 2.3522 },
      });

      this.logger.info(`RestApplication: Offer created with ID: ${testOffer._id}`);

    } catch (error) {
      this.logger.error(error as Error, 'RestApplication: Error during test data creation');
    }
  }
}
