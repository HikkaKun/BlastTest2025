import { SetCommand } from '../../Game3/Actions/Commands/SetCommand';
import { Tile } from '../../Game3/Tile';
import GameView from '../GameView3';
import { ActionView } from './ActionView';

export class DeleteTilesActionView extends ActionView {
  public play(view: GameView): this {
    if (!view.config) return this;
    this._isPlaying = true;

    const commands = this._action.commands as SetCommand<Tile>[];
    for (const command of commands) {
      const { x, y } = command.position;
      view.config.field[x][y]?.animateDestroy();
      view.config.field[x][y] = null;
    }

    this._isPlaying = false;

    return this;
  }
}