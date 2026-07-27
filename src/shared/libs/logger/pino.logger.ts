import pino, { Logger as PinoInstance } from 'pino';
import { resolve } from 'node:path';
import { mkdirSync } from 'node:fs';
import { LoggerInterface } from './logger.interface.js';
import { injectable } from 'inversify';

@injectable()
export class PinoLogger implements LoggerInterface {
  private readonly logger: PinoInstance;

  constructor() {
    const logDir = resolve(process.cwd(), './logs');
    mkdirSync(logDir, { recursive: true });

    this.logger = pino({
      transport: {
        targets: [
          {
            target: 'pino-pretty',
            options: {
              colorize: true,
              destination: 2,
              translateTime: 'SYS:standard',
              ignore: 'pid,hostname',
            },
          },
          {
            target: 'pino/file',
            options: { destination: resolve(logDir, 'cli-app.log') },
          },
        ],
      },
    });
  }

  public debug(message: string, ...args: unknown[]): void {
    if (args.length > 0) {
      this.logger.debug({ args }, message);
    } else {
      this.logger.debug(message);
    }
  }

  public info(message: string, ...args: unknown[]): void {
    if (args.length > 0) {
      this.logger.info({ args }, message);
    } else {
      this.logger.info(message);
    }
  }

  public warn(message: string, ...args: unknown[]): void {
    if (args.length > 0) {
      this.logger.warn({ args }, message);
    } else {
      this.logger.warn(message);
    }
  }

  public error(errorOrMessage: Error | string, ...args: unknown[]): void {
    if (errorOrMessage instanceof Error) {
      if (args.length > 0) {
        this.logger.error({ err: errorOrMessage, args }, errorOrMessage.message);
      } else {
        this.logger.error({ err: errorOrMessage }, errorOrMessage.message);
      }
    } else {
      if (args.length > 0) {
        this.logger.error({ args }, errorOrMessage);
      } else {
        this.logger.error(errorOrMessage);
      }
    }
  }
}
