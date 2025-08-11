export function dijkstra<T>(
  field: T[][],
  startPosition: IVec2Like,
  getNeighbors: (field: T[][], startPosition: IVec2Like) => IVec2Like[],
): IVec2Like[] {
  const visited = new Set([positionToString(startPosition)]);
  const queue = [startPosition];
  const result = [];

  while (queue.length) {
    const current = queue.shift()!;
    result.push(current);
    const neighbors = getNeighbors(field, current);
    for (const next of neighbors) {
      const nextStr = positionToString(next.x, next.y);
      if (visited.has(nextStr)) continue;
      queue.push(next);
      visited.add(nextStr);
    }
  }

  return result;
}

export function getNeighbors4<T>(field: T[][], startPosition: IVec2Like): IVec2Like[] {
  const result: IVec2Like[] = [];
  const width = field.length;
  const height = field[0].length;

  for (let i = 0; i < 4; i++) {
    const x = startPosition.x + xOffset4[i];
    const y = startPosition.y + yOffset4[i];

    if (x >= 0 && x < width && y >= 0 && y < height) {
      result.push({ x, y });
    }
  }

  return result;
}

const xOffset4 = [-1, 0, 1, 0];
const yOffset4 = [0, -1, 0, 1];

export function positionToString(position: IVec2Like): string;
export function positionToString(x: number, y: number): string;
export function positionToString(x: number | IVec2Like, y?: number): string {
  if (typeof x === 'number') {
    return `${x}:${y}`;
  }

  return `${x.x}:${x.y}`;
}
