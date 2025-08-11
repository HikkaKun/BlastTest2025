import { Command } from '../Command/Command';
import { Tile } from '../Config';
import { CommandResult, Game } from '../Game';
import { EffectViewAnimation } from './Animations/EffectViewAnimation';
import { FallViewAnimation } from './Animations/FallViewAnimation';
import { MergeViewAnimation } from './Animations/MergeViewAnimation';
import { PlaceViewAnimation } from './Animations/PlaceViewAnimation';
import { ViewAnimation } from './Animations/ViewAnimation';
import TileView1 from './TileView1';

const { ccclass, property } = cc._decorator;

export type ViewField = (TileView1 | null)[][];

@ccclass
export default class GameView extends cc.Component {
    @property({ min: 0, visible: true })
    public readonly tileSpeed = 10;

    @property({ type: cc.Prefab, visible: true })
    private _tilePrefab: cc.Prefab = null!;

    @property({ visible: true })
    private _tileSize: cc.Vec2 = new cc.Vec2(100, 110);

    private _animation?: ViewAnimation;
    private _commands: CommandResult[][] = [];
    private _processingCommands: CommandResult[] = [];

    private _viewField?: ViewField;
    public get viewField() {
        return this._viewField;
    }

    private _game?: Game;
    public get game() {
        return this._game;
    }

    protected update(dt: number): void {
        if (this._animation || !this._game || !this._viewField) return;
        let commandResult: CommandResult;
        if (this._processingCommands.length) {
            commandResult = this._processingCommands.shift()!;
        } else {
            if (!this._commands.length) return;
            this._processingCommands.push(...this._commands.shift()!);
            commandResult = this._processingCommands.shift()!;
        }

        switch (commandResult.type) {
            case 'merge':
                this._animation = new MergeViewAnimation(this, commandResult);
                break;
            case 'effect':
                this._animation = new EffectViewAnimation(this, commandResult);
                break;
            case 'fall':
                this._animation = new FallViewAnimation(this, commandResult);
                break;
            case 'place':
                this._animation = new PlaceViewAnimation(this, commandResult);
                break;
        }

        const delay = this._animation!.play();
        this.scheduleOnce(() => delete this._animation, delay);
    }

    public bind(game: Game) {
        this._game = game;

        this._viewField = [];
        for (let x = 0; x < game.config.width; x++) {
            this._viewField.push([]);
            for (let y = 0; y < game.config.height; y++) {
                const tile = game.field[x][y];
                this._viewField[x][y] = tile ? this.createTileView({ x, y }, tile) : null;
            }
        }

        game.on('DO_COMMANDS', this.onDoCommands, this);
    }

    public matchTile(position: IVec2Like) {
        this._game?.matchTile(position);
    }

    public getViewPosition(out: cc.Vec2, tilePosition: IVec2Like) {
        out.x = (tilePosition.x + 0.5 - this._game!.config.width / 2) * this._tileSize.x;
        out.y = (tilePosition.y + 0.5 - this._game!.config.height / 2) * this._tileSize.y;

        return out;
    }

    public createTileView(position: IVec2Like, tile: Tile) {
        const node = cc.instantiate(this._tilePrefab);
        node.setParent(this.node);
        node.setPosition(this.getViewPosition(temp, position));
        const view = node.getComponent(TileView1);
        view.bind(this, tile, position);

        return view;
    }

    public getCanFallFromAbove(position: IVec2Like): boolean {
        const column = this._viewField![position.x];
        for (let y = position.y + 1; y < this._game!.config.height; y++) {
            if (column[y]) return false;
        }

        return true;
    }

    protected onDoCommands(commands: CommandResult[]) {
        this._commands.push(commands);
    }
}

const temp = new cc.Vec2();