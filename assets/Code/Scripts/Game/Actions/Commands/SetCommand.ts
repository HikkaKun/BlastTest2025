import { Command } from './Command';

export class SetCommand<T> extends Command<T> {
  public position: IVec2Like;
  public newValue: T | null;
  public oldValue: T | null = null;

  constructor(position: IVec2Like, newValue: T | null) {
    super();

    this.position = position;
    this.newValue = newValue;
  }

  public do(field: (T | null)[][]) {
    const { x, y } = this.position;
    this.oldValue = field[x][y];
    field[x][y] = this.newValue;

    return this;
  }
}