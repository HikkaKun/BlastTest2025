import { SetCommand } from '../../Game/Actions/Commands/SetCommand';
import { Tile } from '../../Game/Tile';
import GameView from '../GameView';
import { ActionView } from './ActionView';

export class FillTilesActionView extends ActionView {
  public play(view: GameView): this {
    if (!view.config) return this;
    // this._isPlaying = true;
    let delay = 0;

    const commands = this._action.commands as SetCommand<Tile>[];
    for (const command of commands) {
      const position = command.position;
      const { x, y } = position;
      const tileView = view.createTileView(position, command.newValue!);
      view.config.field[x][y] = tileView;
      tileView.node.setPosition(view.getViewPosition(temp, { x, y: y + view.config.game.config.height }));
      delay = Math.max(delay, tileView.animateFall());
    }

    // view.scheduleOnce(() => this._isPlaying = false, delay);

    return this;
  }
}

const temp = new cc.Vec2();