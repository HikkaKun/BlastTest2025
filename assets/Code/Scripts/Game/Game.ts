import { getRandomElementArray } from '../Utils/Arrays';
import { RocketTileAction } from './Actions/Bonus/RocketTileAction';
import { DeleteTilesAction } from './Actions/Common/DeleteTilesAction';
import { FallTilesAction } from './Actions/Common/FallTilesAction';
import { FillTilesAction } from './Actions/Common/FillTilesAction';
import { MergeTilesAction } from './Actions/Common/MergeTilesAction';
import { Color } from './Color';
import { Config } from './Config';
import { BonusTile, RocketBonusTile, Tile } from './Tile';
import { dijkstra, getNeighbors4 } from './Utils/Dijkstra';

export class Game extends cc.EventTarget {
  private _config: Config;
  public get config() {
    return this._config;
  }

  private _field: (Tile | null)[][];
  public get field() {
    return this._field;
  }

  constructor(config: Config) {
    super();

    this._config = config;
    this._field = [];
    for (let x = 0; x < config.width; x++) {
      const column: (Tile | null)[] = [];
      this._field.push(column);
      for (let y = 0; y < config.height; y++) {
        column.push(this._createRegularTile());
      }
    }
  }

  public userInput(position: IVec2Like) {
    const field = this._field;
    const tile = this._field[position.x][position.y];
    if (!tile) return;
    const actions = [];

    if (tile.type === 'color') {
      const matchedTilesPositions = this._getConnectedTilesPositionsByColorAndType(position);
      const count = matchedTilesPositions.length;
      if (count < 2) return;

      if (count > 4) {
        const rocket: RocketBonusTile = {
          type: 'bonus',
          bonusType: 'rocket',
          directions: [getRandomElementArray(['vertical', 'horizontal'])]
        };
        actions.push(new MergeTilesAction<Tile>(matchedTilesPositions, position, rocket).do(field));
      } else {
        actions.push(new DeleteTilesAction(matchedTilesPositions).do(field));
      }
    }
    if (tile.type === 'bonus') {
      const bonusTilePositions: IVec2Like[] = [position];
      do {
        const position = bonusTilePositions.shift()!;
        const tile = field[position.x][position.y] as BonusTile;
        switch (tile.bonusType) {
          case 'rocket':
            actions.push(new RocketTileAction(position, tile).do(this._field, bonusTilePositions));
            break;
        }
      } while (bonusTilePositions.length);
    }

    actions.push(
      new FallTilesAction().do(field),
      new FillTilesAction(() => this._createRegularTile()).do(field),
    );

    this.emit('DO_ACTIONS', actions);
    return actions;
  }

  private _createRegularTile(): Tile {
    const tile: Tile = {
      type: 'color',
      color: getRandomElementArray<Color>(['blue', 'green', 'purpure', 'red', 'yellow'])
    };

    return tile;
  }

  private _getConnectedTilesPositionsByColorAndType(startPosition: IVec2Like): IVec2Like[] {
    const tile = this._field[startPosition.x][startPosition.y];
    if (!tile) return [];
    const { color, type } = tile;

    return dijkstra(
      this._field,
      startPosition,
      (field, startPosition) => getNeighbors4(field, startPosition).filter(({ x, y }) => field[x][y]?.type === type && field[x][y].color === color)
    );
  }
}