import { Field } from '../../Data/Field';
import { getConnectedTilePositions } from '../../Utils/Field';
import { TileReplaceCommand } from '../TileCommand/TileReplaceCommand';
import { FieldCommand } from './FieldCommand';

export class FieldBlastCommand extends FieldCommand {
  protected _position: IVec2Like;

  constructor(field: Field<string, string>, position: IVec2Like) {
    super(field);
    this._position = position;
  }

  public do() {
    const connectedTilePositions = getConnectedTilePositions(this._field, this._position);
    for (const position of connectedTilePositions) {
      const command = new TileReplaceCommand(this._field, position, null);
      command.do();
      this._tileCommands.push(command);
    }
  }
}