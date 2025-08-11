export abstract class Command<T> {
  public abstract do(field: (T | null)[][]): typeof this;
}