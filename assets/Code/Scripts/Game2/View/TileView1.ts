import { Tile } from '../Config';
import GameView from './GameView1';

const { ccclass, property } = cc._decorator;

@ccclass
export default class TileView1 extends cc.Component {
    @property({ type: cc.Sprite, visible: true })
    private _sprite: cc.Sprite = null!;

    private _view?: GameView;
    private _position: IVec2Like = { x: 0, y: 0 };
    private _scaleTween?: cc.Tween;
    private _tween?: cc.Tween;
    
    private _tile?: Tile;
    public get tile() {
        return this._tile;
    }

    protected onEnable(): void {
        this._toggleEvents('on');
    }

    protected onDisable(): void {
        this._toggleEvents('off');
    }

    protected _toggleEvents(func: 'on' | 'off') {
        this.node[func](cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
    }

    public bind(view: GameView, tile: Tile, position: IVec2Like) {
        this._view = view;
        this._position = { ...position };
        cc.assetManager.loadAny(tile.sprite, (err, data) => {
            if (err) throw err;
            if (this.isValid) this._sprite.spriteFrame = new cc.SpriteFrame(data);
        })
    }

    public setPosition(tilePosition: IVec2Like) {
        this._position = { ...tilePosition };
    }

    public animateScale() {
        if (!this._view) return 0;

        const time = 0.3;
        this.node.scale = 0;
        this._scaleTween?.stop();
        this._scaleTween = new cc.Tween(this.node)
            .to(time, { scale: 1 }, { easing: 'backOut' })
            .start();

        return time;
    }

    public animateMove(speed: number): number {
        if (!this._view) return 0;
        const distance = cc.Vec2.distance(this._view.getViewPosition(temp, this._position), this.node.position as unknown as cc.Vec2);
        const time = distance / speed;

        this._tween?.stop();
        this._tween = new cc.Tween(this.node)
            .to(time, { position: temp.clone() }, { easing: 'sineOut' })
            .start();

        return time;
    }

    public animateFall(speed: number, offsetY?: number): number {
        if (!this._view) return 0;
        typeof offsetY === 'number' && this.node.setPosition(this._view.getViewPosition(temp, { x: this._position.x, y: this._position.y + offsetY }));
        const distance = cc.Vec2.distance(this._view.getViewPosition(temp, this._position), this.node.position as unknown as cc.Vec2);
        const time = distance / speed;

        this._tween?.stop();
        this._tween = new cc.Tween(this.node)
            .to(time, { position: temp.clone() }, { easing: 'bounceOut' })
            .start();

        return time;
    }

    public animateMerge(time: number): number {
        if (!this._view) return 0;
        this._view.getViewPosition(temp, this._position);

        this._tween?.stop();
        this._tween = new cc.Tween(this.node)
            .to(time, { position: temp.clone() }, { easing: 'backOut' })
            .start();

        return time;
    }

    protected onTouchStart() {
        if (!this._view) return;
        this._view.matchTile(this._position);
    }
}

const temp = new cc.Vec2();