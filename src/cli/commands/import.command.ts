import { Command } from './command.interface.js';
import { TSVFileReader } from '../../shared/libs/file-reader/index.js';
import chalk from 'chalk';
import { TSVParser } from '../../shared/libs/tsv-parser/tsv-parser.js';
import { inspect } from 'node:util';

function printDataAsCards(data: Array<Record<string, unknown>>): void {
  data.forEach((item, index) => {
    console.info(chalk.bold.blue(`\n  #${index + 1}`));

    const maxKeyLen = Math.max(...Object.keys(item).map((k) => k.length), 15);

    Object.entries(item).forEach(([key, value]) => {
      const formattedKey = chalk.cyan(`  ${key.padEnd(maxKeyLen)}`);
      let formattedValue: string;

      if (value === null || value === undefined) {
        formattedValue = chalk.gray(String(value));
      } else if (typeof value === 'string') {
        formattedValue = chalk.green(`"${value}"`);
      } else if (typeof value === 'number') {
        formattedValue = chalk.yellow(String(value));
      } else if (typeof value === 'boolean') {
        formattedValue = chalk.magenta(String(value));
      } else {
        formattedValue = chalk.white(inspect(value, { colors: true, depth: 2, compact: true }));
      }

      console.log(`${formattedKey}${chalk.gray(':')} ${formattedValue}`);
    });

    console.log(chalk.gray(`  ${'─'.repeat(Math.max(40, maxKeyLen + 20))}`));
  });
}

export class ImportCommand implements Command {
  public getName(): string {
    return '--import';
  }

  public async execute(...parameters: string[]): Promise<void> {
    const [filename] = parameters;
    const fileReader = new TSVFileReader(filename.trim(), new TSVParser());

    console.info(
      chalk.cyan('📥 Importing data from file:'),
      chalk.underline.yellow(filename),
    );

    try {
      console.info(chalk.cyan('\n📋 Imported data (streaming):'));

      let recordCount = 0;

      for await (const parsedItem of fileReader.read()) {
        recordCount++;

        printDataAsCards([parsedItem as Record<string, unknown>]);
      }

      console.info(chalk.green('\n✅ Import completed successfully.'));
      console.info(chalk.gray(`   Records loaded: ${chalk.bold.white(recordCount)}`));

    } catch (err) {
      if (!(err instanceof Error)) {
        throw err;
      }

      console.error(
        chalk.bgRed.white.bold(' ❌ ERROR '),
        chalk.red('Can\'t import data from file:'),
        chalk.underline.red(filename),
      );
      console.error(chalk.red('   Details:'), chalk.gray(err.message));
      console.error(chalk.yellow('💡 Hint:'), chalk.gray('Check that the file exists and the path is correct.'));
    }
  }
}
