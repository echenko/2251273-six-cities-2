import { Document, model, Model, Schema, Types } from 'mongoose';
import { UserInterface } from './user.interface.js';

export type DocumentUser = UserInterface & Document & {
  _id: Types.ObjectId;
};

const userSchema: Schema<DocumentUser> = new Schema<DocumentUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    avatarPath: {
      type: String,
      default: '',
    },
    firstname: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 15,
    },
    lastname: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 15,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    type: {
      type: String,
      required: true,
      enum: ['regular', 'pro'],
      default: 'regular',
    },
  },
  {
    timestamps: true,
    collection: 'users',
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.password;
        return ret;
      },
    },
  }
);

export const UserModel: Model<DocumentUser> = model<DocumentUser>('User', userSchema);
