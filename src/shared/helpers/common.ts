
function generateRandomValue(min: number, max: number, numAfterDigit: number = 0): number {
  return Number((Math.random() * (max - min) + min).toFixed(numAfterDigit));
}

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}


function getRandomItems<T>(array: T[], count: number = 1, randomize: boolean = false): T[] {
  const startIndex = Math.floor(Math.random() * (array.length - count));
  if (randomize) {
    return array.sort(() => Math.random() - 0.5).slice(startIndex, startIndex + count);
  }
  return array.slice(startIndex, startIndex + count);
}

export {
  generateRandomValue,
  getRandomItem,
  getRandomItems,
};
