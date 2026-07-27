import * as fs from 'node:fs';
import * as readline from 'node:readline';
import { TSVParser } from './../tsv-parser/index.js';
import { OffersItemType } from '../../types/index.type.js';
import { FileReader } from './file-reader.interface.js';

export class TSVFileReader implements FileReader<OffersItemType> {
  constructor(
    private readonly filename: string,
    private readonly parser: TSVParser
  ) {}

  public async read(): Promise<OffersItemType[]> {
    const rl = readline.createInterface({
      input: fs.createReadStream(this.filename, { encoding: 'utf8' }),
      crlfDelay: Infinity,
    });

    const results: OffersItemType[] = [];
    let isFirstLine = true;

    for await (const line of rl) {
      if (isFirstLine) {
        isFirstLine = false;
        continue;
      }
      if (line.trim()) {
        results.push(this.parser.parse(line));
      }
    }

    return results;
  }
}
