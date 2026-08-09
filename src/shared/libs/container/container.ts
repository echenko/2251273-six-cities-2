import { Container } from 'inversify';
import { TYPES } from './container.types.js';
import { PinoLogger, LoggerInterface } from './../logger/index.js';
import { RestConfig } from './../config/index.js';
import { RestApplication } from './../../../rest/index.js';
import { DatabaseClientInterface, MongoClient } from './../database/index.js';
import { DefaultUserRepository, UserRepository } from './../../modules/user/index.js';
import { DefaultOfferRepository, OfferRepository } from './../../modules/offer/index.js';
import {
  HelpCommand,
  VersionCommand,
  ImportCommand,
  GenerateCommand
} from './../../../cli/commands/index.js';
import { CliApplication } from '../../../cli/index.js';
import { CommentRepository, DefaultCommentRepository } from '../../modules/comment/index.js';

const container = new Container();

// Общие зависимости)
container.bind<LoggerInterface>(TYPES.Logger).to(PinoLogger).inSingletonScope();
container.bind<RestConfig>(TYPES.Config).to(RestConfig).inSingletonScope();

// REST
container.bind<RestApplication>(TYPES.Application).to(RestApplication);

// База данных
container.bind<DatabaseClientInterface>(TYPES.DatabaseClient).to(MongoClient).inSingletonScope();

// Репозитории
container.bind<UserRepository>(TYPES.UserRepository).to(DefaultUserRepository);
container.bind<OfferRepository>(TYPES.OfferRepository).to(DefaultOfferRepository);
container.bind<CommentRepository>(TYPES.CommentRepository).to(DefaultCommentRepository);

// CLI
container.bind<CliApplication>(TYPES.CLIApplication).to(CliApplication);
container.bind<HelpCommand>(TYPES.HelpCommand).to(HelpCommand);
container.bind<VersionCommand>(TYPES.VersionCommand).to(VersionCommand);
container.bind<ImportCommand>(TYPES.ImportCommand).to(ImportCommand);
container.bind<GenerateCommand>(TYPES.GenerateCommand).to(GenerateCommand);

export { container };
