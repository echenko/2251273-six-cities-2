import { Document, model, Model, Schema } from 'mongoose';
import { OfferInterface } from './index.js';

export type DocumentOffer = OfferInterface & Document;

export const offerSchema = new Schema<DocumentOffer>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 100,
    },
    type: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 100,
      max: 100000,
    },
    previewImage: {
      type: String,
      required: true,
    },
    cityName: {
      type: String,
      required: true,
    },
    cityLatitude: {
      type: Number,
    },
    cityLongitude: {
      type: Number,
    },
    cityZoom: {
      type: Number,
    },
    offerLatitude: {
      type: Number,
      required: true,
    },
    offerLongitude: {
      type: Number,
      required: true,
    },
    offerZoom: {
      type: Number,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 0,
      min: 1,
      max: 5,
    }
  },
  {
    timestamps: true,
    collection: 'offers',
  }
);

export const OfferModel: Model<DocumentOffer> = model<DocumentOffer>('Offer', offerSchema);
