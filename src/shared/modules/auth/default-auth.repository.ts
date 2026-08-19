import { injectable, inject } from 'inversify';
import { TYPES } from '../../libs/container/container.types.js';
import { LoggerInterface } from '../../libs/logger/logger.interface.js';
import { AuthRepository } from './auth.repository.interface.js';
import { DocumentAuth, AuthModel } from './auth.entity.js';
import { CreateAuthInput } from './auth.interface.js';

@injectable()
export class DefaultAuthRepository implements AuthRepository {
  constructor(
    @inject(TYPES.Logger) private readonly logger: LoggerInterface,
  ) {}

  public async findById(id: string): Promise<DocumentAuth | null> {
    this.logger.debug('DefaultAuthRepository: Searching for auth by public id');
    return AuthModel.findOne({ id }).exec();
  }

  public async findByToken(token: string): Promise<DocumentAuth | null> {
    this.logger.debug('DefaultAuthRepository: Searching for auth by token');
    return AuthModel.findOne({ token }).exec();
  }

  public async findByUserId(userId: string): Promise<DocumentAuth[]> {
    this.logger.debug('DefaultAuthRepository: Searching for auths by userId');
    return AuthModel.find({ userId }).exec();
  }

  public async create(dto: CreateAuthInput): Promise<DocumentAuth> {
    this.logger.info('DefaultAuthRepository: Creating new auth session');
    const auth = new AuthModel({
      ...dto,
      userAgent: dto.userAgent ?? '',
      ip: dto.ip ?? '',
    });
    return auth.save();
  }

  public async revokeByToken(token: string): Promise<DocumentAuth | null> {
    this.logger.info('DefaultAuthRepository: Revoking auth by token');
    return AuthModel.findOneAndUpdate(
      { token },
      { isRevoked: true },
      { new: true },
    ).exec();
  }

  public async revokeAllByUserId(userId: string): Promise<number> {
    this.logger.info(
      `DefaultAuthRepository: Revoking all auths for userId ${userId}`,
    );
    const result = await AuthModel.updateMany(
      { userId, isRevoked: false },
      { isRevoked: true },
    ).exec();
    return result.modifiedCount;
  }
}
