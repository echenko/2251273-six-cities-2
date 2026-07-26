import { Container } from 'inversify';
import { TYPES } from './container.types.js';
import { PinoLogger, LoggerInterface } from '../logger/index.js';
import { RestConfig } from '../config/index.js';
import { RestApplication } from './../../../rest/index.js';
import { DatabaseClientInterface, MongoClient } from '../database/index.js';
import { DefaultUserRepository, UserRepository } from '../../modules/user/index.js';
import { DefaultOfferRepository, OfferRepository } from '../../modules/offer/index.js';

const container = new Container();

container
  .bind<LoggerInterface>(TYPES.Logger)// Ключ, по которому будем искать
  .to(PinoLogger)// Какой класс создавать
  .inSingletonScope();// Стратегия: один на всё приложение

container
  .bind<RestConfig>(TYPES.Config)
  .to(RestConfig)
  .inSingletonScope();

container
  .bind<RestApplication>(TYPES.Application)
  .to(RestApplication);

container
  .bind<DatabaseClientInterface>(TYPES.DatabaseClient)
  .to(MongoClient)
  .inSingletonScope();

container
  .bind<UserRepository>(TYPES.UserRepository)
  .to(DefaultUserRepository);

container
  .bind<OfferRepository>(TYPES.OfferRepository)
  .to(DefaultOfferRepository);

export { container };
