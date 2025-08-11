import { Field } from '../../Data/Field';
import { GameConfig } from '../../GameConfig';
import { TileFallCommand } from '../TileCommand/TileFallCommand';
import { FieldCommand } from './FieldCommand';

export class FieldFallCommand extends FieldCommand {
  private _config: GameConfig;

  constructor(field: Field, config: GameConfig) {
    super(field);
    this._config = config;
  }

  public do(): void {
    this._tileCommands.length = 0;
    const { width, height } = this._config;
    for (let x = 0; x < width; x++) {
      let lastEmptyY = -1;
      for (let y = 0; y < height; y++) {
        const current = this._field[x][y];
        if (current && lastEmptyY > -1) {
          const command = new TileFallCommand(this._field, { x, y }, { x, y: lastEmptyY });
          command.do();
          this._tileCommands.push(command);
          lastEmptyY++;
        }
        else if (!current && lastEmptyY < 0) lastEmptyY = y;
      }
    }
  }
}