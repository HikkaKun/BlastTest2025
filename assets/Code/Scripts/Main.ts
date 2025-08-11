import { Game } from './Game/Game';
import { GameConfig } from './Game/GameConfig';
import GameView from './View/GameView';

const { ccclass, property } = cc._decorator;

@ccclass
export default class Main extends cc.Component {
    @property({ visible: true, type: cc.JsonAsset })
    private _config: cc.JsonAsset = null!;

    @property({ visible: true, type: GameView })
    private _view: GameView = null!;

    protected start() {
        const config = this._config.json as GameConfig;
        const game = new Game(config);
        this._view.bind(game);

        game.start();

        // game.tryBlastPosition({ x: 1, y: 1 });
    }
}
