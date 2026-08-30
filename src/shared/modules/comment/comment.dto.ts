import { z } from 'zod';

export const createCommentSchema = z.object({
  text: z
    .string()
    .trim()
    .min(5, 'Comment text must be at least 5 characters long')
    .max(1024, 'Comment text must be at most 1024 characters long'),
  rating: z
    .number({ error: 'Rating must be a number' })
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
});

export type CreateCommentDto = z.infer<typeof createCommentSchema>;
