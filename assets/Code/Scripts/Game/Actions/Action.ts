import { Tile } from '../Tile';
import { Command } from './Commands/Command';

export abstract class Action<T extends Tile> {
  public commands: Command<T>[] = [];

  public abstract do(field: (T | null)[][], activatedBonusTilesOut?: Tile[]): typeof this;
}