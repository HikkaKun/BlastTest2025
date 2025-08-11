import { Tile } from '../../Tile';
import { Action } from '../Action';
import { SetCommand } from '../Commands/SetCommand';

export type CreateFunction<T> = (x: number, y: number) => T;

export class FillTilesAction<T extends Tile> extends Action<T> {
  private _createFn: CreateFunction<T>;

  constructor(createFn: CreateFunction<T>) {
    super();
    this._createFn = createFn;
  }

  public do(field: (T | null)[][],): this {
    const width = field.length;
    const height = field[0].length;

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        if (field[x][y]) continue;
        this.commands.push(new SetCommand({ x, y }, this._createFn(x, y)).do(field));
      }
    }

    return this;
  }
}