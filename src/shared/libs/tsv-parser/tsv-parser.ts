import { OffersItemType } from '../../types/index.type.js';

export class TSVParser {
  public parse(line: string): OffersItemType {
    const columns = line.split('\t');

    if (columns.length !== 15) {
      throw new Error(`Invalid line format: ${line}`);
    }

    const [
      id, title, type, price, previewImage,
      cityName, cityLat, cityLng, cityZoom,
      locLat, locLng, locZoom,
      isFavorite, isPremium, rating
    ] = columns;

    return {
      id,
      title,
      type: type as OffersItemType['type'],
      price: Number(price),
      previewImage,
      city: {
        name: cityName,
        location: {
          latitude: Number(cityLat),
          longitude: Number(cityLng),
          zoom: Number(cityZoom),
        },
      },
      location: {
        latitude: Number(locLat),
        longitude: Number(locLng),
        zoom: Number(locZoom),
      },
      isFavorite: isFavorite === 'true',
      isPremium: isPremium === 'true',
      rating: Number(rating),
    };
  }
}
