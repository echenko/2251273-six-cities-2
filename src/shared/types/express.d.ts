import 'express';

declare module 'express-serve-static-core' {
  interface Request {
    tokenUserId?: string;
    tokenEmail?: string;
  }
}
