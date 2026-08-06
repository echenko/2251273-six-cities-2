export interface UserInterface {
  createdAt: Date;
  updatedAt: Date;
  name: string;
  email: string;
  password: string;
  avatarUrl: string;
  type: 'regular' | 'pro';
}

export type CreateUser = Omit<UserInterface, 'createdAt' | 'updatedAt'>;
