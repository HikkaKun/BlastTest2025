import { SetCommand } from '../../Command/SetCommand';
import { ViewAnimation } from './ViewAnimation';

export class PlaceViewAnimation extends ViewAnimation {
  public play(): number {
    const field = this._view.viewField!;
    const game = this._view.game!;
    let delay = 0;
    for (const originalCommand of this._commandResult.commands) {
      switch (originalCommand.id) {
        case 'set': {
          const command = originalCommand.copy() as SetCommand;
          const { x, y } = command.position;
          field[x][y]?.node.destroy();
          field[x][y] = null;

          if (command.newValue) {
            const view = this._view.createTileView(command.position, command.newValue);
            field[x][y] = view;
            command.newValue = view;
            command.do(field);
            delay = Math.max(delay, this._view.getCanFallFromAbove(command.position) ? view.animateFall(this._view.tileSpeed, game.config.height) : view.animateScale());
          }
          break;
        }
      }
    }

    return delay;
  }
}