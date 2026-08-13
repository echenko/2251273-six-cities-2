import { injectable, inject } from 'inversify';
import { TYPES } from '../../libs/container/container.types.js';
import { LoggerInterface } from '../../libs/logger/logger.interface.js';
import { UserRepository } from './user.repository.interface.js';
import { DocumentUser } from './user.entity.js';
import { CreateUser } from './user.interface.js';
import { hash } from 'bcrypt';

export interface UserService {
  create(dto: CreateUser): Promise<DocumentUser>;
  findById(id: string): Promise<DocumentUser | null>;
  findByInternalId(internalId: string): Promise<DocumentUser | null>;
  findByEmail(email: string): Promise<DocumentUser | null>;
}

@injectable()
export class DefaultUserService implements UserService {
  constructor(
    @inject(TYPES.Logger) private readonly logger: LoggerInterface,
    @inject(TYPES.UserRepository) private readonly userRepository: UserRepository,
  ) { }

  public async create(dto: CreateUser): Promise<DocumentUser> {
    this.logger.info('DefaultUserService: Creating new user');

    // Проверяем, не существует ли уже пользователь с таким email
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new Error(`User with email ${dto.email} already exists`);
    }

    const hashedPassword = await hash(dto.password, 10);
    const userDto = { ...dto, password: hashedPassword };

    return this.userRepository.create(userDto);
  }

  public async findById(id: string): Promise<DocumentUser | null> {
    this.logger.debug(`DefaultUserService: Finding user by id ${id}`);
    return this.userRepository.findById(id);
  }

  public async findByInternalId(internalId: string): Promise<DocumentUser | null> {
    return this.userRepository.findByInternalId(internalId);
  }

  public async findByEmail(email: string): Promise<DocumentUser | null> {
    return this.userRepository.findByEmail(email);
  }
}
