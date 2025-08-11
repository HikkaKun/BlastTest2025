import { Command } from './Command';

export class MergeCommand extends Command {
  public readonly id = 'merge';

  public oldValue: any;
  public from: IVec2Like;
  public to: IVec2Like;

  constructor(from: IVec2Like, to: IVec2Like, oldValue?: any) {
    super();

    this.from = from;
    this.to = to;
    this.oldValue = oldValue;
  }

  public do(field: any[][]): void {
    const { x, y } = this.from;
    this.oldValue = field[x][y];
    field[x][y] = null;
  }

  public undo(field: any[][]): void {
    const { x, y } = this.from;
    field[x][y] = this.oldValue;
  }

  public copy(): Command {
    return new MergeCommand(this.from, this.to, this.oldValue);
  }
}