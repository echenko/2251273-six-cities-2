import { Repository } from '../../libs/repository/repository.interface.js';
import { DocumentOffer } from './offer.entity.js';

// Расширяем базовый интерфейс специфичными для офферов методами
export interface OfferRepository extends Repository<DocumentOffer> {
  // Найти все офферы конкретного пользователя
  findByUserId(userId: string): Promise<DocumentOffer[]>;

  // Найти все офферы в определённом городе
  findByCity(city: string): Promise<DocumentOffer[]>;

  // Найти все офферы (с возможностью пагинации)
  findAll(limit?: number): Promise<DocumentOffer[]>;

  // Удалить оффер по ID
  deleteById(id: string): Promise<boolean>;
}
