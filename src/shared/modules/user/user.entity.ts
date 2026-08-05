import { Document, model, Model, Schema, Types } from 'mongoose';
import { UserInterface } from './user.interface.js';

export type DocumentUser = UserInterface & Document & {
  _id: Types.ObjectId;
};

const userSchema: Schema<DocumentUser> = new Schema<DocumentUser>(
  {
    name: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    avatarUrl: {
      type: String,
      default: '',
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
        delete (ret as { password?: string }).password;
        return ret;
      },
    },
  }
);

export const UserModel: Model<DocumentUser> = model<DocumentUser>('User', userSchema);
