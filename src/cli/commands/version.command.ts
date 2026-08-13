import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Command } from './command.interface.js';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../shared/libs/container/index.js';
import { LoggerInterface } from '../../shared/libs/logger/index.js';

type PackageJSONConfig = {
  version: string;
};

function isPackageJSONConfig(value: unknown): value is PackageJSONConfig {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    'version' in value &&
    typeof (value as PackageJSONConfig).version === 'string'
  );
}

@injectable()
export class VersionCommand implements Command {
  constructor(
    @inject(TYPES.Logger) private readonly logger: LoggerInterface,
    private readonly filePath: string = './package.json',
  ) { }

  private readVersion(): string {
    const absolutePath = resolve(this.filePath);
    const fileContent = readFileSync(absolutePath, 'utf-8');
    const importedContent: unknown = JSON.parse(fileContent);

    if (!isPackageJSONConfig(importedContent)) {
      this.logger.error('Failed to parse json content.');
      throw new Error('Failed to parse json content.');
    }

    return importedContent.version;
  }

  getName(): string {
    return '--version';
  }

  async execute(): Promise<void> {
    try {
      const version = this.readVersion();
      this.logger.info(`Version: ${version}`);
    } catch (error: unknown) {
      this.logger.error(
        error instanceof Error ? error : new Error(String(error)),
        'VersionCommand: Failed to read version from package.json',
      );
    }
  }
}
