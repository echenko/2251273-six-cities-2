import { injectable, inject } from 'inversify';
import { TYPES } from '../../libs/container/container.types.js';
import { LoggerInterface } from '../../libs/logger/logger.interface.js';
import { OfferRepository } from './offer.repository.interface.js';
import { UserRepository } from '../user/user.repository.interface.js';
import { DocumentOffer } from './offer.entity.js';
import { CityName, CreateOfferInput } from './offer.interface.js';

export interface OfferService {
  create(publicUserId: string, dto: CreateOfferInput): Promise<DocumentOffer>;
  findById(id: string): Promise<DocumentOffer | null>;
  findAll(limit?: number): Promise<DocumentOffer[]>;
  findByCity(city: CityName): Promise<DocumentOffer[]>;
  findByUserId(publicUserId: string, limit?: number): Promise<DocumentOffer[]>;
  deleteById(id: string): Promise<boolean>;
}

@injectable()
export class DefaultOfferService implements OfferService {
  constructor(
    @inject(TYPES.Logger) private readonly logger: LoggerInterface,
    @inject(TYPES.OfferRepository) private readonly offerRepository: OfferRepository,
    @inject(TYPES.UserRepository) private readonly userRepository: UserRepository,
  ) {}

  public async create(publicUserId: string, dto: CreateOfferInput): Promise<DocumentOffer> {
    this.logger.info(`DefaultOfferService: Creating offer for user ${publicUserId}`);
    const user = await this.userRepository.findById(publicUserId);
    if (!user) {
      throw new Error(`User with id ${publicUserId} not found`);
    }
    return this.offerRepository.create({
      ...dto,
      user: user._id,
    });
  }

  public async findById(id: string): Promise<DocumentOffer | null> {
    return this.offerRepository.findById(id);
  }

  public async findAll(limit?: number): Promise<DocumentOffer[]> {
    return this.offerRepository.findAll(limit);
  }

  public async findByCity(city: CityName): Promise<DocumentOffer[]> {
    return this.offerRepository.findByCity(city);
  }

  public async findByUserId(publicUserId: string, limit: number = 60): Promise<DocumentOffer[]> {
    const user = await this.userRepository.findById(publicUserId);
    if (!user) {
      throw new Error(`User with id ${publicUserId} not found`);
    }
    return this.offerRepository.findByUserId(user._id.toString(), limit);
  }

  public async deleteById(id: string): Promise<boolean> {
    this.logger.info(`DefaultOfferService: Deleting offer ${id}`);
    return this.offerRepository.deleteById(id);
  }
}
