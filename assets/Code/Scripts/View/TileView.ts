import { Tile } from '../Game/Tile';
import CustomComponent from '../Utils/CustomComponent';
import GameView from './GameView';

const { ccclass, property } = cc._decorator;

@ccclass
export default class TileView extends CustomComponent {
  @property({ type: cc.Node, visible: true })
  private _viewNode: cc.Node = null!;

  @property({ type: cc.Sprite, visible: true })
  private _sprite: cc.Sprite | null = null;

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

  protected _toggleEvents(func: 'on' | 'off') {
    this.node[func](cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
  }

  public bind(view: GameView, position: IVec2Like, tile: Tile) {
    this._config = {
      view,
      position,
      tile
    };

    const result = view.getTileSprite(tile);
    if (result instanceof cc.SpriteFrame) {
      this._sprite!.spriteFrame = result;
    } else {
      this._sprite!.node.destroy();
      this._sprite = null;

      result.setParent(this._viewNode);
      result.setPosition(0, 0);
    }

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

  public animateMerge(destroyAfterAnimation = true): number {
    if (!this._config) return 0;
    const position = this._config.view.getViewPosition(new cc.Vec2(), this._config.position);
    const time = 0.2;
    this.moveToTop();
    this._tweenCancelCallback?.();
    this._tweenCancelCallback = () => this.node.zIndex = 0;
    this._tween?.stop();
    this._tween = new cc.Tween(this.node)
      .to(time, { position }, { easing: 'backIn' })
      .call(() => destroyAfterAnimation && this.node.destroy())
      .start();

    return time;
  }

  public animateAppear(): number {
    if (!this.config) return 0;

    this.node.scale = 0;
    const time = 0.2;
    this._tweenCancelCallback?.();
    this._tweenCancelCallback = () => this.node.scale = 1;
    this._tween?.stop();
    this._tween = new cc.Tween(this.node)
      .to(time, { scale: 1 }, { easing: 'backOut' })
      .start();

    return time;
  }

  public animateSwap(): number {
    if (!this.config) return 0;
    this.moveToTop();
    const position = this.config.view.getViewPosition(new cc.Vec2(), this.config.position);
    const time = 0.5;
    this._tweenCancelCallback?.();
    this._tweenCancelCallback = () => {
      this.node.zIndex = 0;
      this.node.scale = 1;
    };
    this._tween?.stop();
    this._tween = new cc.Tween(this.node)
      .to(time, { position }, {
        easing: 'sineInOut', onUpdate: (_: any, ratio: number) => {
          if (ratio < 0.5) {
            this.node.scale = 1 + cc.easing.sineIn(ratio * 2);
          } else {
            this.node.scale = 1 + cc.easing.sineIn((1 - ratio) * 2);
          }
        }
      })
      .start();

    return time;
  }

  public moveToTop() {
    this.node.zIndex++;
  }

  private _animateLanding() {
    if (!this._config) return;

    this._tweenCancelCallback?.();
    this._tweenCancelCallback = () => {
      this._viewNode.scale = 1;
      this._viewNode.setPosition(0, 0);
    }
    this._tween?.stop();
    this._tween = new cc.Tween(this._viewNode)
      .to(0.1, { y: -this._config.view.config!.game.config.height * 0.1, scaleX: 1.1, scaleY: 0.9 }, { easing: 'cubicOut' })
      .to(0.2, { y: 0, scale: 1 }, { easing: 'backOut' })
      .start();
  }

  protected onTouchStart() {
    this._config?.view.userInput(this._config.position);
  }
}
