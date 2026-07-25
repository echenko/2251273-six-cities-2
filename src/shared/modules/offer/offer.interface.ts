export interface OfferInterface {
  createdAt: Date;
  updatedAt: Date;
  title: string;
  description: string;
  city: string;
  preview: string;
  images: string[];
  isPremium: boolean;
  isFavorite: boolean;
  rating: number;
  type: 'apartment' | 'house' | 'room' | 'hotel';
  rooms: number;
  maxPeople: number;
  price: number;
  features: string[];
  user: string;
  commentsCount: number;
  location: {
    latitude: number;
    longitude: number;
  };
}
