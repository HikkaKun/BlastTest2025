export function weightedRandom<T extends { weight: number }>(weights: T[]): T {
  if (weights.length === 0) throw new Error();

  let totalWeight = 0;
  for (const { weight } of weights) {
    totalWeight += weight;
  }

  const randomWeight = Math.random() * totalWeight;
  let currentWeight = 0;
  for (const item of weights) {
    currentWeight += item.weight;
    if (randomWeight < currentWeight) return item;
  }

  return weights[weights.length - 1];
}
