import { Tile } from '../../Data/Tile';
import { Command } from '../Command';

export abstract class TileCommand extends Command {
  protected _affectedTiles: { oldTile: Tile | null, newTile: Tile | null, position: IVec2Like }[] = [];

  public getAffectedTiles() {
    return this._affectedTiles as Readonly<typeof this._affectedTiles>;
  }
}