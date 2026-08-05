import { LocationType, CityType, UserType } from './index.type.js';

export type OffersItemType = {
  id: string;
  title: string;
  type: string;
  price: number;
  previewImage: string;
  city: CityType;
  location: LocationType;
  isFavorite: boolean;
  isPremium: boolean;
  rating: number;
  description: string;
  bedrooms: number;
  goods: string[];
  host: UserType;
  images: string[];
  maxAdults: number;
}
