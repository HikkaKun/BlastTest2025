export function getRandomElementArray<T>(array: T[]): T {
  return array[cc.math.randomRangeInt(0, array.length)];
}