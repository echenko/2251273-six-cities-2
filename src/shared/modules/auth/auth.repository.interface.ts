import { Repository } from '../../libs/repository/repository.interface.js';
import { DocumentAuth } from './auth.entity.js';
import { CreateAuthInput } from './auth.interface.js';

export interface AuthRepository extends Repository<DocumentAuth> {
  findById(id: string): Promise<DocumentAuth | null>;
  findByToken(token: string): Promise<DocumentAuth | null>;
  findByUserId(userId: string): Promise<DocumentAuth[]>;
  create(dto: CreateAuthInput): Promise<DocumentAuth>;
  revokeByToken(token: string): Promise<DocumentAuth | null>;
  revokeAllByUserId(userId: string): Promise<number>;
}
