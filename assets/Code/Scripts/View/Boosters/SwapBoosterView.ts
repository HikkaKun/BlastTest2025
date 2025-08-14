import { SwapTilesAction } from '../../Game/Actions/Boosters/SwapTilesAction';
import { Config } from '../../Game/Config';
import BoosterView from './BoosterView';

const { ccclass, property } = cc._decorator;

@ccclass
export default class SwapBoosterView extends BoosterView {
    private _positionA?: IVec2Like;
    private _positionB?: IVec2Like;

    protected _gameViewCustomInputCallback = (position: IVec2Like) => {
        if (!this._gameView?.config) return;

        if (!this._positionA) {
            return this._positionA = position;
        } else if (cc.Vec2.equals(this._positionA, position)) {
            return;
        }

        this._positionB = position;
        this._gameView.customInputCallback = null;
        this._gameView.config.game.doAction(new SwapTilesAction(this._positionA, this._positionB));
        delete this._positionA;
        delete this._positionB;
    }
}
