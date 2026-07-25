export interface UserInterface {
  createdAt: Date;
  updatedAt: Date;
  email: string;
  avatarPath?: string;
  firstname: string;
  lastname: string;
  password?: string;
  type: 'regular' | 'pro';
}
