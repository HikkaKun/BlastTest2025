import { Tile } from '../../Tile';
import { Action } from '../Action';
import { SetCommand } from '../Commands/SetCommand';

export class DeleteTilesAction<T extends Tile> extends Action<T> {
  public positions: IVec2Like[];

  constructor(positions: IVec2Like[]) {
    super();
    this.positions = positions;
  }

  public do(field: (T | null)[][]) {
    this.commands = this.positions.map(position => new SetCommand<T>(position, null).do(field));
    return this;
  }
}