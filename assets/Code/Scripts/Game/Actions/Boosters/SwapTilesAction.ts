import { Tile } from '../../Tile';
import { Action } from '../Action';
import { SwapCommand } from '../Commands/SwapCommand';

export class SwapTilesAction<T extends Tile> extends Action<T> {
  public positionA: IVec2Like;
  public positionB: IVec2Like;

  constructor(positionA: IVec2Like, positionB: IVec2Like) {
    super();
    this.positionA = positionA;
    this.positionB = positionB;
  }

  public do(field: (T | null)[][], activatedBonusTilesPositionsOut?: IVec2Like[]): this {
    this.commands = [new SwapCommand(this.positionA, this.positionB).do(field)];
    return this;
  }
}