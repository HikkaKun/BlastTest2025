import { Command } from '../Command';
import { TileCommand } from '../TileCommand/TileCommand';

export abstract class FieldCommand extends Command {
  protected _tileCommands: TileCommand[] = [];

  public getTileCommands(): ReadonlyArray<TileCommand> {
    return this._tileCommands;
  }

  public undo(): void {
    for (const command of this._tileCommands.reverse()) {
      command.undo();
    }
  }
}