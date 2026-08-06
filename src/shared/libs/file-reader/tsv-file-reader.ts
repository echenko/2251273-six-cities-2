import * as fs from 'node:fs';
import * as readline from 'node:readline';
import { TSVParser } from './../tsv-parser/index.js';
import { OffersItemType } from '../../types/index.type.js';
import { FileReader } from './file-reader.interface.js';
import { LoggerInterface } from '../logger/logger.interface.js';

export class TSVFileReader implements FileReader<OffersItemType> {
  constructor(
    private readonly filename: string,
    private readonly parser: TSVParser,
    private readonly logger: LoggerInterface
  ) {}

  public async read(): Promise<OffersItemType[]> {
    const rl = readline.createInterface({
      input: fs.createReadStream(this.filename, { encoding: 'utf8' }),
      crlfDelay: Infinity,
    });

    const results: OffersItemType[] = [];
    let isFirstLine = true;
    let lineNumber = 0;
    let skippedCount = 0;
    const skippedRows: number[] = [];

    for await (const line of rl) {
      lineNumber++;

      if (isFirstLine) {
        isFirstLine = false;
        continue;
      }

      if (!line.trim()) {
        continue;
      }

      try {
        const parsed = this.parser.parse(line);
        results.push(parsed);
      } catch (error) {
        skippedCount++;
        skippedRows.push(lineNumber);
        this.logger.warn(
          `TSVFileReader: Skipping line ${lineNumber}`
        );
      }
    }

    if (skippedCount > 0) {
      this.logger.warn(
        `TSVFileReader: Skipped ${skippedCount} rows: ${skippedRows.join(', ')}`
      );
    }
    this.logger.info(
      `TSVFileReader: Successfully read ${results.length} records from ${this.filename}`
    );

    return results;
  }
}
