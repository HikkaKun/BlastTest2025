import { getRandomElementArray } from '../Utils/Arrays';
import { Action } from './Actions/Action';
import { BombTileAction } from './Actions/Bonus/BombTileAction';
import { RocketTileAction } from './Actions/Bonus/RocketTileAction';
import { SwapTilesAction } from './Actions/Boosters/SwapTilesAction';
import { SetCommand } from './Actions/Commands/SetCommand';
import { DeleteTilesAction } from './Actions/Common/DeleteTilesAction';
import { FallTilesAction } from './Actions/Common/FallTilesAction';
import { FillTilesAction } from './Actions/Common/FillTilesAction';
import { MergeTilesAction } from './Actions/Common/MergeTilesAction';
import { Color } from './Color';
import { Config } from './Config';
import { BombBonusTile, BonusTile, RocketBonusTile, Tile } from './Tile';
import { dijkstra, getNeighbors4 } from './Utils/Dijkstra';

export class Game extends cc.EventTarget {
  private _movesLeft: number;
  public get movesLeft() {
    return this._movesLeft;
  }

  private _score = 0;
  public get score() {
    return this._score;
  }

  private _config: Config;
  public get config() {
    return this._config;
  }

  private _field: (Tile | null)[][];
  public get field() {
    return this._field;
  }

  private _boosters: Config['boosters'];
  public get boosters() {
    return this._boosters;
  }

  constructor(config: Config) {
    super();

    this._config = config;
    this._movesLeft = config.moves;
    this._boosters = Object.assign({}, config.boosters);
    this._field = [];
    for (let x = 0; x < config.width; x++) {
      const column: (Tile | null)[] = [];
      this._field.push(column);
      for (let y = 0; y < config.height; y++) {
        column.push(this._createRegularTile());
      }
    }
  }

  public userInput(position: IVec2Like, actions: Action<Tile>[] = [], spendMove = true) {
    const field = this._field;
    const tile = this._field[position.x][position.y];
    if (!tile) return;

    if (tile.type === 'color') {
      const matchedTilesPositions = this._getConnectedTilesPositionsByColorAndType(position);
      const count = matchedTilesPositions.length;
      if (count < 2) return;

      if (count > 4 && count <= 6) {
        const rocket: RocketBonusTile = {
          type: 'bonus',
          bonusType: 'rocket',
          directions: [getRandomElementArray(['vertical', 'horizontal'])]
        };
        actions.push(new MergeTilesAction<Tile>(matchedTilesPositions, position, rocket).do(field));
      } else if (count > 6) {
        const bomb: BombBonusTile = {
          type: 'bonus',
          bonusType: 'bomb',
          radius: 2
        };
        actions.push(new MergeTilesAction<Tile>(matchedTilesPositions, position, bomb).do(field));
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
            actions.push(new RocketTileAction(position).do(this._field, bonusTilePositions));
            break;
          case 'bomb':
            actions.push(new BombTileAction(position).do(this._field, bonusTilePositions));
            break;
        }
      } while (bonusTilePositions.length);
    }

    actions.push(
      new FallTilesAction().do(field),
      new FillTilesAction(() => this._createRegularTile()).do(field),
    );

    spendMove && this._movesLeft--;

    actions.forEach(a => a.commands.forEach(c => {
      if (c instanceof SetCommand && c.newValue == null) this._score += 10;
    }))

    let isWin = false;
    for (const objective of this.config.objectives) {
      switch (objective.type) {
        case 'score':
          if (this.score >= objective.target) isWin = true;
          break;
      }
    }

    if (this.movesLeft <= 0 && !isWin) {
      this.emit('LOSE');
    } else if (isWin) {
      this.emit('WIN');
    }

    this.emit('DO_ACTIONS', actions);
  }

  public doAction(action: Action<Tile>) {
    if (action instanceof SwapTilesAction) {
      this._boosters.swap--;
      action.do(this.field);
    }
    //  else if (action instanceof BombTileAction) {
    //   this._boosters.bomb--;
    //   return this.userInput(action.position, [action], false);
    // }

    this.emit('DO_ACTIONS', [action]);
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