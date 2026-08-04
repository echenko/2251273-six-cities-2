import { Command } from './command.interface.js';
import { TSVFileReader } from '../../shared/libs/file-reader/index.js';
import { TSVParser } from '../../shared/libs/tsv-parser/index.js';
import { OfferModel } from '../../shared/modules/offer/offer.entity.js';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../shared/libs/container/index.js';
import { LoggerInterface } from '../../shared/libs/logger/index.js';
import { DatabaseClientInterface } from '../../shared/libs/database/index.js';
import { OffersItemType } from '../../shared/types/index.type.js';

@injectable()
export class ImportCommand implements Command {
  constructor(
    @inject(TYPES.Logger) private readonly logger: LoggerInterface,
    @inject(TYPES.DatabaseClient) private readonly databaseClient: DatabaseClientInterface,
  ) {}

  public getName(): string {
    return '--import';
  }

  public async execute(...parameters: string[]): Promise<void> {
    const filename = parameters[0]?.trim();
    if (!filename) {
      this.logger.error('ImportCommand: Filename is required. Usage: --import <path-to-file.tsv>');
      return;
    }

    try {
      await this.databaseClient.connect();

      const reader = new TSVFileReader(filename, new TSVParser(), this.logger);
      const data = await reader.read();

      if (!data || data.length === 0) {
        this.logger.warn('ImportCommand: No valid records found in the file.');
        return;
      }

      let count = 0;
      let errors = 0;

      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        const recordNumber = i + 1;
        const offerTitle = typeof item.title === 'string' ? item.title : 'Untitled';

        try {
          await this.saveOffer(item);
          count++;
        } catch (err) {
          errors++;
          this.logger.error(err as Error, `ImportCommand: Line #${recordNumber + 1} ("${offerTitle}") skipped.`);
        }
      }

      this.logger.info(`ImportCommand: Successfully imported ${count} record(s).`);

      if (errors > 0) {
        this.logger.warn(`ImportCommand: Import finished with warnings. Failed to process ${errors} record(s).`);
      } else {
        this.logger.info('ImportCommand: Import completed successfully without errors.');
      }
    } catch (err) {
      this.logger.error('ImportCommand: Critical error during import');
    } finally {
      await this.databaseClient.disconnect();
      this.logger.info('ImportCommand: Database connection closed.');
    }
  }

  private async saveOffer(item: OffersItemType): Promise<void> {
    const {
      id,
      title,
      type,
      price,
      previewImage,
      city: {
        name: cityName,
        location: {
          latitude: cityLatitude,
          longitude: cityLongitude,
          zoom: cityZoom,
        },
      },
      location: {
        latitude: offerLatitude,
        longitude: offerLongitude,
        zoom: offerZoom,
      },
      isFavorite,
      isPremium,
      rating,
    } = item;


    await OfferModel.create({
      id,
      title,
      type,
      price,
      previewImage,
      cityName,
      cityLatitude,
      cityLongitude,
      cityZoom,
      offerLatitude,
      offerLongitude,
      offerZoom,
      isFavorite,
      isPremium,
      rating,
    });
  }
}
