import { Repository } from '../../libs/repository/repository.interface.js';
import { DocumentUser } from './user.entity.js';
import { CreateUser } from './user.interface.js';

export interface UserRepository extends Repository<DocumentUser> {
  findById(id: string): Promise<DocumentUser | null>;
  findByInternalId(internalId: string): Promise<DocumentUser | null>;
  findByEmail(email: string): Promise<DocumentUser | null>;
  findByEmailForAuth(email: string): Promise<DocumentUser | null>;
  create(dto: CreateUser): Promise<DocumentUser>;
}
