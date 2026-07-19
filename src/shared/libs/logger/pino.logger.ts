import pino, { Logger as PinoInstance, transport } from 'pino';
import { LoggerInterface } from './logger.index.js';
import { getCurrentModuleDirectoryPath } from '../../helpers/index.js';
import { resolve } from 'node:path';

export class PinoLogger implements LoggerInterface {
  private readonly logger: PinoInstance;

  constructor() {
    const modulePath = getCurrentModuleDirectoryPath();
    const logFilePath = 'logs/rest.log';
    const destination = resolve(modulePath, '../../../', logFilePath);

    const multiTransport = transport({
      targets: [
        {
          target: 'pino/file',
          options: { destination },
          level: 'debug'
        },
        {
          target: 'pino/file',
          level: 'info',
          options: {},
        }
      ],
    });

    this.logger = pino({}, multiTransport);
  }

  public debug(message: string): void {
    this.logger.debug(message);
  }

  public info(message: string): void {
    this.logger.info(message);
  }

  public warn(message: string): void {
    this.logger.warn(message);
  }

  public error(errorOrMessage: Error | string, message?: string): void {
    if (errorOrMessage instanceof Error) {
      this.logger.error(errorOrMessage, message ?? '');
    } else {
      this.logger.error(errorOrMessage);
    }
  }
}
