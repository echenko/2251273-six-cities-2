// tsv-file-reader.ts
import { FileReader } from './file-reader.interface.js';
import { readFileSync } from 'node:fs';
import { OffersItemType } from '../../types/index.type.js';
import { ParserInterface } from './../tsv-parser/tsv-parser.interface.js';

export class TSVFileReader implements FileReader {
  private rawData = '';

  constructor(
    private readonly filename: string,
    private readonly parser: ParserInterface,
  ) {}

  public read(): void {
    this.rawData = readFileSync(this.filename, { encoding: 'utf-8' });
  }

  public toArray(): OffersItemType[] {
    if (!this.rawData) {
      throw new Error('File was not read');
    }

    return this.rawData
      .split('\n')
      .filter((row) => row.trim().length > 0)
      .map((line) => this.parser.parse(line));
  }
}
