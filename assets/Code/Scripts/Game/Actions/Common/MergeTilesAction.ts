import { Tile } from '../../Tile';
import { Action } from '../Action';
import { SetCommand } from '../Commands/SetCommand';

export class MergeTilesAction<T extends Tile> extends Action<T> {
  public positions: IVec2Like[];
  public mergePosition: IVec2Like;
  public mergeValue: T;

  constructor(positions: IVec2Like[], mergePosition: IVec2Like, mergeValue: T) {
    super();

    this.positions = positions;
    this.mergePosition = mergePosition;
    this.mergeValue = mergeValue;
  }

  public do(field: (T | null)[][]): this {
    this.commands.push(
      ...this.positions.map(position => new SetCommand<T>(position, null).do(field)),
      new SetCommand(this.mergePosition, this.mergeValue).do(field)
    );

    return this;
  }
}