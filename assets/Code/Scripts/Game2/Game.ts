import { getConnectedTilePositions, getNeighbors4 } from '../Game/Utils/Field';
import { getRandomElementArray } from '../Game1/Utils';
import { Command } from './Command/Command';
import { MergeCommand } from './Command/MergeCommand';
import { MoveCommand } from './Command/MoveCommand';
import { SetCommand } from './Command/SetCommand';
import { Config, MergeRule, Tile } from './Config';

export type CommandResult = { type: string; effectStart: IVec2Like; originalTileId: string; commands: Command[] };

export class Game extends cc.EventTarget {
  private _commands: { type: string, commands: Command[] }[][] = [];
  private _shuffles = 0;

  private _config: Config;
  public get config() {
    return this._config;
  }

  private _field: (Tile | null)[][] = [];
  public get field() {
    return this._field;
  }

  constructor(config: Config) {
    super();
    this._config = config;

    for (let x = 0; x < config.width; x++) {
      this._field.push([]);
      for (let y = 0; y < config.height; y++) {
        this._field[x][y] = this._generateDefaultTile();
      }
    }
  }

  public isInBounds({ x, y }: IVec2Like) {
    return x >= 0 && x < this._config.width && y >= 0 && y < this._config.height;
  }

  public matchTile(position: IVec2Like) {
    if (!this.isInBounds(position)) return;

    const field = this._field;
    const { x, y } = position;
    const tile = field[x][y]!;

    const group = this._getGroupByTileId(tile.id)!;
    const matchRuleGroup = this._config.match_rule_groups.find(_group => _group.group_id === group.group_id);
    if (!matchRuleGroup) return;
    const matchedTilePositions = this._getMatchedPositions(position);
    if (!matchedTilePositions.length) return;

    const commandsArr: CommandResult[] = [];

    let activateEffect = true;
    const mergeRuleGroup = this.config.merge_rule_groups.find(g => g.group_id === group.group_id);
    if (mergeRuleGroup?.merge_rules?.length) {
      const mergeResult: CommandResult = { type: 'merge', effectStart: position, originalTileId: tile.id, commands: [] as Command[] };
      let lastRule: MergeRule | undefined;
      for (const rule of mergeRuleGroup.merge_rules) {
        switch (rule.type) {
          case 'min_max':
            if (matchedTilePositions.length >= rule.min) lastRule = rule;
            break;
        }
      }

      if (lastRule) {
        for (const _position of matchedTilePositions) {
          const command = new MergeCommand(_position, position);
          command.do(field);
          mergeResult.commands.push(command);
        }

        const tileId = getRandomElementArray(lastRule.result);
        const tile = this._getTileByTileId(tileId);

        const command = new SetCommand(position, tile);
        command.do(field);
        mergeResult.commands.push(command);

        activateEffect = lastRule.activate_after_merge || false;
        commandsArr.push(mergeResult);
      }
    }

    if (activateEffect) {
      const nextBuffer: ReturnType<typeof this._activateTileEffect>[] = [{ effectStart: position, originalTileId: tile.id, positions: matchedTilePositions }];

      while (nextBuffer.length) {
        const next = nextBuffer.shift()!;
        const effectResult: CommandResult = { type: 'effect', effectStart: next.effectStart, originalTileId: next.originalTileId, commands: [] as Command[] };
        for (const position of next.positions) {
          const result = this._activateTileEffect(effectResult.commands, position);
          result && nextBuffer.push(result);
        }

        commandsArr.push(effectResult);
      }
    }

    const fallResult: CommandResult = { type: 'fall', effectStart: position, originalTileId: tile.id, commands: [] as Command[] };
    for (let x = 0; x < this._config.width; x++) {
      let lastEmptyY = -1;
      for (let y = 0; y < this._config.height; y++) {
        const current = field[x][y];
        if (current && lastEmptyY > -1) {
          const command = new MoveCommand({ x, y }, { x, y: lastEmptyY });
          command.do(field);
          fallResult.commands.push(command);
          lastEmptyY++;
        } else if (!current && lastEmptyY === -1) lastEmptyY = y;
      }
    }
    commandsArr.push(fallResult);

    const placeCommands = { type: 'place', effectStart: position, originalTileId: tile.id, commands: [] as Command[] };
    for (let x = 0; x < this._config.width; x++) {
      for (let y = 0; y < this._config.height; y++) {
        if (field[x][y]) continue;
        const command = new SetCommand({ x, y }, this._generateDefaultTile());
        command.do(field);
        placeCommands.commands.push(command);
      }
    }
    commandsArr.push(placeCommands);

    while (this._isNeedShuffle()) {
      this._shuffle();
    }

    this._commands.push(commandsArr);
    this.emit('DO_COMMANDS', commandsArr);
  }

  public getEffectByTileId(id: string) {
    const tile = this._getTileByTileId(id);
    const group = this._getGroupByTileId(id);

    return tile.effect || group.base_effect;
  }

