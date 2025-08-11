import { FieldBlastCommand } from './Commands/FieldCommand/FieldBlastCommand';
import { FieldCommand } from './Commands/FieldCommand/FieldCommand';
import { FieldFallCommand } from './Commands/FieldCommand/FieldFallCommand';
import { FieldFillCommand } from './Commands/FieldCommand/FieldFillCommand';
import { Field } from './Data/Field';
import { GameConfig } from './GameConfig';
import { GameEvent } from './GameEvent';
import { TileStrategy } from './TileStrategy';
import { createField, getConnectedTilePositions } from './Utils/Field';

export class Game<Type extends string, Color extends string> extends cc.EventTarget {
  private _commands: FieldCommand[][] = [];

  private _config: GameConfig<Type, Color>;
  public get config(): Readonly<typeof this._config> {
    return this._config;
  }

  private _field: Field<Type, Color>;
  public get field(): Readonly<typeof this._field> {
    return this._field
  }

  public get width() {
    return this._config.width;
  }

  public get height() {
    return this._config.height;
  }

  constructor(config: GameConfig<Type, Color>) {
    super();

    this._config = config;
    const { width, height } = config;
    this._field = createField<Type, Color>(width, height, () => null);
  }

  private _doAndPushIfAffected(out: FieldCommand[], command: FieldCommand) {
    command.do();
    if (command.getTileCommands().length === 0) return out;
    out.push(command);

    return out;
  }

  public start() {
    const result = this._doAndPushIfAffected([], new FieldFillCommand(this._field, this._config, false));
    this._commands.push(result);
    this.emit(GameEvent.DO_COMMAND, result);
  }

  public canDoMoveAtTile(position: IVec2Like): boolean {
    const tile = this._field[position.x][position.y];
    if (!tile) return false;

    const tileStrategy = this._config.tileStrategies[tile.type];
    switch (tileStrategy) {
      case TileStrategy.DESTROY_SAME_COLOR:
        const connectedAmount = getConnectedTilePositions(this._field, position).length;
        if (connectedAmount < 2) return false;
      default:
        return true;
    }
  }

  public canDoAnyMoves(): boolean {
    const position = { x: 0, y: 0 };
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        position.x = x;
        position.y = y;
        if (this.canDoMoveAtTile(position)) return true;
      }
    }

    return false;
  }

  public tryDoMove(position: IVec2Like) {
    const commands: FieldCommand[] = [];
    const { x, y } = position;
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;

    if (!this.canDoMoveAtTile(position)) return;
    const tile = this._field[x][y]!;
    const tileStrategy = this._config.tileStrategies[tile.type];
    switch (tileStrategy) {
      case TileStrategy.DESTROY_SAME_COLOR:
        this._doAndPushIfAffected(commands, new FieldBlastCommand(this._field, position));

        if (commands[0].getTileCommands().length >= this.config.minTilesGroupForSuperTile) {
          
        } else {
          this._doAndPushIfAffected(commands, new FieldFallCommand(this._field, this._config));
          this._doAndPushIfAffected(commands, new FieldFillCommand(this._field, this._config, true));
        }
    }

    if (!commands.length) return;
    this._commands.push(commands);
    this.emit(GameEvent.DO_COMMAND, commands);
  }

  public undo() {
    const lastCommands = this._commands.pop();
    if (!lastCommands) return;
    lastCommands.reverse();
    for (const command of lastCommands) {
      command.undo();
    }

    this.emit(GameEvent.UNDO_COMMAND, lastCommands);
  }
}