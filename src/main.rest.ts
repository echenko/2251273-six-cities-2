import 'reflect-metadata';
import { RestApplication } from './rest/rest.application.js';
import { container, TYPES } from './shared/libs/container/index.js';
import { LoggerInterface } from './shared/libs/logger/index.js';
async function bootstrap() {
  try {
    const application = container.get<RestApplication>(TYPES.Application);
    await application.init();
  } catch (error) {
    try {
      const logger = container.get<LoggerInterface>(TYPES.Logger);
      logger.error(error as Error, 'RestApplication: Fatal error during bootstrap');
    } catch {
      console.error('RestApplication: Fatal error during bootstrap:', error);
    }
    throw error;
  }
}

bootstrap();
