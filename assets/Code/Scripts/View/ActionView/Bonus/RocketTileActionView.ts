import { RocketTileAction } from '../../../Game/Actions/Bonus/RocketTileAction';
import { Tile } from '../../../Game/Tile';
import GameView from '../../GameView';
import Rockets from '../../Tiles/Rockets';
import { ActionView } from '../ActionView';

export class RocketTileActionView extends ActionView {
  public play(view: GameView): this {
    if (!view.config) return this;
    this._isPlaying = true;

    const { position, tile } = this._action as RocketTileAction<Tile>;
    const { x, y } = position;
    const rocketView = view.config.field[x][y]!;
    const delay = rocketView.getComponentInChildren(Rockets).animate(position, view);

    view.scheduleOnce(() => {
      rocketView.node.destroy();
      this._isPlaying = false;
    }, delay);

    return this;
  }
}