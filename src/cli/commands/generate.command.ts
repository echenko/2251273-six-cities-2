import { Command } from './command.interface.js';
import { TSVOfferGenerator } from '../../shared/libs/offer-generator/index.js';
import { TSVFileWriter } from '../../shared/libs/file-writer/index.js';
import got from 'got';
import { TSV_FIELDS_OFFER } from '../../shared/const.js';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../shared/libs/container/index.js';
import { LoggerInterface } from '../../shared/libs/logger/index.js';

@injectable()
export class GenerateCommand implements Command {
  constructor(
    @inject(TYPES.Logger) private readonly logger: LoggerInterface,
  ) {}

  public getName(): string {
    return '--generate';
  }

  public async execute(...args: string[]): Promise<void> {
    const [countStr, filePath, url] = args;
    const count = parseInt(countStr, 10);

    if (!count || !filePath || !url) {
      this.logger.error(
        'GenerateCommand: Missing required arguments. Usage: --generate <count> <filepath> <url>'
      );
      return;
    }

    try {
      this.logger.info(`GenerateCommand: Downloading data from ${url}...`);
      const mockData = JSON.parse((await got(url)).body);

      const writer = new TSVFileWriter(filePath);
      await writer.write(TSV_FIELDS_OFFER.join('\t'));

      const generator = new TSVOfferGenerator(mockData);
      this.logger.info(`GenerateCommand: Generating ${count} offers...`);

      for (let i = 0; i < count; i++) {
        await writer.write(generator.generate());
      }

      await writer.close();
      this.logger.info(`GenerateCommand: Generated ${count} offers to ${filePath}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(
        err instanceof Error ? err : new Error(msg),
        `GenerateCommand: ERROR: ${msg}`
      );
    }
  }
}
