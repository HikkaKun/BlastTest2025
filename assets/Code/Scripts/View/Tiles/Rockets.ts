import GameView from '../GameView';

const { ccclass, property } = cc._decorator;

@ccclass
export default abstract class Rockets extends cc.Component {
    @property({ type: cc.Node, visible: true })
    protected _rocketA: cc.Node = null!;

    @property({ type: cc.Node, visible: true })
    protected _rocketB: cc.Node = null!;

    public abstract animate(position: IVec2Like, view: GameView): number;

    // public abstract animateCross(position: IVec2Like, view: GameView): number;
}
