import GameView from '../GameView';

const { ccclass, property } = cc._decorator;

@ccclass
export default class Bomb extends cc.Component {
    public animate(view: GameView, position: IVec2Like, radius: number) {
        if (!view.config) return 0;
        const { field, game } = view.config;
        const { width, height } = game.config;
        const { x, y } = position;

        const time = 0.3;
        let destroyDelay = 0;
        new cc.Tween(this.node)
            .to(time, { scale: radius * 2 - 1 }, { easing: 'backIn' })
            .call(() => {
                destroyDelay = Math.max(destroyDelay, field[x][y]!.animateDestroy())
                const _radius = radius - 1;
                for (let _x = x - _radius; _x <= x + _radius; _x++) {
                    for (let _y = y - _radius; _y <= y + _radius; _y++) {
                        if (_x >= 0 && _x < width && _y >= 0 && y < height) {
                            const tileView = field[_x][_y];
                            if (!tileView?.config || tileView.config.tile.type === 'bonus' || (_x === x && _y === y)) continue;
                            const position = { x: _x, y: _y };
                            Math.max(destroyDelay, tileView.animateDestroy());
                            field[position.x][position.y] = null;
                        }
                    }
                }
            })
            .start();

        return time + destroyDelay + 0.1;
    }
}
