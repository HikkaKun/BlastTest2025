import { Field } from '../../Data/Field';
import { TileCommand } from './TileCommand';

export class TileSwapCommand extends TileCommand {
  protected _firstPosition: IVec2Like;
  protected _secondPosition: IVec2Like;

  constructor(field: Field<string, string>, firstPosition: IVec2Like, secondPosition: IVec2Like) {
    super(field);

    this._firstPosition = firstPosition;
    this._secondPosition = secondPosition;
  }

  protected _swap() {
    const { x: x1, y: y1 } = this._firstPosition;
    const { x: x2, y: y2 } = this._secondPosition;

    const tile1 = this._field[x1][y1];
    const tile2 = this._field[x2][y2];

    this._field[x1][y1] = tile2;
    this._field[x2][y2] = tile1;

    this._affectedTiles = [{
      newTile: tile2,
      oldTile: tile1,
      position: this._firstPosition
    }, {
      newTile: tile1,
      oldTile: tile2,
      position: this._secondPosition
    }];
  }

  public do(): void {
    this._swap();
  }

  public undo(): void {
    this._swap();
  }
}