import { LoggerInterface } from '../shared/libs/logger/logger.interface.js';
import { RestConfig } from './../shared/libs/config/index.js';
import { DatabaseClientInterface } from './../shared/libs/database/index.js';
import { injectable, inject } from 'inversify';
import { TYPES } from '../shared/libs/container/container.types.js';

@injectable()
export class RestApplication {
  constructor(
    @inject(TYPES.Logger) private readonly logger: LoggerInterface,
    @inject(TYPES.Config) private readonly config: RestConfig,
    @inject(TYPES.DatabaseClient) private readonly databaseClient: DatabaseClientInterface
  ) {}

  public async init(): Promise<void> {
    const port = this.config.get('port');
    const logLevel = this.config.get('logLevel');

    await this.databaseClient.connect();

    this.setupGracefulShutdown();

    this.logger.info(`RestApplication: Rest application started on port ${port}`);
    this.logger.info(`RestApplication: Active log level: ${logLevel}`);
  }

  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      this.logger.info(`RestApplication: Received ${signal}. Shutting down gracefully...`);

      try {
        await this.databaseClient.disconnect();

        this.logger.info('RestApplication: Graceful shutdown completed. Node.js will exit naturally.');

      } catch (error) {
        this.logger.error(error as Error, 'RestApplication: Error during shutdown');

        throw error;
      }
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  }
}
