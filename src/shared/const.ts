const OFFER_PRICE = {
  min: 100,
  max: 100000,
};

const OFFER_RATING = {
  min: 1,
  max: 5,
};

const OFFER_TYPES = ['apartment', 'house','room','hotel'];

const OFFER_TYPE_DEFAULT = OFFER_TYPES[0];

const OFFER_CITIES_NAMES = ['Paris', 'Cologne', 'Brussels', 'Amsterdam', 'Hamburg', 'Dusseldorf'];

const OFFER_CITY_DEFAULT = OFFER_CITIES_NAMES[0];

const TSV_FIELDS_OFFER = [
  'id',
  'title',
  'type',
  'price',
  'previewImage',
  'city.name',
  'city.location.latitude',
  'city.location.longitude',
  'city.location.zoom',
  'location.latitude',
  'location.longitude',
  'location.zoom',
  'isFavorite',
  'isPremium',
  'rating',
];

export {
  OFFER_PRICE,
  OFFER_RATING,
  OFFER_TYPES,
  OFFER_TYPE_DEFAULT,
  OFFER_CITIES_NAMES,
  OFFER_CITY_DEFAULT,
  TSV_FIELDS_OFFER,
};
