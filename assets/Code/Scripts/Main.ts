import { Config } from './Game/Config';
import { Game } from './Game/Game';
import BoosterView from './View/Boosters/BoosterView';
import GameView from './View/GameView';

const { ccclass, property } = cc._decorator;

@ccclass
export default class Main extends cc.Component {
    @property({ type: GameView, visible: true })
    private _gameView: GameView = null!;

    @property({ type: BoosterView, visible: true })
    private _boosterViews: BoosterView[] = [];

    protected start(): void {
        const config: Config = {
            width: 9,
            height: 9,
            moves: 40,
            boosters: {
                bomb: 5,
                swap: 5
            }
        };
        const game = new Game(config);

        this._gameView.bind(game);
        this._boosterViews.forEach(view => view.bind(this._gameView));
    }
}
