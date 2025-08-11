import { Field } from '../../Data/Field';
import { Tile } from '../../Data/Tile';
import { TileCommand } from './TileCommand';

export class TileReplaceCommand extends TileCommand {
  protected _originalTile: Tile | null = null;
  protected _position: IVec2Like;
  protected _newTile: Tile | null;

  constructor(field: Field<string, string>, position: IVec2Like, newTile: Tile | null) {
    super(field);
    this._position = position;
    this._newTile = newTile;
  }

  public do(): void {
    const { x, y } = this._position;
    this._originalTile = this._field[x][y];
    this._field[x][y] = this._newTile;
    this._affectedTiles = [{
      newTile: this._newTile,
      oldTile: this._originalTile,
      position: this._position,
    }];
  }

  public undo(): void {
    const { x, y } = this._position;
    this._field[x][y] = this._originalTile;
    this._affectedTiles = [{
      newTile: this._originalTile,
      oldTile: this._newTile,
      position: this._position,
    }];
  }
}