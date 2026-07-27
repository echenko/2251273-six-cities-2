#!/usr/bin/env node
import 'reflect-metadata';
import { container, TYPES } from './shared/libs/container/index.js';
import { LoggerInterface } from './shared/libs/logger/index.js';
import { CliApplication } from './cli/index.js';
import {
  HelpCommand,
  VersionCommand,
  ImportCommand,
  GenerateCommand
} from './cli/commands/index.js';

async function bootstrap() {
  try {
    const cliApplication = container.get<CliApplication>(TYPES.CLIApplication);

    cliApplication.registerCommands([
      container.get<HelpCommand>(TYPES.HelpCommand),
      container.get<VersionCommand>(TYPES.VersionCommand),
      container.get<ImportCommand>(TYPES.ImportCommand),
      container.get<GenerateCommand>(TYPES.GenerateCommand),
    ]);

    await cliApplication.processCommand(process.argv);
  } catch (error) {
    try {
      const logger = container.get<LoggerInterface>(TYPES.Logger);
      logger.error(error as Error, 'CLIApplication: Fatal error during CLI bootstrap');
    } catch {
      console.error('CLIApplication: Fatal error during CLI bootstrap:', error);
    }
    throw error;
  }
}

bootstrap();
