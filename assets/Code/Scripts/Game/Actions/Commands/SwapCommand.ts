import { Command } from './Command';

export class SwapCommand<T> extends Command<T> {
  public from: IVec2Like;
  public to: IVec2Like;

  constructor(from: IVec2Like, to: IVec2Like) {
    super();

    this.from = from;
    this.to = to;
  }

  public do(field: (T | null)[][]): this {
    const { x: x1, y: y1 } = this.from;
    const { x: x2, y: y2 } = this.to;

    const temp = field[x1][y1];
    field[x1][y1] = field[x2][y2];
    field[x2][y2] = temp;

    return this;
  }
}