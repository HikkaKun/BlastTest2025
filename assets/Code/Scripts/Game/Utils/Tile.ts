export function tilePositionToString(position: IVec2Like): string;
export function tilePositionToString(x: number, y: number): string;
export function tilePositionToString(x: number | IVec2Like, y?: number): string {
  if (typeof x === 'number') {
    return `${x}:${y}`;
  }

  return `${x.x}:${x.y}`;
}
