import { Field } from '../../Data/Field';
import { GameConfig } from '../../GameConfig';
import { weightedRandom } from '../../Utils/Random';
import { TileReplaceCommand } from '../TileCommand/TileReplaceCommand';
import { FieldCommand } from './FieldCommand';

export class FieldFillCommand extends FieldCommand {
  protected _config: GameConfig;
  protected _byFalling: boolean;

  public get byFalling() {
    return this._byFalling;
  }

  constructor(field: Field, config: GameConfig, byFalling: boolean) {
    super(field);
    this._config = config;
    this._byFalling = byFalling;
  }

  public do(): void {
    for (let x = 0; x < this._config.width; x++) {
      for (let y = 0; y < this._config.height; y++) {
        if (this._field[x][y]) continue;
        const command = new TileReplaceCommand(this._field, { x, y }, weightedRandom(this._config.defaultTiles).tile);
        command.do();
        this._tileCommands.push(command);
      }
    }
  }

  public undo(): void {
    this._byFalling = false;
    super.undo();
  }
}