import { RocketBonusTile, Tile } from '../../Tile';
import { Action } from '../Action';
import { SetCommand } from '../Commands/SetCommand';

export class RocketTileAction<T extends Tile> extends Action<T> {
  public position: IVec2Like;

  constructor(position: IVec2Like) {
    super();

    this.position = position;
  }

  public do(field: (T | null)[][], activatedBonusTilesPositionsOut: IVec2Like[]): this {
    const { x, y } = this.position;
    const width = field.length;
    const height = field[0].length;
    const tile = field[x][y] as RocketBonusTile;

    this.commands.push(new SetCommand<Tile>(this.position, null).do(field));
    for (const direction of tile.directions) {
      switch (direction) {
        case 'horizontal':
          for (let i = 1; i < width; i++) {
            for (const multiplier of multipliers) {
              const _x = x + i * multiplier;
              if (_x < 0 || _x >= width) continue;
              const tile = field[_x][y];
              if (!tile) continue;
              const position = { x: _x, y };
              if (tile.type === 'color') {
                this.commands.push(new SetCommand<Tile>(position, null).do(field));
              } else {
                activatedBonusTilesPositionsOut.push(position);
              }
            }
          }
          break;
        case 'vertical':
          for (let i = 1; i < height; i++) {
            for (const multiplier of multipliers) {
              const _y = y + i * multiplier;
              if (_y < 0 || _y >= height) continue;
              const tile = field[x][_y];
              if (!tile) continue;
              const position = { x, y: _y };
              if (tile.type === 'color') {
                this.commands.push(new SetCommand<Tile>(position, null).do(field));
              } else {
                activatedBonusTilesPositionsOut.push(position);
              }
            }
          }
          break;
      }
    }

    return this;
  }
}

const multipliers = [-1, 1];