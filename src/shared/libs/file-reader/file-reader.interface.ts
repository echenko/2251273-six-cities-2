export interface FileReader<T> {
  read(): Promise<T[]>;
}
