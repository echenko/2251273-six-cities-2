import { Document, model, Model, Schema, Types } from 'mongoose';
import { generateId } from '../../helpers/index.js';
import { AuthInterface } from './auth.interface.js';

export type DocumentAuth = AuthInterface &
  Document & {
    _id: Types.ObjectId;
  };

const authSchema: Schema<DocumentAuth> = new Schema<DocumentAuth>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      default: () => generateId(),
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isRevoked: {
      type: Boolean,
      required: true,
      default: false,
    },
    userAgent: {
      type: String,
      trim: true,
      default: '',
    },
    ip: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    id: false,
    timestamps: true,
    collection: 'auths',
    autoIndex: false,
    toJSON: {
      transform: (_doc, ret) => {
        const result = ret as Record<string, unknown>;
        delete result.token;
        delete result._id;
        delete result.__v;
        return result;
      },
    },
  },
);

export const AuthModel: Model<DocumentAuth> = model<DocumentAuth>(
  'Auth',
  authSchema,
);
