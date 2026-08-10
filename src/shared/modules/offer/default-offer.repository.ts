import { injectable, inject } from 'inversify';
import { Types } from 'mongoose';
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

  public async deleteById(id: string): Promise<boolean> {
    this.logger.info(
      `DefaultOfferRepository: Deleting offer by ID ${id}`,
    );

    const result = await OfferModel.deleteOne({ id }).exec();

    return result.deletedCount > 0;
  }

  public async updateStats(
    internalId: string,
    rating: number,
    commentsCount: number,
  ): Promise<DocumentOffer | null> {
    this.logger.debug(
      `DefaultOfferRepository: Updating stats for offer ${internalId} (rating: ${rating}, comments: ${commentsCount})`,
    );

    if (!Types.ObjectId.isValid(internalId)) {
      return null;
    }

    return OfferModel.findByIdAndUpdate(
      internalId,
      { rating, commentsCount },
      { new: true },
    ).exec();
  }
}
