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
      this.logger.error('ImportCommand: Filename is required');
      return;
    }

    this.logger.info(`ImportCommand: Importing: ${filename}`);

    try {
      // ✅ Подключение через DatabaseClient (единая точка входа)
      await this.databaseClient.connect();

      const reader = new TSVFileReader(filename, new TSVParser());
      const data = await reader.read();

      if (!data || data.length === 0) {
        this.logger.warn('ImportCommand: No records found');
        return;
      }

      this.logger.info(`ImportCommand: Found ${data.length} record(s)`);

      const defaultUser = await this.getOrCreateDefaultUser();
      let count = 0;
      let errors = 0;

      for (const item of data) {
        try {
          await this.saveOffer(item, defaultUser._id.toString());
          count++;
        } catch (err) {
          errors++;
          const msg = err instanceof Error ? err.message : String(err);
          this.logger.error(
            err instanceof Error ? err : new Error(msg),
            `ImportCommand: Record ${count + errors} failed`
          );
        }
      }

      this.logger.info(`ImportCommand: Imported: ${count}`);
      if (errors > 0) {
        this.logger.error(new Error(`${errors} record(s) failed`), 'ImportCommand: Some records failed');
      }
    } catch (err) {
      this.logger.error(
        err instanceof Error ? err : new Error(String(err)),
        'ImportCommand: Import failed'
      );
    } finally {
      // ✅ Отключение через DatabaseClient
      await this.databaseClient.disconnect();
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
    let cityName: string;
    if (typeof item.city === 'object' && item.city !== null) {
      cityName = String((item.city as Record<string, unknown>).name || 'Paris');
    } else {
      cityName = String(item.city || 'Paris');
    }

    let latitude = 0;
    let longitude = 0;
    if (typeof item.location === 'object' && item.location !== null) {
      const loc = item.location as Record<string, unknown>;
      latitude = Number(loc.latitude) || 0;
      longitude = Number(loc.longitude) || 0;
    } else {
      latitude = Number(item.latitude) || 0;
      longitude = Number(item.longitude) || 0;
    }

    const preview = String(item.previewImage || item.preview || 'default.jpg');
    let images: string[];
    if (Array.isArray(item.images)) {
      images = item.images.map(String);
    } else if (typeof item.images === 'string' && item.images) {
      images = item.images.split(';');
    } else {
      images = [preview];
    }

    let features: string[];
    if (Array.isArray(item.features)) {
      features = item.features.map(String);
    } else if (typeof item.features === 'string' && item.features) {
      features = item.features.split(';');
    } else {
      features = ['Breakfast', 'Washer', 'Fridge'];
    }

    await OfferModel.create({
      title: String(item.title || 'Untitled offer'),
      description: String(item.description || 'No description provided'),
      createdAt: item.createdAt ? new Date(String(item.createdAt)) : new Date(),
      city: cityName as 'Paris' | 'Cologne' | 'Brussels' | 'Amsterdam' | 'Hamburg' | 'Dusseldorf',
      preview,
      images,
      isPremium: item.isPremium === 'true' || item.isPremium === true,
      isFavorite: item.isFavorite === 'true' || item.isFavorite === true,
      rating: Number(item.rating) || 1,
      type: String(item.type || 'apartment') as 'apartment' | 'house' | 'room' | 'hotel',
      rooms: Number(item.rooms) || 1,
      maxPeople: Number(item.maxPeople) || 1,
      price: Number(item.price) || 100,
      features,
      user: userId,
      commentsCount: Number(item.commentsCount) || 0,
      location: { latitude, longitude },
    });
  }
}
