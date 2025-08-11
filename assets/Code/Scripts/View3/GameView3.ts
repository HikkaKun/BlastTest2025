import { Action } from '../Game3/Actions/Action';
import { DeleteTilesAction } from '../Game3/Actions/Common/DeleteTilesAction';
import { FallTilesAction } from '../Game3/Actions/Common/FallTilesAction';
import { FillTilesAction } from '../Game3/Actions/Common/FillTilesAction';
import { Game } from '../Game3/Game';
import { Tile } from '../Game3/Tile';
import { ActionView } from './ActionView/ActionView';
import { DeleteTilesActionView } from './ActionView/DeleteTilesActionView';
import { FallTilesActionView } from './ActionView/FallTilesActionView';
import { FillTilesActionView } from './ActionView/FillTilesActionView';
import TileView3 from './TileView3';

const { ccclass, property } = cc._decorator;

@ccclass('SpriteFrameConfig')
class SpriteFrameConfig {
    @property()
    public readonly id: string = '';

    @property(cc.SpriteFrame)
    public readonly spriteFrame: cc.SpriteFrame = null!;
}

@ccclass
export default class GameView extends cc.Component {
    @property
    public readonly tileSize = new cc.Vec2(100, 100);

    @property({ min: 0 })
    public readonly tileSpeed: number = 1000;

    @property({ type: cc.Prefab, visible: true })
    private _tileViewPrefab: cc.Prefab = null!;

    @property({ type: [SpriteFrameConfig], visible: true })
    private _spriteFrameConfigs: SpriteFrameConfig[] = [];

    private _config?: {
        game: Game;
        field: (TileView3 | null)[][];
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
        }
    }

    public bind(game: Game) {
        const width = game.config.width;
        const height = game.config.height;
        const field: (TileView3 | null)[][] = [];

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

    public createTileView(position: IVec2Like, tile: Tile): TileView3 {
        const node = cc.instantiate(this._tileViewPrefab);
        node.setParent(this.node);
        node.setPosition(this.getViewPosition(temp, position));
        const view = node.getComponent(TileView3);
        view.bind(this, position, tile);

        return view;
    }

    public getTileSprite(tile: Tile): cc.SpriteFrame {
        if (tile.type === 'color') {
            return this._spriteFrameConfigs.find(c => c.id === tile.color)!.spriteFrame;
        } else {
            switch (tile.bonusType) {
                case 'rocket':
                    return this._spriteFrameConfigs.find(c => c.id === `rocket_${tile.directions.length > 1 ? 'cross' : tile.directions[0]}`)!.spriteFrame;
            }
        }
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