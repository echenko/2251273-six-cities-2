import { LoggerInterface } from '../shared/libs/logger/logger.interface.js';
import { RestConfig } from './../shared/libs/config/index.js';
import { DatabaseClientInterface } from './../shared/libs/database/index.js';
// import { UserRepository } from '../shared/modules/user/user.repository.interface.js';
// import { OfferRepository } from '../shared/modules/offer/offer.repository.interface.js';
import { injectable, inject } from 'inversify';
import { TYPES } from '../shared/libs/container/container.types.js';
// import { Types } from 'mongoose';
// import * as bcrypt from 'bcrypt';

@injectable()
export class RestApplication {
  constructor(
    @inject(TYPES.Logger) private readonly logger: LoggerInterface,
    @inject(TYPES.Config) private readonly config: RestConfig,
    @inject(TYPES.DatabaseClient) private readonly databaseClient: DatabaseClientInterface,
    // @inject(TYPES.UserRepository) private readonly userRepository: UserRepository,
    // @inject(TYPES.OfferRepository) private readonly offerRepository: OfferRepository
  ) { }

  public async init(): Promise<void> {
    const port = this.config.get('port');
    this.logger.info(`RestApplication: Rest application started on port ${port}`);

    // 1. Подключение к БД
    try {
      await this.databaseClient.connect();
      this.logger.info('RestApplication: Database connection ready for operations.');
    } catch (error) {
      this.logger.error(error as Error, 'RestApplication: Failed to connect to DB. Stopping app.');
      throw error;
    }

    // 2. Настройка graceful shutdown
    this.setupGracefulShutdown();
  }

  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      this.logger.info(`RestApplication: Received ${signal}. Shutting down gracefully...`);
      try {
        await this.databaseClient.disconnect();
        this.logger.info('RestApplication: Graceful shutdown completed.');

        process.exitCode = 0;
      } catch (error) {
        this.logger.error(error as Error, 'RestApplication: Error during shutdown');
        process.exitCode = 1;
      }
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  }
}
