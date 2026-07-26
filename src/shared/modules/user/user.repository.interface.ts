import { Repository } from '../../libs/repository/repository.interface.js';
import { DocumentUser } from './user.entity.js';

export interface UserRepository extends Repository<DocumentUser> {
  findByEmail(email: string): Promise<DocumentUser | null>;
}
