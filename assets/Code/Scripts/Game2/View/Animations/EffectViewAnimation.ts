import { SetCommand } from '../../Command/SetCommand';
import { ViewAnimation } from './ViewAnimation';

export class EffectViewAnimation extends ViewAnimation {
  public play() {
    const field = this._view.viewField!;
    const game = this._view.game!;
    const effect = game.getEffectByTileId(this._commandResult.originalTileId)!;

    switch (effect.type) {
      case 'destroy':
        return this._animateMatch();
      case 'destroy_line':
        return this._animateRocket();
    }
  }

  private _animateMatch(): number {
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

  private _animateRocket(): number {
    const field = this._view.viewField!;
    const game = this._view.game!;
    let delay = 0;

    for (let i = 0; i < this._commandResult.commands.length; i++) {
      const originalCommand = this._commandResult.commands[i];
      if (!originalCommand) continue;
      switch (originalCommand.id) {
        case 'set': {
          const command = originalCommand.copy() as SetCommand;
          const { x, y } = command.position;
          const view = field[x][y];
          if (view) {
            const time = i * 0.05;
            view.scheduleOnce(() => view.node.destroy(), time);
            delay = Math.max(delay, time);
          }
          field[x][y] = null;
          break;
        }
      }
    }

    return delay;
  }
}