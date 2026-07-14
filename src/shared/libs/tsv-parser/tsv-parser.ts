import { ParserInterface } from './tsv-parser.interface.js';
import { OffersItemType } from '../../types/index.type.js';
import { TSV_FIELDS_OFFER } from '../../const.js';
import { setNestedValue } from '../../helpers/index.js';

const NUMERIC_FIELDS = new Set([
  'price',
  'city.location.latitude',
  'city.location.longitude',
  'city.location.zoom',
  'location.latitude',
  'location.longitude',
  'location.zoom',
  'rating',
]);

const BOOLEAN_FIELDS = new Set([
  'isFavorite',
  'isPremium',
]);

export class TSVParser implements ParserInterface {

  public parse(line: string): OffersItemType {
    const fields = line.split('\t');

    if (fields.length !== TSV_FIELDS_OFFER.length) {
      throw new Error(
        `Invalid TSV row: expected ${TSV_FIELDS_OFFER.length} fields, got ${fields.length}`
      );
    }

    return this.buildOffer(fields);
  }

  private buildOffer(fields: string[]): OffersItemType {
    const result: Record<string, unknown> = {};

    TSV_FIELDS_OFFER.forEach((field, index) => {
      const rawValue = fields[index];
      const value = this.convertValue(field, rawValue);
      setNestedValue(result, field, value);
    });

    return result as OffersItemType;
  }

  private convertValue(field: string, rawValue: string): unknown {
    if (NUMERIC_FIELDS.has(field)) {
      return Number(rawValue);
    }
    if (BOOLEAN_FIELDS.has(field)) {
      return rawValue === 'true';
    }
    return rawValue;
  }
}
