import { inject, injectable } from 'inversify';
import { Command } from './command.interface.js';
import chalk from 'chalk';
import { TYPES } from '../../shared/libs/container/index.js';
import { LoggerInterface } from '../../shared/libs/logger/index.js';

@injectable()
export class HelpCommand implements Command {
  constructor(
    @inject(TYPES.Logger) private readonly logger: LoggerInterface
  ) { }

  public getName(): string {
    return '--help';
  }

  public async execute(..._args: string[]): Promise<void> {
    this.logger.info('HelpCommand: Displaying help...');
    this.logger.info(this.getHelpText());
  }

  private getHelpText(): string {
    return `
${chalk.bold('CLI-application ')}

${chalk.underline('Usage:')} cli.js ${chalk.cyan('<command>')} ${chalk.yellow('[arguments]')}

${chalk.underline('Commands:')}
  ${chalk.cyan('--version')}------------------------ ${chalk.magenta('display version')}
  ${chalk.cyan('--help')}--------------------------- ${chalk.magenta('display help')}
  ${chalk.cyan('--import')} ${chalk.yellow('<path>')}------------------ ${chalk.magenta('import data from file')}
  ${chalk.cyan('--generate')} ${chalk.yellow('<n> <path> <url>')}------ ${chalk.magenta('generate data and save to file')}

${chalk.underline('Examples:')}
  ${chalk.green('cli.js --version')}
  ${chalk.green('cli.js --import ./data/offers.tsv')}
  ${chalk.green('cli.js --generate 50 ./data/test.tsv http://example.com/images')}
`.trim();
  }
}
