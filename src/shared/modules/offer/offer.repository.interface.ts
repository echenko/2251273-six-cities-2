import { Repository } from '../../libs/repository/repository.interface.js';
import { DocumentOffer } from './offer.entity.js';
import { CityName, CreateOffer } from './offer.interface.js';

export interface OfferRepository extends Repository<DocumentOffer> {
  findByUserId(userId: string): Promise<DocumentOffer[]>;
  findByCity(city: CityName): Promise<DocumentOffer[]>;
  findAll(limit?: number): Promise<DocumentOffer[]>;
  deleteById(id: string): Promise<boolean>;
  create(dto: CreateOffer): Promise<DocumentOffer>;
  updateStats(id: string, rating: number, commentsCount: number): Promise<DocumentOffer | null>;
}
