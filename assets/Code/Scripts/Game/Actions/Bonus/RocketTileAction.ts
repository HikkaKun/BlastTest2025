import { RocketBonusTile, Tile } from '../../Tile';
import { Action } from '../Action';
import { SetCommand } from '../Commands/SetCommand';

export class RocketTileAction<T extends Tile> extends Action<T> {
  public position: IVec2Like;
  public tile: RocketBonusTile;

  constructor(position: IVec2Like, tile: RocketBonusTile) {
    super();

    this.position = position;
    this.tile = tile;
  }

  public do(field: (T | null)[][], activatedBonusTilesOut: Tile[]): this {
    const { x, y } = this.position;
    const width = field.length;
    const height = field[0].length;

    for (const direction of this.tile.directions) {
      switch (direction) {
        case 'horizontal':
          for (let i = 1; i < width; i++) {
            const _x = x - i;
            if (_x < 0 || x >= width) continue;
            const tile = field[_x][y];
            if (!tile) continue;
            if (tile.type === 'color') this.commands.push(new SetCommand<Tile>({ x: _x, y }, null).do(field));
            else activatedBonusTilesOut.push(tile);
          }
          break;
        case 'vertical':
          for (let i = 1; i < width; i++) {
            const _y = y - i;
            if (_y < 0 || y >= height) continue;
            const tile = field[x][_y];
            if (!tile) continue;
            if (tile.type === 'color') this.commands.push(new SetCommand<Tile>({ x, y: _y }, null).do(field));
            else activatedBonusTilesOut.push(tile);
          }
          break;
      }
    }

    return this;
  }
}