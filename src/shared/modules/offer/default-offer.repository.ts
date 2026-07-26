import { injectable, inject } from 'inversify';
import { TYPES } from '../../libs/container/container.types.js';
import { LoggerInterface } from '../../libs/logger/logger.interface.js';
import { OfferRepository } from './offer.repository.interface.js';
import { DocumentOffer, OfferModel } from './offer.entity.js';

@injectable()
export class DefaultOfferRepository implements OfferRepository {
  constructor(
    @inject(TYPES.Logger) private readonly logger: LoggerInterface
  ) {}

  public async findById(id: string): Promise<DocumentOffer | null> {
    this.logger.info(`DefaultOfferRepository: Searching for offer by ID ${id}`);
    return OfferModel.findById(id).populate('user').exec();
  }

  public async create(dto: Partial<DocumentOffer>): Promise<DocumentOffer> {
    this.logger.info('DefaultOfferRepository: Creating new offer');
    const offer = new OfferModel(dto);
    return offer.save();
  }

  public async findByUserId(userId: string): Promise<DocumentOffer[]> {
    this.logger.info(`DefaultOfferRepository: Searching offers by user ID ${userId}`);
    return OfferModel.find({ user: userId })
      .sort({ createdAt: -1 }) // Новые первыми
      .exec();
  }

  public async findByCity(city: string): Promise<DocumentOffer[]> {
    this.logger.info(`DefaultOfferRepository: Searching offers in city ${city}`);
    return OfferModel.find({ city })
      .populate('user')
      .sort({ createdAt: -1 })
      .exec();
  }

  public async findAll(limit: number = 60): Promise<DocumentOffer[]> {
    this.logger.info(`DefaultOfferRepository: Fetching all offers (limit: ${limit})`);
    return OfferModel.find()
      .populate('user')
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  public async deleteById(id: string): Promise<boolean> {
    this.logger.info(`DefaultOfferRepository: Deleting offer by ID ${id}`);
    const result = await OfferModel.deleteOne({ _id: id }).exec();
    return result.deletedCount > 0;
  }
}
