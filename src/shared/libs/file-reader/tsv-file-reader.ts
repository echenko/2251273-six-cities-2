import * as fs from 'node:fs';
import * as readline from 'node:readline';
import { TSVParser } from './../tsv-parser/tsv-parser.js';

export class TSVFileReader {
  constructor(
    private readonly filename: string,
    private readonly parser: TSVParser
  ) {}

  public async *read(): AsyncIterable<unknown> {
    const fileStream = fs.createReadStream(this.filename, { encoding: 'utf8' });

    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    let isFirstLine = true;

    for await (const line of rl) {
      if (!line.trim()) {
        continue;
      }

      if (isFirstLine) {
        isFirstLine = false;
        continue;
      }

      yield this.parser.parse(line);
    }
  }
}
