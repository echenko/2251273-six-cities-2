import { Types } from 'mongoose';

export interface OfferInterface {
  id: string;
  title: string;
  type: string;
  price: number;
  previewImage: string;
  cityName: string;
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
