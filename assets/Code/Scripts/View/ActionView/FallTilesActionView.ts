import { SwapCommand } from '../../Game/Actions/Commands/SwapCommand';
import { Tile } from '../../Game/Tile';
import GameView from '../GameView';
import { ActionView } from './ActionView';

export class FallTilesActionView extends ActionView {
  public play(view: GameView): this {
    if (!view.config) return this;
    this._isPlaying = true;

    let delay = 0;

    const commands = this._action.commands as SwapCommand<Tile>[];
    for (const command of commands) {
      const { x: x1, y: y1 } = command.from;
      const { x: x2, y: y2 } = command.to;

      const tileView = view.config.field[x1][y1]!;
      tileView.config!.position = command.to;
      delay = Math.max(delay, tileView.animateFall());
      view.config.field[x2][y2] = tileView;
    }

    view.scheduleOnce(() => this._isPlaying = false, delay);

    return this;
  }
}