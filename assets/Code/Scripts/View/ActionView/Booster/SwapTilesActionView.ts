import { SwapCommand } from '../../../Game/Actions/Commands/SwapCommand';
import { Tile } from '../../../Game/Tile';
import GameView from '../../GameView';
import { ActionView } from '../ActionView';

export class SwapTilesActionView extends ActionView {
  public play(view: GameView): this {
    if (!view.config) return this;
    const field = view.config.field;
    this._isPlaying = true;
    let delay = 0;

    const command = this._action.commands[0] as SwapCommand<Tile>;
    const { x: x1, y: y1 } = command.from;
    const { x: x2, y: y2 } = command.to;
    const tileView1 = field[x1][y1]!;
    const tileView2 = field[x2][y2]!;

    tileView1.setPosition(command.to);
    tileView2.setPosition(command.from);

    field[x1][y1] = tileView2;
    field[x2][y2] = tileView1;

    for (const tileView of [tileView1, tileView2]) {
      delay = Math.max(delay, tileView.animateSwap());
    }

    view.scheduleOnce(() => this._isPlaying = false, delay);

    return this;
  }
}