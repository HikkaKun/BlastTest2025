import { Field } from '../Data/Field';
import { Tile } from '../Data/Tile';
import { tilePositionToString } from './Tile';

const xOffset4 = [-1, 0, 1, 0];
const yOffset4 = [0, -1, 0, 1];

export function createField<Type extends string, Color extends string>(width: number, height: number, factory: (field: Field<Type, Color>, x: number, y: number) => Tile<Type, Color> | null): Field<Type, Color> {
  const field: Field<Type, Color> = Array.from({ length: width }, () => Array.from({ length: height }, () => null));
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      field[x][y] = factory(field, x, y);
    }
  }

  return field;
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

export function getConnectedTilePositions<T>(
  field: T[][],
  startPosition: IVec2Like,
  getNeighbors: (field: T[][], startPosition: IVec2Like) => IVec2Like[],
): IVec2Like[] {
  const visited = new Set([tilePositionToString(startPosition)]);
  const queue = [startPosition];
  const result = [];

  while (queue.length) {
    const current = queue.shift()!;
    result.push(current);
    const neighbors = getNeighbors(field, current);
    for (const next of neighbors) {
      const nextStr = tilePositionToString(next.x, next.y);
      if (visited.has(nextStr)) continue;
      queue.push(next);
      visited.add(nextStr);
    }
  }

  return result;
}
