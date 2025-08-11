import { getConnectedTilePositions, getNeighbors4 } from '../Game/Utils/Field';
import { Change } from './Change';
import { Config, GameTile } from './Config';
import { getRandomElementArray } from './Utils';

export class Game extends cc.EventTarget {
    private _config: Config;
    private _field: GameTile[][];

    constructor(config: Config) {
        super();

        this._config = config;
        if (config.grid) {
            this._field = config.grid;
        } else {
            this._field = [];
            for (let x = 0; x < config.width; x++) {
                const column: GameTile[] = [];
                this._field.push(column);
                for (let y = 0; y < config.height; y++) {
                    column.push(this._getRandomDefaultTile(config));
                }
            }
        }
    }

    public isInBounds(position: IVec2Like) {
        const { x, y } = position;
        return x >= 0 && x < this._config.width && y >= 0 && y < this._config.height;
    }

    public tryMove(position: IVec2Like) {
        if (!this.isInBounds(position)) return;
        const changes: Change[] = [];
        const { x, y } = position;
        const tileId = this._field[x][y];
        const tile = this._config.tiles[tileId];

        const connectedPositionsBySameType = getConnectedTilePositions(this._field, position, (field, position) => getNeighbors4(field, position).filter(({ x, y }) => field[x][y] === field[position.x][position.y]));
        const connectedCount = connectedPositionsBySameType.length;
        if (tile.type === 'color') {
            if (!tile.matchRule) return;
            if (connectedCount < tile.matchRule.minMatch) return;

            for (const effect of tile.matchRule.effects) {
                switch (effect) {
                    case 'destroy':
                        this._setTilesValue(changes, connectedPositionsBySameType, '');
                        for (const rule of this._config.bonusRules) {
                            let lastRule;
                            for (let i = 0; i < connectedCount; i++) {
                                lastRule = lastRule || rule[i.toString()];
                            }
                        }
                        break;
                }
            }
        }

        if (!tile.matchRule) return
        if (connectedCount < tile.matchRule.minMatch) return;

        for (const effect of tile.matchRule.effects) {
            switch (effect.type) {
                case 'destroy':
                    const matchRule = this._config.bonusRules.color;
                    let lastMatchRuleTileId: string | undefined;
                    for (let i = 0; i <= connectedCount; i++) {
                        lastMatchRuleTileId = lastMatchRuleTileId || matchRule[i];
                    }

                    if (!lastMatchRuleTileId) {
                        this._setTilesValue(changes, connectedPositionsBySameType, '');
                    } else {
                        this._mergeTilesIntoPosition(changes, connectedPositionsBySameType, position, lastMatchRuleTileId);
                    }
                    break;
            }
        }
    }

    private _getRandomDefaultTile(config: Config) {
        const keys = Object.keys(config.defaultTiles);
        const group = getRandomElementArray(keys);;
        const type = getRandomElementArray(config.defaultTiles[group]);
        const tile: GameTile = { type };
        const effect = config.tileTypes[group][type].effect;
        if (effect) tile.effect = { ...effect };
        return tile;
    }

    private _setTilesValue(out: Change[], positions: IVec2Like[], value: string) {
        out.push(...positions.map<Change>(position => {
            this._field[position.x][position.y] = value;
            return {
                type: 'set',
                position,
                value
            };
        }));
    }

    private _mergeTilesIntoPosition(out: Change[], positions: IVec2Like[], mergePosition: IVec2Like, mergeValue: string) {
        out.push(...positions.map<Change>(position => {
            return {
                type: 'merge',
                from: position,
                to: mergePosition,
                mergeValue,
            };
        }))
    }
}

//1. match same type tiles
//2. check if has any bonusRules
//3. if has - execute bonusRules
//4. execute effects