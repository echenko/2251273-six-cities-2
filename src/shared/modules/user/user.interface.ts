export type UserType = 'regular' | 'pro';

export interface UserInterface {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  email: string;
  password: string;
  avatarUrl: string;
  type: UserType;
}

export type CreateUser = Omit<UserInterface, 'id' | 'createdAt' | 'updatedAt'>;
