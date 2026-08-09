import { Types } from 'mongoose';

export interface CommentInterface {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  text: string;
  rating: number;
  user: Types.ObjectId;
  offer: Types.ObjectId;
}

export type CreateComment = Omit<
  CommentInterface,
  'id' | 'createdAt' | 'updatedAt'
>;

export type CreateCommentInput = Omit<CreateComment, 'user' | 'offer'>;
