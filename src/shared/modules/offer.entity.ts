import { Document, model, Schema } from 'mongoose';

export interface OfferEntity extends Document {
  title: string;
  price: number;
  city: string;
  createdAt: Date;
}

const offerSchema = new Schema<OfferEntity>(
  {
    title: { type: String, required: true, minlength: 10, maxlength: 100 },
    price: { type: Number, required: true, min: 100, max: 100000 },
    city: { type: String, required: true },
  },
  { timestamps: true, collection: 'offers' }
);

export const OfferModel = model<OfferEntity>('Offer', offerSchema);
