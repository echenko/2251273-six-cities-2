import { Repository } from '../../libs/repository/repository.interface.js';
import { DocumentOffer } from './offer.entity.js';
import { CityName, CreateOffer } from './offer.interface.js';

export interface OfferRepository extends Repository<DocumentOffer> {
  findById(id: string): Promise<DocumentOffer | null>;
  findByInternalId(internalId: string): Promise<DocumentOffer | null>;
  findByUserId(userId: string, limit?: number): Promise<DocumentOffer[]>;
  findByCity(city: CityName): Promise<DocumentOffer[]>;
  findAll(limit?: number): Promise<DocumentOffer[]>;
  deleteById(id: string): Promise<boolean>;
  create(dto: CreateOffer): Promise<DocumentOffer>;
  updateStats(offerId: string, rating: number, commentsCount: number): Promise<DocumentOffer | null>;
}
