import { MergeCommand } from '../../Command/MergeCommand';
import { SetCommand } from '../../Command/SetCommand';
import { ViewAnimation } from './ViewAnimation';

export class MergeViewAnimation extends ViewAnimation {
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
            delay = Math.max(delay, view.animateScale());
          }
          break;
        }
        case 'merge': {
          const command = originalCommand.copy() as MergeCommand;
          const { x, y } = command.from;
          const view = field[x][y]!;
          view.setPosition(command.to);
          const time = view.animateMerge(0.2);
          delay = Math.max(delay, time);
          view.scheduleOnce(() => view.node.destroy(), time);
          command.do(field);
          break;
        }
      }
    }

    return delay;
  }
}