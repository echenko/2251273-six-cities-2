import { OffersItemType } from '../../types/index.type.js';
import {
  OFFER_TYPES,
  OFFER_CITIES_NAMES,
  OFFER_CITY_DEFAULT,
  OFFER_TYPE_DEFAULT,
  TSV_FIELDS_OFFER,
} from '../../const.js';

export class TSVParser {
  public parse(line: string): OffersItemType {
    const columns = line.split('\t');

    if (columns.length !== TSV_FIELDS_OFFER.length) {
      throw new Error(`Invalid line format: ${line}`);
    }

    const [
      id,
      title,
      type,
      price,
      previewImage,
      cityName,
      cityLat,
      cityLng,
      cityZoom,
      locLat,
      locLng,
      locZoom,
      isFavorite,
      isPremium,
      rating,
      description,
      bedrooms,
      goods,
      hostName,
      hostAvatarUrl,
      hostIsPro,
      images,
      maxAdults,
    ] = columns;

    return {
      id,
      title,
      type: (OFFER_TYPES as readonly string[]).includes(type)
        ? (type as OffersItemType['type'])
        : (OFFER_TYPE_DEFAULT as OffersItemType['type']),

      price: Number(price),
      previewImage,

      city: {
        name: (OFFER_CITIES_NAMES as readonly string[]).includes(cityName)
          ? (cityName as OffersItemType['city']['name'])
          : (OFFER_CITY_DEFAULT as OffersItemType['city']['name']),

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
      description,
      bedrooms: Number(bedrooms),

      goods: goods ? goods.split(',') : [],

      host: {
        name: hostName,
        avatarUrl: hostAvatarUrl,
        isPro: hostIsPro === 'true',
      },

      images: images ? images.split(',') : [],

      maxAdults: Number(maxAdults),
    };
  }
}
