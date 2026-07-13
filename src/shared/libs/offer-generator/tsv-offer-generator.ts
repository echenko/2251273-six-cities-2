import { OfferGenerator } from './offer-generator.interface.js';
import { MockServerDataType } from './../../types/index.type.js';
import { v4 } from 'uuid';
import { generateRandomValue, getRandomItem } from './../../helpers/index.js';
import { OFFER_PRICE, OFFER_RATING } from './../../const.js';

export class TSVOfferGenerator implements OfferGenerator {
  constructor(private readonly mockData: MockServerDataType) { }

  generate(): string {
    const { titles, types, cites, locations, previewImages } = this.mockData;

    const id = v4();
    const title = getRandomItem(titles);
    const type = getRandomItem(types);
    const cityName = getRandomItem(cites);

    const cityLocation = locations[cityName] ?? { latitude: 0, longitude: 0, zoom: 0 };
    const previewImage = getRandomItem(previewImages);

    const price = generateRandomValue(OFFER_PRICE.min, OFFER_PRICE.max);
    const rating = generateRandomValue(OFFER_RATING.min, OFFER_RATING.max, 1).toFixed(1);
    const isFavorite = getRandomItem([true, false]);
    const isPremium = getRandomItem([true, false]);

    return [
      id,
      title,
      type,
      price,
      cityName,
      `${cityLocation.latitude},${cityLocation.longitude}`,
      String(isFavorite),
      String(isPremium),
      rating,
      previewImage
    ].join('\t');
  }
}
