import GameView from '../GameView';
import Rockets from './Rockets';

const { ccclass, property } = cc._decorator;

@ccclass
export default class RocketsHorizontal extends Rockets {
    public animate(position: IVec2Like, view: GameView): number {
        if (!view.config) return 0;
        const { field, game } = view.config;
        const rockets = [this._rocketA, this._rocketB];
        const width = game.config.width;
        const distance = width * view.tileSize.x;
        const rocketFlyTime = distance / view.tileSpeed;

        const scaleTime = 0.25;
        let maxDestroyDelay = 0;
        new cc.Tween(this.node)
            .to(scaleTime / 2, { scaleX: 0.5, scaleY: 1.5 }, { easing: 'sineOut' })
            .to(scaleTime / 2, { scaleX: 1, scaleY: 1 }, { easing: 'sineIn' })
            .call(() => {
                field[position.x][position.y] = null;

                for (let i = 0; i < 2; i++) {
                    new cc.Tween(rockets[i])
                        .by(rocketFlyTime, { x: distance * multipliers[i] })
                        .start();
                }

                for (let i = 1; i < width; i++) {
                    for (const multiplier of multipliers) {
                        const x = position.x + i * multiplier;
                        if (x < 0 || x >= width) continue;
                        const time = i * (view.tileSize.x / view.tileSpeed);
                        maxDestroyDelay = Math.max(maxDestroyDelay, time);
                        view.scheduleOnce(() => {
                            const tileView = field[x][position.y];
                            if (!tileView?.config) return;
                            if (tileView.config.tile.type === 'bonus') return;
                            tileView.animateDestroy();
                            field[x][position.y] = null;
                        }, time);
                    }
                }
            })
            .start()

        return scaleTime + Math.max(maxDestroyDelay, rocketFlyTime);
    }
}

const multipliers = [-1, 1];