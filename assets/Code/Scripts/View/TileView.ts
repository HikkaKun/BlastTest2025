import GameView from './GameView';

const { ccclass, property } = cc._decorator;

@ccclass
export default class TileView<Type extends string = string, Color extends string = string> extends cc.Component {
    @property(cc.Sprite)
    public readonly sprite: cc.Sprite = null!;

    private _view?: GameView<Type, Color>;
    private _position = new cc.Vec2();
    private _tween?: cc.Tween;

    protected onEnable(): void {
        this._toggleEvents('on');
    }

    protected onDisable(): void {
        this._toggleEvents('off');
    }

    protected _toggleEvents(func: 'on' | 'off') {
        this.node[func](cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
    }

    public bind(view: GameView<Type, Color>, position: IVec2Like) {
        this._view = view;
        this._position.set(position as cc.Vec2);
    }

    public setTilePosition(position: IVec2Like) {
        this._position.set(position as cc.Vec2);
    }

    public setPositionAndMove(position: IVec2Like, speed: number, fallAnimation: boolean) {
        if (!this._view || !this._position) return 0;

        const distance = cc.Vec2.distance(position, this._position);
        const time = distance / speed;
        if (fallAnimation) {
            this._tween?.stop();
            this._tween = new cc.Tween(this.node)
                .to(time, { position: this._view.getTileViewPosition(new cc.Vec2(), position) }, {
                    easing: cc.easing.bounceOut
                })
                .start();
        } else {
            this._tween?.stop();
            this._tween = new cc.Tween(this.node)
                .to(time, { position: this._view.getTileViewPosition(new cc.Vec2(), position) }, {
                    easing: cc.easing.sineOut
                })
                .start();
        }

        this._position.set(position as cc.Vec2);
        return time;
    }

    public animateScale() {
        this.node.setScale(0);

        const time = 0.5;
        this._tween?.stop();
        this._tween = new cc.Tween<cc.Node>(this.node)
            .to(time, { scale: 1 }, {
                easing: cc.easing.backOut
            })
            .start();

        return time;
    }

    protected onTouchStart() {
        if (!this._view || !this._position) return;

        this._view.touchTile(this._position);
    }
}

const temp = new cc.Vec2();