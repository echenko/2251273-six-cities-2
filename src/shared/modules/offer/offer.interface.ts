import { Types } from 'mongoose';

export type OfferType = 'apartment' | 'house' | 'room' | 'hotel';

export type CityName =
  | 'Paris'
  | 'Cologne'
  | 'Brussels'
  | 'Amsterdam'
  | 'Hamburg'
  | 'Dusseldorf';

export interface OfferInterface {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  type: OfferType;
  price: number;
  previewImage: string;
  cityName: CityName;
  cityLatitude: number;
  cityLongitude: number;
  cityZoom: number;
  offerLatitude: number;
  offerLongitude: number;
  offerZoom: number;
  isFavorite: boolean;
  isPremium: boolean;
  rating: number;
  description: string;
  bedrooms: number;
  offerGoods: string[];
  user: Types.ObjectId;
  images: string[];
  maxAdults: number;
}

export type CreateOffer = Omit<
  OfferInterface,
  'id' | 'createdAt' | 'updatedAt'
>;

export type CreateOfferInput = Omit<CreateOffer, 'user'>;
