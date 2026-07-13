import { Command } from './command.interface.js';
import { TSVOfferGenerator } from '../../shared/libs/offer-generator/index.js';
import got from 'got';
import { MockServerDataType } from '../../shared/types/index.type.js';
import { TSVFileWriter } from '../../shared/libs/file-writer/index.js';


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
      const data = response.body as string;
      this.mockServerData = JSON.parse(data);
    } catch (error) {
      throw new Error(`Can't get data from ${url}`);
    }
  }

  private async writeData(filePath: string, data: string): Promise<void> {
    try {
      const tsvFileWriter = new TSVFileWriter(filePath);
      await tsvFileWriter.write(data);
    } catch (error) {
      throw new Error(`Can't write data to ${filePath}`);
    }
  }

  getName(): string {
    return '--generate';
  }

  execute(...args: string[]): void {
    const [count, filePath, url] = args;
    console.log(count);
    this.getData(url).then(() => {
      const data = new TSVOfferGenerator(this.mockServerData).generate();
      this.writeData(filePath, data);
    });
  }
}
