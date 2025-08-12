import { Action } from '../Game/Actions/Action';
import { BombTileAction } from '../Game/Actions/Bonus/BombTileAction';
import { RocketTileAction } from '../Game/Actions/Bonus/RocketTileAction';
import { DeleteTilesAction } from '../Game/Actions/Common/DeleteTilesAction';
import { FallTilesAction } from '../Game/Actions/Common/FallTilesAction';
import { FillTilesAction } from '../Game/Actions/Common/FillTilesAction';
import { MergeTilesAction } from '../Game/Actions/Common/MergeTilesAction';
import { Game } from '../Game/Game';
import { Tile } from '../Game/Tile';
import { ActionView } from './ActionView/ActionView';
import { BombTileActionView } from './ActionView/Bonus/BombTileActionView';
import { RocketTileActionView } from './ActionView/Bonus/RocketTileActionView';
import { DeleteTilesActionView } from './ActionView/Common/DeleteTilesActionView';
import { FallTilesActionView } from './ActionView/Common/FallTilesActionView';
import { FillTilesActionView } from './ActionView/Common/FillTilesActionView';
import { MergeTilesActionView } from './ActionView/Common/MergeTilesActionView';
import TileView from './TileView';

const { ccclass, property } = cc._decorator;

enum TileViewType {
    SPRITE_FRAME,
    PREFAB,
}

cc.Enum(TileViewType);

@ccclass('TileViewConfig')
class TileViewConfig {
    @property()
    public readonly id: string = '';

    @property({ type: TileViewType })
    public readonly type: TileViewType = TileViewType.SPRITE_FRAME;

    @property({ type: cc.SpriteFrame, visible: function (this: TileViewConfig) { return this.type === TileViewType.SPRITE_FRAME } })
    public readonly spriteFrame: cc.SpriteFrame = null!;

    @property({ type: cc.Prefab, visible: function (this: TileViewConfig) { return this.type === TileViewType.PREFAB } })
    public readonly prefab: cc.Prefab = null!;
}

@ccclass
export default class GameView extends cc.Component {
    @property
    public readonly tileSize = new cc.Vec2(100, 100);

    @property({ min: 0 })
    public readonly tileSpeed: number = 1000;

    @property({ type: cc.Prefab, visible: true })
    private _tileViewPrefab: cc.Prefab = null!;

    @property({ type: [TileViewConfig], visible: true })
    private _tileViewConfigs: TileViewConfig[] = [];

    private _config?: {
        game: Game;
        field: (TileView | null)[][];
    }
    public get config() {
        return this._config;
    }

    private _actions: Action<Tile>[] = [];
    private _actionView?: ActionView<Tile>;

    protected update(dt: number): void {
        if (!this.config || !this._actions.length || this._actionView?.isPlaying) return;
        const action = this._actions.shift()!;
        if (action instanceof DeleteTilesAction) {
            this._actionView = new DeleteTilesActionView(action).play(this);
        } else if (action instanceof FallTilesAction) {
            this._actionView = new FallTilesActionView(action).play(this);
        } else if (action instanceof FillTilesAction) {
            this._actionView = new FillTilesActionView(action).play(this);
        } else if (action instanceof MergeTilesAction) {
            this._actionView = new MergeTilesActionView(action).play(this);
        } else if (action instanceof RocketTileAction) {
            this._actionView = new RocketTileActionView(action).play(this);
        } else if (action instanceof BombTileAction) {
            this._actionView = new BombTileActionView(action).play(this);
        }
    }

    public bind(game: Game) {
        const width = game.config.width;
        const height = game.config.height;
        const field: (TileView | null)[][] = [];

        this._config = {
            game,
            field
        };

        for (let x = 0; x < width; x++) {
            field.push([]);
            for (let y = 0; y < height; y++) {
                const tile = game.field[x][y];
                if (!tile) continue;
                const view = this.createTileView({ x, y }, tile);
                field[x][y] = view;
            }
        }

        game.on('DO_ACTIONS', this.onDoActions, this);
    }

    public getViewPosition(out: cc.Vec2, tilePosition: IVec2Like) {
        out.x = (tilePosition.x + 0.5 - this._config!.game.config.width / 2) * this.tileSize.x;
        out.y = (tilePosition.y + 0.5 - this._config!.game.config.height / 2) * this.tileSize.y;

        return out;
    }

    public createTileView(position: IVec2Like, tile: Tile): TileView {
        const node = cc.instantiate(this._tileViewPrefab);
        node.setParent(this.node);
        node.setPosition(this.getViewPosition(temp, position));
        const view = node.getComponent(TileView);
        view.bind(this, position, tile);

        return view;
    }

    public getTileSprite(tile: Tile): cc.SpriteFrame | cc.Node {
        let config: TileViewConfig;
        if (tile.type === 'color') {
            config = this._tileViewConfigs.find(c => c.id === tile.color)!;
        } else {
            switch (tile.bonusType) {
                case 'rocket':
                    config = this._tileViewConfigs.find(c => c.id === `rocket_${tile.directions.length > 1 ? 'cross' : tile.directions[0]}`)!;
                    break;
                case 'bomb':
                    config = this._tileViewConfigs.find(c => c.id === 'bomb')!;
                    break;
            }
        }

        if (config.type === TileViewType.SPRITE_FRAME) return config.spriteFrame;

        const node = cc.instantiate(config.prefab);
        return node;
    }

    public userInput(position: IVec2Like) {
        if (this._actionView?.isPlaying) return;
        this._config?.game.userInput(position);
    }

    protected onDoActions(actions: Action<Tile>[]) {
        this._actions.push(...actions);
    }
}

const temp = new cc.Vec2();