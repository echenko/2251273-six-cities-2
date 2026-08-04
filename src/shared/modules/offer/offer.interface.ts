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
}