  private _getMatchedPositions(position: IVec2Like): IVec2Like[] {
    const { x, y } = position;
    const tile = this._field[x][y]!;
    const { id } = tile;

    const group = this._getGroupByTileId(tile.id)!;
    const matchRuleGroup = this._config.match_rule_groups.find(_group => _group.group_id === group.group_id);
    if (!matchRuleGroup) return [];
    let matchedTilePositions: IVec2Like[];
    switch (matchRuleGroup.match_rule.matchBy) {
      case 'group_id':
        matchedTilePositions = this._getConnectedTilesById(position, id);
        break;
      case 'id':
        matchedTilePositions = this._getConnectedTilesByGroupId(position, group.group_id);
        break;
    }

    switch (matchRuleGroup.match_rule.type) {
      case 'match':
        if (matchedTilePositions.length < matchRuleGroup.match_rule.min) return [];
        break;
    }

    return matchedTilePositions;
  }

  private _getConnectedTilesById(position: IVec2Like, id: string) {
    return getConnectedTilePositions(this._field, position, (field, position) => getNeighbors4(field, position).filter(({ x, y }) => field[x][y]?.id === id));
  }

  private _getConnectedTilesByGroupId(position: IVec2Like, groupId: string) {
    return getConnectedTilePositions(this._field, position, (field, position) => getNeighbors4(field, position).filter(({ x, y }) => field[x][y] && this._getGroupByTileId(field[x][y].id)!.group_id === groupId));
  }

  private _activateTileEffect(commands: Command[], position: IVec2Like): { effectStart: IVec2Like, originalTileId: string; positions: IVec2Like[] } | undefined {
    const field = this._field;
    const tile = field[position.x][position.y];
    if (!tile) return;
    const group = this._getGroupByTileId(tile.id);
    const effect = tile.effect || group.base_effect;
    if (!effect) return;

    switch (effect.type) {
      case 'destroy': {
        const command = new SetCommand(position, null);
        command.do(field);
        commands.push(command);
        return;
      }
      case 'destroy_line': {
        const command = new SetCommand(position, null);
        command.do(field);
        commands.push(command);
        const positions = [];
        for (const direction of effect.directions) {
          positions.push(...this._destroyLine(position, direction));
        }
        return { effectStart: position, originalTileId: tile.id, positions };
      }
    }
  }

  private _generateDefaultTile(): Tile {
    const pull = [];
    const { groups, tiles } = this._config.default_tiles;
    pull.push(...tiles);
    for (const group of groups) {
      pull.push(...this._config.tile_groups.find(g => g.group_id === group)!.tiles.map(t => t.id));
    }

    const id = getRandomElementArray(pull);
    for (const group of this._config.tile_groups) {
      const tile = group.tiles.find(t => t.id === id);
      if (!tile) continue;
      return tile;
    }

    return undefined!;
  }

  private _getGroupByTileId(id: string) {
    return this._config.tile_groups.find(tileGroup => tileGroup.tiles.some(_tile => _tile.id === id))!;
  }

  private _getTileByTileId(id: string) {
    let result: Tile;
    for (const tileGroup of this._config.tile_groups) {
      result = result! || tileGroup.tiles.find(tile => tile.id === id);
    }

    return result!;
  }

  private _destroyLine({ x, y }: IVec2Like, direction: 'horizontal' | 'vertical'): IVec2Like[] {
    const result: IVec2Like[] = [];
    const { width, height } = this._config;

    //TODO: optimize
    if (direction === 'horizontal') {
      for (let i = 0; i < width; i++) {
        const x1 = x - i;
        const x2 = x + i;
        if (this.isInBounds({ x: x1, y })) {
          if (!this._field[x1][y]) continue;
          result.push({ x: x1, y });
        }
        if (this.isInBounds({ x: x2, y })) {
          if (!this._field[x2][y]) continue;
          result.push({ x: x2, y });
        }
      }
    } else {
      for (let i = 0; i < height; i++) {
        const y1 = y - i;
        const y2 = y + i;
        if (this.isInBounds({ x, y: y1 })) {
          if (!this._field[x][y1]) continue;
          result.push({ x, y: y1 });
        }
        if (this.isInBounds({ x, y: y2 })) {
          if (!this._field[x][y2]) continue;
          result.push({ x, y: y2 });
        }
      }
    }

    return result;
  }

  private _clearRadius(position: IVec2Like, radius: number): IVec2Like[] {
    if (radius === 0) return [];
    if (radius === 1) return [position];

    const _pos = { x: 0, y: 0 };
    const result: IVec2Like[] = [];
    const half = Math.ceil(radius / 2);
    for (let x = -half; x <= half; x++) {
      for (let y = -half; y <= half; y++) {
        _pos.x = position.x + x;
        _pos.y = position.y + y;
        if (!this.isInBounds(_pos) || !this._field[_pos.x][_pos.y]) continue;
        result.push({ ..._pos });
      }
    }

    return result;
  }

  private _isNeedShuffle(): boolean {
    for (let x = 0; x < this.config.width; x++) {
      for (let y = 0; y < this.config.height; y++) {
        if (this._getMatchedPositions({ x, y }).length) return false;
      }
    }

    return true;
  }

  private _shuffle() {
    
  }
}