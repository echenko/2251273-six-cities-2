import { Command } from './command.interface.js';
import { TSVFileReader } from '../../shared/libs/file-reader/index.js';
import { TSVParser } from '../../shared/libs/tsv-parser/index.js';
import * as bcrypt from 'bcrypt';
import { UserModel } from '../../shared/modules/user/user.entity.js';
import { OfferModel } from '../../shared/modules/offer/offer.entity.js';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../shared/libs/container/index.js';
import { LoggerInterface } from '../../shared/libs/logger/index.js';
import { DatabaseClientInterface } from '../../shared/libs/database/index.js';
import { Types } from 'mongoose';

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

    this.logger.info(`ImportCommand: Starting import from: ${filename}`);

    try {
      await this.databaseClient.connect();
      this.logger.info('ImportCommand: Database connection established.');

      const reader = new TSVFileReader(filename, new TSVParser(), this.logger);
      const data = await reader.read();

      if (!data || data.length === 0) {
        this.logger.warn('ImportCommand: No valid records found in the file.');
        return;
      }

      this.logger.info(`ImportCommand: Found ${data.length} valid record(s) to process.`);

      const defaultUser = await this.getOrCreateDefaultUser();

      let count = 0;
      let errors = 0;

      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        const recordNumber = i + 1;
        const offerTitle = typeof item.title === 'string' ? item.title : 'Untitled';

        try {
          await this.saveOffer(item, defaultUser._id.toString());
          count++;
        } catch (err) {
          errors++;
          const errorMessage = err instanceof Error ? err.message : String(err);
          this.logger.error(
            `ImportCommand: Line #${recordNumber + 1} ("${offerTitle}") skipped. Reason: ${errorMessage}`
          );
        }
      }

      this.logger.info(`ImportCommand: Successfully imported ${count} record(s).`);

      if (errors > 0) {
        this.logger.warn(
          `ImportCommand: Import finished with warnings. Failed to process ${errors} record(s).`
        );
      } else {
        this.logger.info('ImportCommand: Import completed successfully without errors.');
      }
    } catch (err) {
      this.logger.error(
        err instanceof Error ? err : new Error(String(err)),
        'ImportCommand: Critical error during import'
      );
    } finally {
      await this.databaseClient.disconnect();
      this.logger.info('ImportCommand: Database connection closed.');
    }
  }

  private async getOrCreateDefaultUser() {
    const defaultEmail = 'import-user@six-cities.local';
    let user = await UserModel.findOne({ email: defaultEmail });

    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('ImportUser123!', salt);
      user = await UserModel.create({
        email: defaultEmail,
        firstname: 'Import',
        lastname: 'User',
        password: hash,
        type: 'regular',
      });
      this.logger.info(`ImportCommand: Default user created: ${user._id}`);
    } else {
      this.logger.info(`ImportCommand: Default user found: ${user._id}`);
    }

    return user;
  }

  private async saveOffer(item: Record<string, unknown>, userId: string): Promise<void> {
    const title = String(item.title || 'Untitled');
    const description = String(item.description || 'Description is missing in the data');
    const preview = String(item.previewImage || item.preview || 'default.jpg');

    const rawCity = String(item['city.name'] || item.city || 'Paris');
    const validCities = ['Paris', 'Cologne', 'Brussels', 'Amsterdam', 'Hamburg', 'Dusseldorf'] as const;
    const city = validCities.includes(rawCity as typeof validCities[number])
      ? (rawCity as typeof validCities[number])
      : 'Paris';

    const rawType = String(item.type || 'apartment').toLowerCase();
    const validTypes = ['apartment', 'house', 'room', 'hotel'] as const;
    const type = validTypes.includes(rawType as typeof validTypes[number])
      ? (rawType as typeof validTypes[number])
      : 'apartment';

    const images = typeof item.images === 'string'
      ? item.images.split(';').map((s) => s.trim())
      : [preview];

    const features = typeof item.features === 'string'
      ? item.features.split(';').map((s) => s.trim())
      : ['Breakfast', 'Washer', 'Fridge'];

    const price = Number(item.price) || 1000;
    const rooms = Number(item.rooms) || 1;
    const maxPeople = Number(item.maxPeople) || 2;
    const rating = Number(item.rating) || 3;
    const commentsCount = Number(item.commentsCount) || 0;

    const latitude = Number(item['location.latitude'] || item.latitude) || 0;
    const longitude = Number(item['location.longitude'] || item.longitude) || 0;

    await OfferModel.create({
      title,
      description,
      city,
      preview,
      images: images.slice(0, 6),
      isPremium: item.isPremium === 'true' || item.isPremium === true,
      isFavorite: item.isFavorite === 'true' || item.isFavorite === true,
      rating,
      type,
      rooms,
      maxPeople,
      price,
      features: features.slice(0, 7),
      user: new Types.ObjectId(userId),
      commentsCount,
      location: { latitude, longitude },
    });
  }
}
