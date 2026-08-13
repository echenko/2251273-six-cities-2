import { injectable, inject } from 'inversify';
import { Types } from 'mongoose';
import { TYPES } from '../../libs/container/container.types.js';
import { LoggerInterface } from '../../libs/logger/logger.interface.js';
import { CommentRepository } from './comment.repository.interface.js';
import { OfferRepository } from '../offer/offer.repository.interface.js';
import { DocumentComment } from './comment.entity.js';
import { CreateCommentInput } from './comment.interface.js';

export interface CommentService {
  create(
    publicOfferId: string,
    dto: CreateCommentInput,
    userId: string,
  ): Promise<DocumentComment>;
  findByOfferId(publicOfferId: string): Promise<DocumentComment[]>;
  findById(id: string): Promise<DocumentComment | null>;
  deleteById(id: string): Promise<boolean>;
}

@injectable()
export class DefaultCommentService implements CommentService {
  constructor(
    @inject(TYPES.Logger) private readonly logger: LoggerInterface,
    @inject(TYPES.CommentRepository) private readonly commentRepository: CommentRepository,
    @inject(TYPES.OfferRepository) private readonly offerRepository: OfferRepository,
  ) {}

  public async create(
    publicOfferId: string,
    dto: CreateCommentInput,
    userId: string,
  ): Promise<DocumentComment> {
    this.logger.info(`DefaultCommentService: Creating comment for offer ${publicOfferId}`);

    const offer = await this.offerRepository.findById(publicOfferId);
    if (!offer) {
      throw new Error(`Offer with id ${publicOfferId} not found`);
    }

    const comment = await this.commentRepository.create({
      text: dto.text,
      rating: dto.rating,
      offer: offer._id,
      user: new Types.ObjectId(userId),
    });

    await this.recalculateOfferStats(offer._id.toString());

    return comment;
  }

  public async findByOfferId(publicOfferId: string): Promise<DocumentComment[]> {
    this.logger.debug(`DefaultCommentService: Finding comments for offer ${publicOfferId}`);

    const offer = await this.offerRepository.findById(publicOfferId);
    if (!offer) {
      throw new Error(`Offer with id ${publicOfferId} not found`);
    }

    return this.commentRepository.findByOfferId(offer._id.toString());
  }

  public async findById(id: string): Promise<DocumentComment | null> {
    this.logger.debug(`DefaultCommentService: Finding comment by id ${id}`);
    return this.commentRepository.findById(id);
  }

  public async deleteById(id: string): Promise<boolean> {
    this.logger.info(`DefaultCommentService: Deleting comment ${id}`);

    const comment = await this.commentRepository.findById(id);
    if (!comment) {
      return false;
    }

    const offerInternalId = comment.offer.toString();

    const result = await this.commentRepository.deleteById(id);

    if (result) {
      await this.recalculateOfferStats(offerInternalId);
    }

    return result;
  }

  private async recalculateOfferStats(offerInternalId: string): Promise<void> {

    const comments = await this.commentRepository.findByOfferId(offerInternalId);

    const rating = comments.length > 0
      ? comments.reduce((sum, c) => sum + c.rating, 0) / comments.length
      : 0;

    const commentsCount = comments.length;

    this.logger.debug(
      `DefaultCommentService: Recalculated offer ${offerInternalId}: rating=${rating.toFixed(2)}, comments=${commentsCount}`,
    );

    await this.offerRepository.updateStats(offerInternalId, rating, commentsCount);
  }
}
