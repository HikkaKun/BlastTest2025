export abstract class Command {
  public readonly id: string = 'none';

  public abstract do(field: any[][]): void;
  public abstract undo(field: any[][]): void;
  public abstract copy(): Command;
}