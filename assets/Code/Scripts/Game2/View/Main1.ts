// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { Game } from '../Game';
import GameView from './GameView1';

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    @property({ type: cc.JsonAsset, visible: true })
    private _json: cc.JsonAsset = null!;

    @property({ type: GameView, visible: true })
    private _view: GameView = null!;

    protected start(): void {
        const game = new Game(this._json.json);
        this._view.bind(game);
    }
}
