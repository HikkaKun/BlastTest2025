import { Command } from './Command';

export class MoveCommand extends Command {
  public readonly id = 'move';

  public from: IVec2Like;
  public to: IVec2Like;

  constructor(from: IVec2Like, to: IVec2Like) {
    super();

    this.from = from;
    this.to = to;
  }

  public do(field: any[][]): void {
    const { x: x1, y: y1 } = this.from;
    const { x: x2, y: y2 } = this.to;

    const value = field[x1][y1];
    field[x1][y1] = null;
    field[x2][y2] = value;
  }

  public undo(field: any[][]): void {
    const { x: x1, y: y1 } = this.from;
    const { x: x2, y: y2 } = this.to;

    const value = field[x2][y2];
    field[x1][y1] = value;
    field[x2][y2] = null;
  }

  public copy(): Command {
    return new MoveCommand(this.from, this.to);
  }
}