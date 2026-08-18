import mongoose from 'mongoose';
import { injectable, inject } from 'inversify';
import { DatabaseClientInterface } from './index.js';
import { LoggerInterface } from '../logger/logger.interface.js';
import { RestConfig } from './../config/index.js';
import { TYPES } from '../container/container.types.js';
import { UserModel } from '../../modules/user/user.entity.js';

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

    if (mongoose.connection.readyState !== 0) {
      this.logger.warn('MongoClient: Previous connection state detected. Forcing disconnect...');
      await mongoose.disconnect();
    }

    const connection = mongoose.connection;

    connection.on('error', (error) => {
      this.logger.error(error, 'MongoClient: MongoDB connection error');
    });

    connection.on('disconnected', () => {
      this.logger.warn('MongoClient: MongoDB connection was disconnected');
    });

    connection.on('reconnected', () => {
      this.logger.info('MongoClient: MongoDB reconnected successfully');
    });

    try {
      await mongoose.connect(mongoUrl, {
        dbName,
        directConnection: true,
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        heartbeatFrequencyMS: 10000,
      });

      await connection.asPromise();

      if (connection.db) {
        await connection.db.admin().ping();
      }

      await UserModel.init();

      this.logger.info('MongoClient: Indexes synchronized.');
      this.logger.info('MongoClient: Database connection established and verified!');
    } catch (error) {
      this.logger.error(error as Error, 'MongoClient: Failed to connect to MongoDB');
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    this.logger.info('MongoClient: Disconnecting from MongoDB...');
    try {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }
      this.logger.info('MongoClient: Database connection closed successfully!');
    } catch (error) {
      this.logger.error(error as Error, 'MongoClient: Failed to disconnect from MongoDB');
      throw error;
    }
  }
}
