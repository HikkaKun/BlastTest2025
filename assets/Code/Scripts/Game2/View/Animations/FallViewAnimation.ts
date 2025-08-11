import { MoveCommand } from '../../Command/MoveCommand';
import { ViewAnimation } from './ViewAnimation';

export class FallViewAnimation extends ViewAnimation {
  public play(): number {
    const field = this._view.viewField!;
    const game = this._view.game!;
    const tileSpeed = this._view.tileSpeed;
    let delay = 0;
    for (const originalCommand of this._commandResult.commands) {
      switch (originalCommand.id) {
        case 'move': {
          const command = originalCommand.copy() as MoveCommand;
          command.do(field);
          const { x, y } = command.to;
          const view = field[x][y]!;
          view.setPosition(command.to);
          delay = Math.max(delay, view.animateFall(tileSpeed));
          break;
        }
      }
    }

    return delay;
  }
}