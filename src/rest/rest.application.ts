import { PinoLogger } from './../shared/libs/logger/logger.index.js';

export class RestApplication {
  constructor(
    private readonly logger: PinoLogger
  ) {}

  public async init() {
    this.logger.info('Application initialization');
  }
}
