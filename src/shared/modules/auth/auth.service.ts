import { injectable, inject } from 'inversify';
import { compare } from 'bcrypt';
import jwt from 'jsonwebtoken';
import { TYPES } from '../../libs/container/container.types.js';
import { LoggerInterface } from '../../libs/logger/logger.interface.js';
import { UserRepository } from '../user/user.repository.interface.js';
import { DocumentUser } from '../user/user.entity.js';

export interface AuthService {
  login(email: string, password: string): Promise<{ token: string; user: DocumentUser }>;
}

@injectable()
export class DefaultAuthService implements AuthService {
  constructor(
    @inject(TYPES.Logger) private readonly logger: LoggerInterface,
    @inject(TYPES.UserRepository) private readonly userRepository: UserRepository,
  ) {}

  public async login(email: string, password: string): Promise<{ token: string; user: DocumentUser }> {
    this.logger.info(`DefaultAuthService: Login attempt for ${email}`);

    const user = await this.userRepository.findByEmailForAuth(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isValid = await compare(password, user.password);
    if (!isValid) {
      throw new Error('Invalid email or password');
    }

    const secret = process.env.JWT_SECRET || 'default-secret-key-change-in-production';
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      secret,
      { expiresIn: '7d' }
    );

    return { token, user };
  }
}
