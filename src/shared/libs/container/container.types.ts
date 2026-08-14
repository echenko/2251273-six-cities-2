export const TYPES = {
  // Общие зависимости)
  Logger: Symbol.for('Logger'),
  Config: Symbol.for('Config'),
  // REST
  Application: Symbol.for('Application'),
  // База данных
  DatabaseClient: Symbol.for('DatabaseClient'),
  // Репозитории
  UserRepository: Symbol.for('UserRepository'),
  OfferRepository: Symbol.for('OfferRepository'),
  CommentRepository: Symbol.for('CommentRepository'),
  // CLI
  CLIApplication: Symbol.for('CLIApplication'),
  HelpCommand: Symbol.for('HelpCommand'),
  VersionCommand: Symbol.for('VersionCommand'),
  ImportCommand: Symbol.for('ImportCommand'),
  GenerateCommand: Symbol.for('GenerateCommand'),
  // Сервисы
  CommentService: Symbol.for('CommentService'),
  UserService: Symbol.for('UserService'),
  OfferService: Symbol.for('OfferService'),
  AuthService: Symbol.for('AuthService'),
  // Контроллеры
  AuthController: Symbol.for('AuthController'),
  UserController: Symbol.for('UserController'),
};
