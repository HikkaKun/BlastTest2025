import { Field } from '../Data/Field';

export abstract class Command {
  protected _field: Field;

  constructor(field: Field) {
    this._field = field;
  }

  public abstract do(): void;
  public abstract undo(): void;
}