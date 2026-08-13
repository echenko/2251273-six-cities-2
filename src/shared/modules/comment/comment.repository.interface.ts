import { Repository } from '../../libs/repository/repository.interface.js';
import { DocumentComment } from './comment.entity.js';
import { CreateComment } from './comment.interface.js';

export interface CommentRepository extends Repository<DocumentComment> {
  findByOfferId(offerId: string): Promise<DocumentComment[]>;
  findById(id: string): Promise<DocumentComment | null>;
  deleteById(id: string): Promise<boolean>;
  create(dto: CreateComment): Promise<DocumentComment>;
}
