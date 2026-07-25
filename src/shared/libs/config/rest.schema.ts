import convict from 'convict';
import convictFormatWithValidator from 'convict-format-with-validator';

convict.addFormats(convictFormatWithValidator);

export type RestSchema = {
  port: number;
  logLevel: string;
  logFilePath: string;
  mockDataUrl: string;
  defaultDataPath: string;
  mongoUrl: string;
  mongoDbName: string;
};

export const configRestSchema = convict<RestSchema>({
  port: {
    doc: 'The port number for the REST server',
    format: 'port',
    default: 3000,
    env: 'PORT',
  },
  logLevel: {
    doc: 'Logging level (fatal, error, warn, info, debug, trace, silent)',
    format: ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'],
    default: 'info',
    env: 'LOG_LEVEL',
  },
  logFilePath: {
    doc: 'Path to the log file',
    format: String,
    default: './logs/cli-app.log',
    env: 'LOG_FILE_PATH',
  },
  mockDataUrl: {
    doc: 'URL for downloading mock data',
    format: 'url',
    default: 'https://example.com/images',
    env: 'MOCK_DATA_URL',
  },
  defaultDataPath: {
    doc: 'Default path for data files',
    format: String,
    default: './data',
    env: 'DEFAULT_DATA_PATH',
  },
  mongoUrl: {
    doc: 'MongoDB connection URI',
    format: String,
    default: 'mongodb://localhost:27017/six-cities',
    env: 'MONGO_URI',
  },
  mongoDbName: {
    doc: 'MongoDB database name',
    format: String,
    default: 'six-cities',
    env: 'MONGO_DB_NAME',
  },
});
