import { Tile } from '../../Tile';
import { Action } from '../Action';
import { SwapCommand } from '../Commands/SwapCommand';

export class FallTilesAction<T extends Tile> extends Action<T> {
  public do(field: (T | null)[][]) {
    const width = field.length;
    const height = field[0].length;

    for (let x = 0; x < width; x++) {
      let lastEmptyY = -1;
      for (let y = 0; y < height; y++) {
        const current = field[x][y];
        if (current && lastEmptyY > -1) {
          this.commands.push(new SwapCommand({ x, y }, { x, y: lastEmptyY }).do(field));
          lastEmptyY++;
        } else if (!current && lastEmptyY === -1) lastEmptyY = y;
      }
    }

    return this;
  }
}