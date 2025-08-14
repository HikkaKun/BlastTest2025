import { Config } from '../../Game/Config';
import CustomComponent from '../../Utils/CustomComponent';
import GameView from '../GameView';

const { ccclass, property } = cc._decorator;

@ccclass
export default abstract class BoosterView extends CustomComponent {
  @property({ visible: true })
  protected _boosterId = '';

  @property({ type: cc.Label, visible: true })
  protected _label: cc.Label = null!;

  protected _gameView?: GameView;

  protected update(dt: number): void {
    if (!this._gameView?.config) return;

    this._label.string = this._gameView.config.game.boosters[this._boosterId as keyof Config['boosters']].toString();
  }

  protected _toggleEvents(func: 'on' | 'off'): void {
    this.node[func](cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
  }

  public bind(gameView: GameView) {
    this._gameView = gameView;
  }

  protected abstract _gameViewCustomInputCallback: (position: IVec2Like) => any;

  protected onTouchStart() {
    if (!this._gameView?.config) return;

    if (this._gameView.customInputCallback === this._gameViewCustomInputCallback || this._gameView.customInputCallback !== null) return;
    this._gameView.customInputCallback = this._gameViewCustomInputCallback;
  }
}
