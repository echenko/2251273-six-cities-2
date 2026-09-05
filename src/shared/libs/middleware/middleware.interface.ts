import { NextFunction, Request, Response } from 'express';

export interface MiddlewareInterface {
  /**
   * Выполняет middleware.
   * @param req - объект запроса Express
   * @param res - объект ответа Express
   * @param next - функция передачи управления следующему обработчику
   */
  execute(req: Request, res: Response, next: NextFunction): void;
}
