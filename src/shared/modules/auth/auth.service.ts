import { inject, injectable } from 'inversify';
import { compare } from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { TYPES } from '../../libs/container/container.types.js';
import { LoggerInterface } from '../../libs/logger/logger.interface.js';
import { RestConfig } from '../../libs/config/index.js';
import { AuthRepository } from './auth.repository.interface.js';
import { UserRepository } from '../user/user.repository.interface.js';
import { DocumentAuth } from './auth.entity.js';
import { CreateAuthInput, PublicAuth } from './auth.interface.js';
import { PublicUser } from '../user/user.interface.js';
import { LoginDto } from './auth.dto.js';

export interface LoginResult {
  token: string;
  user: PublicUser;
}

export interface TokenPayload {
  userId: string;
  email: string;
}

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly status: number = 401,
  ) {
    super(message);
  }
}

@injectable()
export class AuthService {
  constructor(
    @inject(TYPES.Logger) private readonly logger: LoggerInterface,
    @inject(TYPES.AuthRepository) private readonly authRepository: AuthRepository,
    @inject(TYPES.UserRepository) private readonly userRepository: UserRepository,
    @inject(TYPES.Config) private readonly config: RestConfig,
  ) {}

  public async login(
    dto: LoginDto,
    meta: { userAgent?: string; ip?: string },
  ): Promise<LoginResult> {
    this.logger.info(`AuthService: login attempt for ${dto.email}`);

    const user = await this.userRepository.findByEmailForAuth(dto.email);
    if (!user) {
      throw new AuthError('Invalid email or password', 401);
    }

    const passwordMatch = await compare(dto.password, user.password);
    if (!passwordMatch) {
      throw new AuthError('Invalid email or password', 401);
    }

    const secret = this.config.get('jwtSecret');
    const expiresIn = this.config.get('jwtExpiresIn');

    const signOptions: SignOptions = {
      expiresIn: expiresIn as unknown as SignOptions['expiresIn'],
    };

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      secret,
      signOptions,
    );

    const decoded = jwt.decode(token) as { exp: number } | null;
    const expiresAt = decoded
      ? new Date(decoded.exp * 1000)
      : new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.authRepository.create({
      userId: user.id,
      token,
      expiresAt,
      userAgent: meta.userAgent,
      ip: meta.ip,
    } satisfies CreateAuthInput);

    const publicUser = this.toPublicUser(user);
    this.logger.info(`AuthService: user ${user.id} logged in`);

    return { token, user: publicUser };
  }

  public async verifyToken(token: string): Promise<TokenPayload | null> {
    try {
      const secret = this.config.get('jwtSecret');
      const payload = jwt.verify(token, secret) as TokenPayload;

      const auth = await this.authRepository.findByToken(token);
      if (!auth || auth.isRevoked) {
        return null;
      }
      return payload;
    } catch {
      return null;
    }
  }

  public async revoke(token: string): Promise<PublicAuth | null> {
    this.logger.info('AuthService: Revoking auth session');
    const auth = await this.authRepository.revokeByToken(token);
    if (!auth) {
      return null;
    }
    return this.toPublicAuth(auth);
  }

  public async revokeAll(userId: string): Promise<number> {
    this.logger.info(`AuthService: Revoking all sessions for user ${userId}`);
    return this.authRepository.revokeAllByUserId(userId);
  }

  public async findById(id: string): Promise<PublicAuth | null> {
    this.logger.debug('AuthService: Searching auth by public id');
    const auth = await this.authRepository.findById(id);
    if (!auth) {
      return null;
    }
    return this.toPublicAuth(auth);
  }

  private toPublicAuth(auth: DocumentAuth): PublicAuth {
    const publicAuth = auth.toJSON() as Record<string, unknown>;
    delete publicAuth.token;
    return publicAuth as PublicAuth;
  }

  private toPublicUser(user: { toJSON: () => Record<string, unknown> }): PublicUser {
    const obj = user.toJSON();
    delete obj.password;
    return obj as PublicUser;
  }
}
