import { Command } from './command.interface.js';
import { TSVOfferGenerator } from '../../shared/libs/offer-generator/index.js';
import got from 'got';
import { MockServerDataType } from '../../shared/types/index.type.js';
import { TSVFileWriter } from '../../shared/libs/file-writer/index.js';
import chalk from 'chalk';

export class GenerateCommand implements Command {
  private mockServerData: MockServerDataType = {
    titles: [],
    types: [],
    cites: [],
    locations: {},
    previewImages: []
  };

  private async getData(url: string | URL): Promise<void> {
    try {
      const response = await got(url);
      this.mockServerData = JSON.parse(response.body);
    } catch (error) {
      throw new Error(`Can't get data from ${url}`);
    }
  }

  private async generateOffers(count: number, filePath: string): Promise<void> {
    const tsvFileWriter = new TSVFileWriter(filePath);

    try {
      for (let i = 0; i < count; i++) {
        const item = new TSVOfferGenerator(this.mockServerData).generate();
        await tsvFileWriter.write(item);
      }

      await tsvFileWriter.close();

    } catch (error) {
      throw new Error(`Can't generate ${count} offers`);
    }
  }

  getName(): string {
    return '--generate';
  }

  async execute(...args: string[]): Promise<void> {
    const [count, filePath, url] = args;
    try {
      await this.getData(url);
      await this.generateOffers(parseInt(count, 10), filePath);
      console.info(chalk.green(`✅ Generated ${count} offers to ${filePath}`));
    } catch (error) {
      if (error instanceof Error) {
        console.error(chalk.bgRed.white.bold(' ❌ ERROR '));
        console.error(chalk.red(error.message));
      }
    }
  }
}
