import { BombBonusTile, Tile } from '../../Tile';
import { Action } from '../Action';
import { SetCommand } from '../Commands/SetCommand';

export class BombTileAction<T extends Tile> extends Action<T> {
  public position: IVec2Like;

  constructor(position: IVec2Like) {
    super();

    this.position = position;
  }

  public do(field: (T | null)[][], activatedBonusTilesPositionsOut: IVec2Like[]): this {
    const { x, y } = this.position;
    const width = field.length;
    const height = field[0].length;
    const tile = field[x][y] as BombBonusTile;
    const radius = tile.radius - 1;

    this.commands.push(new SetCommand<Tile>(this.position, null).do(field));
    for (let _x = x - radius; _x <= x + radius; _x++) {
      for (let _y = y - radius; _y <= y + radius; _y++) {
        if (_x >= 0 && _x < width && _y >= 0 && y < height) {
          const tile = field[_x][_y];
          if (!tile) continue;
          const position = { x: _x, y: _y };
          if (tile.type === 'color') {
            this.commands.push(new SetCommand<Tile>(position, null).do(field))
          } else {
            activatedBonusTilesPositionsOut.push(position);
          }
        }
      }
    }

    return this;
  }
}