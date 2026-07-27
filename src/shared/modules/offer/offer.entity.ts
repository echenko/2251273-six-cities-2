import { Document, model, Model, Schema, Types } from 'mongoose';
import { OfferInterface } from './offer.interface.js';

export type DocumentOffer = Omit<OfferInterface, 'user'> & Document & {
  _id: Types.ObjectId;
  user: Types.ObjectId;
};

export const offerSchema = new Schema<DocumentOffer>(
  {
    title: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      minlength: 20,
      maxlength: 1024,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    city: {
      type: String,
      required: true,
      enum: ['Paris', 'Cologne', 'Brussels', 'Amsterdam', 'Hamburg', 'Dusseldorf'],
    },
    preview: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      required: true,
      validate: {
        validator: (arr: string[]) => arr.length >= 1 && arr.length <= 6,
        message: 'Images array must contain between 1 and 6 items',
      },
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 0,
      min: 1,
      max: 5,
    },
    type: {
      type: String,
      required: true,
      enum: ['apartment', 'house', 'room', 'hotel'],
    },
    rooms: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    maxPeople: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    price: {
      type: Number,
      required: true,
      min: 100,
      max: 100000,
    },
    features: {
      type: [String],
      required: true,
      validate: {
        validator: (arr: string[]) =>
          arr.every((item) =>
            [
              'Breakfast',
              'Air conditioning',
              'Laptop friendly workspace',
              'Baby seat',
              'Washer',
              'Towels',
              'Fridge',
            ].includes(item)
          ),
        message: 'Invalid feature value',
      },
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
  },
  {
    timestamps: true,
    collection: 'offers',
  }
);

export const OfferModel: Model<DocumentOffer> = model<DocumentOffer>('Offer', offerSchema);
