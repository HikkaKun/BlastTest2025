import { FieldBlastCommand } from '../Game/Commands/FieldCommand/FieldBlastCommand';
import { FieldCommand } from '../Game/Commands/FieldCommand/FieldCommand';
import { FieldFallCommand } from '../Game/Commands/FieldCommand/FieldFallCommand';
import { FieldFillCommand } from '../Game/Commands/FieldCommand/FieldFillCommand';
import { TileFallCommand } from '../Game/Commands/TileCommand/TileFallCommand';
import { TileReplaceCommand } from '../Game/Commands/TileCommand/TileReplaceCommand';
import { TileSwapCommand } from '../Game/Commands/TileCommand/TileSwapCommand';
import { Game } from '../Game/Game';
import { GameConfig } from '../Game/GameConfig';
import { GameEvent } from '../Game/GameEvent';
import { tilePositionToString } from '../Game/Utils/Tile';
import TileView from './TileView';

const { ccclass, property } = cc._decorator;

@ccclass('GameViewTileConfig')
class GameViewTileConfig {
    @property()
    public type: string = '';

    @property()
    public color: string = '';

    @property(cc.SpriteFrame)
    public spriteFrame: cc.SpriteFrame = null!;
}

@ccclass
export default class GameView<Type extends string = string, Color extends string = string> extends cc.Component {
    @property({ visible: true })
    private get _parseFromConfig() {
        return false;
    }

    private set _parseFromConfig(value) {
        if (!this._jsonConfig) return;
        const config = this._jsonConfig.json as GameConfig<Type, Color>;

        config.defaultTiles.forEach(({ tile: { type, color } }) => {
            if (this._tileConfigs.find(config => config.type === type && config.color === color)) return;
            const newConfig = new GameViewTileConfig();
            newConfig.type = type;
            newConfig.color = color;
            this._tileConfigs.push(newConfig);
        });
    }

    @property({ visible: true, min: 1 })
    private _tileSpeed = 10;

    @property({ visible: true, type: cc.JsonAsset })
    private _jsonConfig: cc.JsonAsset | null = null;

    @property({ visible: true, type: cc.Prefab })
    private _tilePrefab: cc.Prefab = null!;

    @property({ visible: true })
    private _tileSize = new cc.Vec2(100, 112);

    @property({ visible: true, type: [GameViewTileConfig] })
    private _tileConfigs: GameViewTileConfig[] = [];

    private _config?: GameConfig;
    private _game?: Game<Type, Color>;
    private _fieldCommandQueue: { type: 'do' | 'undo', commands: FieldCommand[] }[] = [];
    private _isProcessing = false;
    private _tileViews = new Map<string, TileView>();

    protected onLoad(): void {
        if (!this._tilePrefab) cc.error(`Tile prefab is not set!`);
        this._tileConfigs.forEach(config => {
            if (!config.spriteFrame) cc.error(`SpriteFrame is not set for tile config!`);
        });

        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, () => this._game!.undo(), this);
    }

    protected update(dt: number): void {
        if (!this._game || !this._config) return;
        if (this._isProcessing || this._fieldCommandQueue.length === 0) return;
        this._isProcessing = true;
        let delay = 0;
        const { type, commands: fieldCommands } = this._fieldCommandQueue.shift()!;
        for (const fieldCommand of fieldCommands) {
            for (const tileCommand of fieldCommand!.getTileCommands()) {
                if (tileCommand instanceof TileReplaceCommand) {
                    for (const { newTile, position } of tileCommand.getAffectedTiles()) {
                        if (!newTile) {
                            const key = tilePositionToString(position);
                            const view = this._tileViews.get(key);
                            view?.node.destroy();
                            this._tileViews.delete(key);
                            this._isProcessing = false;
                        } else {
                            const key = tilePositionToString(position);
                            this._tileViews.get(key)?.node.destroy();
                            this._tileViews.delete(key);
                            const node = cc.instantiate(this._tilePrefab);
                            const view = node.getComponent(TileView);
                            this._tileViews.set(tilePositionToString(position), view);
                            view.sprite.spriteFrame = this._tileConfigs.find(c => c.color === newTile!.color && c.type === newTile!.type)!.spriteFrame;
                            node.setParent(this.node);
                            let _delay: number;
                            if (fieldCommand instanceof FieldFillCommand && fieldCommand.byFalling) {
                                temp.set(position as cc.Vec2);
                                temp.y += this._config.height;
                                view.bind(this, temp);
                                node.setPosition(this.getTileViewPosition(temp, temp));
                                _delay = view.setPositionAndMove(position, this._tileSpeed, true);
                            } else {
                                view.bind(this, position);
                                node.setPosition(this.getTileViewPosition(temp, position));
                                _delay = view.animateScale();
                            }

                            delay = Math.max(delay, _delay);
                        }

                    }
                } else if (tileCommand instanceof TileSwapCommand) {
                    const [from, to] = tileCommand.getAffectedTiles();
                    const keyFrom = tilePositionToString(from.position);
                    const keyTo = tilePositionToString(to.position);
                    const viewFrom = this._tileViews.get(keyFrom);
                    const viewTo = this._tileViews.get(keyTo);
                    const isSameX = from.position.x === to.position.x;
                    const canFall = isSameX && from.position.y > to.position.y && tileCommand instanceof TileFallCommand;
                    viewFrom?.setPositionAndMove(to.position, this._tileSpeed, canFall);
                    viewTo?.setPositionAndMove(from.position, this._tileSpeed, false);
                    this._tileViews.delete(keyFrom);
                    this._tileViews.delete(keyTo);
                    viewFrom && this._tileViews.set(keyTo, viewFrom);
                    viewTo && this._tileViews.set(keyFrom, viewTo);

                    if (!(fieldCommand instanceof FieldFallCommand)) {
                        delay = Math.max(delay, 0.5);
                    }
                }
            }
        }

        if (delay === 0) this._isProcessing = false;
        else this.scheduleOnce(() => this._isProcessing = false, delay);
    }

    public getTileViewPosition(out: cc.Vec2, tilePosition: IVec2Like): cc.Vec2 {
        out.x = (tilePosition.x + 0.5 - this._config!.width / 2) * this._tileSize.x;
        out.y = (tilePosition.y + 0.5 - this._config!.height / 2) * this._tileSize.y;

        return out;
    }

    public bind(game: Game<Type, Color>) {
        this._game = game;
        this._config = game.config;

        game.on(GameEvent.DO_COMMAND, this.onDoCommands, this);
        game.on(GameEvent.UNDO_COMMAND, this.onUndoCommands, this);
    }

    public touchTile(position: IVec2Like) {
        this._game?.tryDoMove(position);
    }

    protected onDoCommands(commands: FieldCommand[]) {
        this._fieldCommandQueue.push({ type: 'do', commands });
    }

    protected onUndoCommands(commands: FieldCommand[]) {
        this._fieldCommandQueue.push({ type: 'undo', commands });
    }
}

const temp = new cc.Vec2();