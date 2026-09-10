export interface ExistsChecker {
  existsById(id: string): Promise<boolean>;
}
