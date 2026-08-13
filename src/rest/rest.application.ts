import express, { Express } from 'express';
import cors from 'cors';
import { injectable, inject } from 'inversify';
import { LoggerInterface } from '../shared/libs/logger/logger.interface.js';
import { RestConfig } from './../shared/libs/config/index.js';
import { DatabaseClientInterface } from './../shared/libs/database/index.js';
import { TYPES } from '../shared/libs/container/container.types.js';
import { AuthController } from './../shared/modules/auth/auth.controller.js';

@injectable()
export class RestApplication {
  private readonly app: Express;

  constructor(
    @inject(TYPES.Logger) private readonly logger: LoggerInterface,
    @inject(TYPES.Config) private readonly config: RestConfig,
    @inject(TYPES.DatabaseClient) private readonly databaseClient: DatabaseClientInterface,
    @inject(TYPES.AuthController) private readonly authController: AuthController,
  ) {
    // Создаём Express-приложение сразу в конструкторе
    this.app = express();
  }

  public async init(): Promise<void> {
    const port = this.config.get('port') || 3000;
    this.logger.info(`RestApplication: Initializing REST application on port ${port}`);

    // 1. Подключение к БД
    try {
      await this.databaseClient.connect();
      this.logger.info('RestApplication: Database connection ready for operations.');
    } catch (error) {
      this.logger.error(error as Error, 'RestApplication: Failed to connect to DB. Stopping app.');
      throw error;
    }

    // 2. Настройка middleware
    this.initMiddleware();

    // 3. Подключение роутов
    this.initRoutes();

    // 4. Настройка graceful shutdown
    this.setupGracefulShutdown();

    // 5. Запуск сервера
    this.app.listen(port, () => {
      this.logger.info(`RestApplication: Server started on http://localhost:${port}`);
    });
  }

  /**
   * Инициализация глобальных middleware
   */
  private initMiddleware(): void {
    // CORS — чтобы фронтенд с другого порта мог обращаться к API
    this.app.use(cors());

    // Парсинг JSON-тела запросов (обязательно для POST/PUT)
    this.app.use(express.json());

    // Парсинг URL-encoded данных (для HTML-форм)
    this.app.use(express.urlencoded({ extended: true }));

    // Простое логирование всех входящих запросов
    this.app.use((req, _res, next) => {
      this.logger.info(`→ ${req.method} ${req.url}`);
      next();
    });

    this.logger.info('RestApplication: Middleware initialized.');
  }

  /**
   * Подключение роутов контроллеров
   */
  private initRoutes(): void {
    // Все роуты authController будут доступны по префиксу /auth
    // Итоговый путь: POST /auth/login
    this.app.use('/auth', this.authController.getRouter());

    // Здесь позже подключим другие контроллеры:
    // this.app.use('/users', this.userController.getRouter());
    // this.app.use('/offers', this.offerController.getRouter());

    this.logger.info('RestApplication: Routes initialized.');
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
