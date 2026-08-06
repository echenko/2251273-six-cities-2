import mongoose from 'mongoose';
import { injectable, inject } from 'inversify';
import { DatabaseClientInterface } from './index.js';
import { LoggerInterface } from '../logger/logger.interface.js';
import { RestConfig } from './../config/index.js';
import { TYPES } from '../container/container.types.js';

@injectable()
export class MongoClient implements DatabaseClientInterface {
  constructor(
    @inject(TYPES.Logger) private readonly logger: LoggerInterface,
    @inject(TYPES.Config) private readonly config: RestConfig
  ) {}

  public async connect(): Promise<void> {
    const mongoUrl = this.config.get('mongoUrl');
    const dbName = this.config.get('mongoDbName');

    this.logger.info(`MongoClient: Attempting to connect to MongoDB at ${mongoUrl}...`);

    try {
      await mongoose.connect(mongoUrl, { dbName });
      this.logger.info('MongoClient: Database connection established successfully!');

      const connection = mongoose.connection;

      connection.on('error', (error) => {
        this.logger.error(error, 'MongoClient: MongoDB connection error');
      });

      connection.on('connected', () => {
        this.logger.info('MongoClient: MongoDB is connected');
      });

      connection.on('disconnected', () => {
        this.logger.warn('MongoClient: MongoDB connection was disconnected');
      });

    } catch (error) {
      this.logger.error(error as Error, 'MongoClient: Failed to connect to MongoDB');
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    this.logger.info('MongoClient: Disconnecting from MongoDB...');
    try {
      await mongoose.disconnect();
      this.logger.info('MongoClient: Database connection closed successfully!');
    } catch (error) {
      this.logger.error(error as Error, 'MongoClient: Failed to disconnect from MongoDB');
      throw error;
    }
  }
}
