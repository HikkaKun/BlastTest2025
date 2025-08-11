import { Command } from './Command';

export class SetCommand extends Command {
  public readonly id = 'set';

  public position: IVec2Like;
  public oldValue: any;
  public newValue: any;

  constructor(position: IVec2Like, newValue: any, oldValue?: any) {
    super();

    this.position = position;
    this.newValue = newValue;
    this.oldValue = oldValue;
  }

  public do(field: any[][]): void {
    const { x, y } = this.position;
    this.oldValue = field[x][y];
    field[x][y] = this.newValue;
  }

  public undo(field: any[][]): void {
    const { x, y } = this.position;
    field[x][y] = this.oldValue;
  }

  public copy(): SetCommand {
    return new SetCommand(this.position, this.newValue, this.oldValue);
  }
}