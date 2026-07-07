import { Command } from './command.interface.js';

export class HelpCommand implements Command {
  public getName(): string {
    return '--help';
  }

  public execute(..._args: string[]): void {
    console.info(this.getHelpText());
  }

  private getHelpText(): string {
    return `
Программа для подготовки данных для REST API сервера.

Использование:
  cli.js <command> [arguments]

Доступные команды:
  --version                   Выводит номер версии из package.json
  --help                      Показывает эту справку
  --import <path>             Импортирует данные из TSV файла
                              Пример: cli.js --import ./data/offers.tsv
  --generate <count> <path> <url>  Генерирует тестовые данные
                              count  - количество записей (1-1000)
                              path   - путь для сохранения файла
                              url    - URL для загрузки изображений
                              Пример: cli.js --generate 100 ./data/offers.tsv http://localhost:3000/static/images

Примеры:
  cli.js --version
  cli.js --import ./data/offers.tsv
  cli.js --generate 50 ./data/test.tsv http://example.com/images
`.trim();
  }
}
