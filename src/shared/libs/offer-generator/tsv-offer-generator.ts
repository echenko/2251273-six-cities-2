import { OfferGenerator } from './offer-generator.interface.js';
import { MockServerDataType, OffersItemType } from './../../types/index.type.js';
import { v4 } from 'uuid';
import { generateRandomValue, getRandomItem } from './../../helpers/index.js';
import { OFFER_PRICE, OFFER_RATING } from './../../const.js';

export class TSVOfferGenerator implements OfferGenerator {
  constructor(private readonly mockData: MockServerDataType) { }

  generate(): string {
    const {
      titles,
      types,
      cites,
      locations,
      previewImages,
    } = this.mockData;

    const id = v4();
    const title = titles[Math.floor(Math.random() * titles.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const city = cites[Math.floor(Math.random() * cites.length)];
    const location = locations[city];
    const previewImage = previewImages[Math.floor(Math.random() * previewImages.length)];

    const offer: OffersItemType = {
      id,
      title,
      type,
      price: generateRandomValue(OFFER_PRICE.min, OFFER_PRICE.max),
      city: {
        name: city,
        location: { ...location, zoom: 13 },
      },
      location: { ...location, zoom: 16 },
      isFavorite: getRandomItem([true, false]),
      isPremium: getRandomItem([true, false]),
      rating: generateRandomValue(OFFER_RATING.min, OFFER_RATING.max, 1),
      previewImage,
    };

    return JSON.stringify(offer);
  }
}
