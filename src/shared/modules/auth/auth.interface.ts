export interface AuthInterface {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  isRevoked: boolean;
  userAgent: string;
  ip: string;
  createdAt: Date;
  updatedAt: Date;
}

export type PublicAuth = Omit<AuthInterface, 'token'>;

export interface CreateAuthInput {
  userId: string;
  token: string;
  expiresAt: Date;
  userAgent?: string;
  ip?: string;
}
