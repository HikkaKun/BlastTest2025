import { BombTileAction } from '../../../Game/Actions/Bonus/BombTileAction';
import { BombBonusTile, Tile } from '../../../Game/Tile';
import GameView from '../../GameView';
import Bomb from '../../Tiles/Bomb';
import { ActionView } from '../ActionView';

export class BombTileActionView extends ActionView {
  public play(view: GameView): this {
    if (!view.config) return this;
    this._isPlaying = true;

    let delay = 0;

    const { position } = this._action as BombTileAction<Tile>;
    const tileView = view.config.field[position.x][position.y]!;
    const bomb = tileView.getComponentInChildren(Bomb);
    delay = bomb.animate(view, position, (tileView.config!.tile as BombBonusTile).radius);

    view.scheduleOnce(() => this._isPlaying = false, delay);
    return this;
  }
}