import { MergeTilesAction } from '../../../Game/Actions/Common/MergeTilesAction';
import { Tile } from '../../../Game/Tile';
import GameView from '../../GameView';
import { ActionView } from '../ActionView';

export class MergeTilesActionView extends ActionView {
  public play(view: GameView): this {
    if (!view.config) return this;

    this._isPlaying = true;
    let delay = 0;

    const { mergePosition, positions, mergeValue } = this._action as MergeTilesAction<Tile>;
    for (const position of positions) {
      const { x, y } = position;
      const tileView = view.config.field[x][y]!;
      tileView.setPosition(mergePosition);
      delay = Math.max(delay, tileView.animateMerge());
      view.config.field[x][y] = null;
    }

    view.scheduleOnce(() => {
      const { x, y } = mergePosition;
      const tileView = view.createTileView(mergePosition, mergeValue);
      delay = tileView.animateAppear();
      view.config!.field[x][y] = tileView;
      view.scheduleOnce(() => this._isPlaying = false, delay);
    }, delay);


    return this;
  }
}

const temp = new cc.Vec2();