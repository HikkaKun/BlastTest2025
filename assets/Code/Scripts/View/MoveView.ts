import { Game } from '../Game/Game';

const { ccclass, property } = cc._decorator;

@ccclass
export default class MoveView extends cc.Component {
    @property({ type: cc.Label, visible: true })
    private _movesLabel: cc.Label = null!;

    @property({ type: cc.Label, visible: true })
    private _objectiveLabel: cc.Label = null!;

    private _game?: Game;

    public bind(game: Game) {
        this._game = game;
    }

    protected update(dt: number): void {
        if (!this._game) return;

        this._movesLabel.string = this._game.movesLeft.toString();
        this._objectiveLabel.string = `очки:\n${this._game.score}/${this._game.config.objectives[0].target}`;
    }
}
