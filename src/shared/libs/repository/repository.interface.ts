import { Document } from 'mongoose';

export interface Repository<T extends Document> {
  findById(id: string): Promise<T | null>;
  create(dto: Partial<T>): Promise<T>;
}
