import { Config } from '../Game3/Config';
import { Game } from '../Game3/Game';
import GameView from './GameView3';

const { ccclass, property } = cc._decorator;

@ccclass
export default class Main extends cc.Component {
    @property({ type: GameView, visible: true })
    private _gameView: GameView = null!;

    protected start(): void {
        const config: Config = {
            width: 9,
            height: 9,
        };
        const game = new Game(config);

        this._gameView.bind(game);
    }
}
