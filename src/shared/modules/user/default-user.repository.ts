import { injectable, inject } from 'inversify';
import { TYPES } from '../../libs/container/container.types.js';
import { LoggerInterface } from '../../libs/logger/logger.interface.js';
import { UserRepository } from './user.repository.interface.js';
import { DocumentUser, UserModel } from './user.entity.js';
import { CreateUser } from './user.interface.js';

@injectable()
export class DefaultUserRepository implements UserRepository {
  constructor(
    @inject(TYPES.Logger) private readonly logger: LoggerInterface,
  ) {}

  public async findById(id: string): Promise<DocumentUser | null> {
    this.logger.debug(`DefaultUserRepository: Searching for user by ID ${id}`);
    return UserModel.findById(id).exec();
  }

  public async findByEmail(email: string): Promise<DocumentUser | null> {
    this.logger.debug('DefaultUserRepository: Searching for user by email');
    return UserModel.findOne({ email }).exec();
  }

  public async findByEmailForAuth(email: string): Promise<DocumentUser | null> {
    this.logger.debug('DefaultUserRepository: Auth lookup for user');
    return UserModel.findOne({ email }).select('+password').exec();
  }

  public async create(dto: CreateUser): Promise<DocumentUser> {
    this.logger.info('DefaultUserRepository: Creating new user');
    const user = new UserModel(dto);
    return user.save();
  }
}
