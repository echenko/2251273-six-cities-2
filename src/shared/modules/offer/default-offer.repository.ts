import { injectable, inject } from 'inversify';
import { TYPES } from '../../libs/container/container.types.js';
import { LoggerInterface } from '../../libs/logger/logger.interface.js';
import { OfferRepository } from './offer.repository.interface.js';
import { DocumentOffer, OfferModel } from './offer.entity.js';
import { CityName, CreateOffer } from './offer.interface.js';

@injectable()
export class DefaultOfferRepository implements OfferRepository {
  constructor(
    @inject(TYPES.Logger) private readonly logger: LoggerInterface,
  ) { }

  /**
   * Ищет оффер по публичному строковому id.
   */
  public async findById(id: string): Promise<DocumentOffer | null> {
    this.logger.debug(
      `DefaultOfferRepository: Searching for offer by ID ${id}`,
    );

    return OfferModel.findOne({ id }).populate('user').exec();
  }

  public async create(dto: CreateOffer): Promise<DocumentOffer> {
    this.logger.info('DefaultOfferRepository: Creating new offer');

    const offer = new OfferModel(dto);

    return offer.save();
  }

  /**
   * Важно:
   * userId здесь — это Mongo _id пользователя, а не его публичный id.
   */
  public async findByUserId(userId: string): Promise<DocumentOffer[]> {
    this.logger.debug(
      `DefaultOfferRepository: Searching offers by user ID ${userId}`,
    );

    return OfferModel.find({ user: userId })
      .populate('user')
      .sort({ createdAt: -1 })
      .exec();
  }

  public async findByCity(city: CityName): Promise<DocumentOffer[]> {
    this.logger.debug(
      `DefaultOfferRepository: Searching offers in city ${city}`,
    );

    return OfferModel.find({ cityName: city })
      .populate('user')
      .sort({ createdAt: -1 })
      .exec();
  }

  public async findAll(limit: number = 60): Promise<DocumentOffer[]> {
    this.logger.debug(
      `DefaultOfferRepository: Fetching all offers (limit: ${limit})`,
    );

    return OfferModel.find()
      .populate('user')
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  /**
   * Удаляет оффер по публичному строковому id.
   */
  public async deleteById(id: string): Promise<boolean> {
    this.logger.info(
      `DefaultOfferRepository: Deleting offer by ID ${id}`,
    );

    const result = await OfferModel.deleteOne({ id }).exec();

    return result.deletedCount > 0;
  }
}
