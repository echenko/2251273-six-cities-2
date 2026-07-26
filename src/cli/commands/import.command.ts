import { Command } from './command.interface.js';
import { TSVFileReader } from '../../shared/libs/file-reader/index.js';
import { TSVParser } from '../../shared/libs/tsv-parser/index.js';
import chalk from 'chalk';
import mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { UserModel } from '../../shared/modules/user/user.entity.js';
import { OfferModel } from '../../shared/modules/offer/offer.entity.js';

export class ImportCommand implements Command {
  public getName(): string {
    return '--import';
  }

  public async execute(...parameters: string[]): Promise<void> {
    const filename = parameters[0]?.trim();

    if (!filename) {
      console.error(chalk.red('ImportCommand: ERROR: Filename is required'));
      return;
    }

    dotenv.config();
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/six-cities';

    console.info(chalk.cyan(`ImportCommand: Importing: ${filename}`));
    console.info(chalk.cyan('ImportCommand: Connecting to MongoDB...'));

    try {
      await mongoose.connect(mongoUri);
      console.info(chalk.green('ImportCommand: Connected to MongoDB'));

      const reader = new TSVFileReader(filename, new TSVParser());
      const data = await reader.read();

      if (!data || data.length === 0) {
        console.warn(chalk.yellow('ImportCommand: No records found'));
        return;
      }

      console.info(chalk.cyan(`ImportCommand: Found ${data.length} record(s)\n`));

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
          console.error(chalk.red(`ImportCommand: Record ${count + errors}: ${msg}`));
        }
      }

      console.info(chalk.green(`\nImportCommand: Imported: ${count}`));
      if (errors > 0) {
        console.info(chalk.red(`ImportCommand: Failed: ${errors}`));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(chalk.red(`\nImportCommand: Import failed: ${msg}`));
    } finally {
      await mongoose.disconnect();
      console.info(chalk.cyan('🔌 Disconnected'));
    }
  }

  // ============================================================
  // Создаём или находим дефолтного пользователя
  // ============================================================
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
      console.info(chalk.green(`ImportCommand: Default user created: ${user._id}`));
    } else {
      console.info(chalk.green(`ImportCommand: Default user found: ${user._id}`));
    }

    return user;
  }

  // ============================================================
  // Сохраняем один оффер
  // ============================================================
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
