import { Repository } from '../../libs/repository/repository.interface.js';
import { DocumentOffer } from './offer.entity.js';
import { OfferInterface } from './offer.interface.js';

export interface OfferRepository extends Repository<DocumentOffer> {
  findByUserId(userId: string): Promise<DocumentOffer[]>;
  findByCity(city: string): Promise<DocumentOffer[]>;
  findAll(limit?: number): Promise<DocumentOffer[]>;
  deleteById(id: string): Promise<boolean>;
  create(dto: OfferInterface): Promise<DocumentOffer>;
}
