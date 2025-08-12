import { Tile } from '../Game/Tile';
import GameView from './GameView';

const { ccclass, property } = cc._decorator;

@ccclass
export default class TileView3 extends cc.Component {
  @property({ type: cc.Sprite, visible: true })
  private _sprite: cc.Sprite = null!;

  private _config?: {
    view: GameView;
    position: IVec2Like;
    tile: Tile;
  }
  public get config() {
    return this._config;
  }

  private _tween?: cc.Tween;
  private _tweenCancelCallback?: () => void;

  protected onEnable(): void {
    this._toggleEvents('on');
  }

  protected onDisable(): void {
    this._toggleEvents('off');
  }

  protected _toggleEvents(func: 'on' | 'off') {
    this.node[func](cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
  }

  public bind(view: GameView, position: IVec2Like, tile: Tile) {
    this._config = {
      view,
      position,
      tile
    };

    this._sprite.spriteFrame = view.getTileSprite(tile);

    return this;
  }

  public setPosition(position: IVec2Like) {
    if (!this._config) return this;
    this._config.position = position;

    return this;
  }

  public animateDestroy(destroyAfterAnimation = true): number {
    if (!this._config) return 0;

    const time = 0.3;
    this._tweenCancelCallback?.();
    this._tweenCancelCallback = () => this.node.scale = 1;
    this._tween?.stop();
    this._tween = new cc.Tween(this.node)
      .to(time, { scale: 0 }, { easing: 'sineOut' })
      .call(() => destroyAfterAnimation && this.node.destroy())
      .start();

    return time;
  }

  public animateFall(): number {
    if (!this._config) return 0;

    const position = this._config.view.getViewPosition(new cc.Vec2(), this._config.position);
    const distance = cc.Vec2.distance(position, this.node.position as unknown as cc.Vec2);
    const time = distance / this._config.view.tileSpeed;
    this._tweenCancelCallback?.();
    this._tween?.stop();
    this._tween = new cc.Tween(this.node)
      .to(time, { position }, { easing: 'linear' })
      .call(() => this._animateLanding())
      .start();

    return time;
  }

  private _animateLanding() {
    if (!this._config) return;

    this._tweenCancelCallback?.();
    this._tweenCancelCallback = () => {
      this._sprite.node.scale = 1;
      this._sprite.node.setPosition(0, 0);
    }
    this._tween?.stop();
    this._tween = new cc.Tween(this._sprite.node)
      .to(0.1, { y: -this._sprite.node.height * 0.1, scaleX: 1.1, scaleY: 0.9 }, { easing: 'cubicOut' })
      .to(0.2, { y: 0, scale: 1 }, { easing: 'backOut' })
      .start();
  }

  protected onTouchStart() {
    this._config?.view.userInput(this._config.position);
  }
}
