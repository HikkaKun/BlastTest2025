import { CommandResult } from '../../Game';
import GameView from '../GameView1';

export abstract class ViewAnimation {
  protected _view: GameView;
  protected _commandResult: CommandResult;

  constructor(view: GameView, commandResult: CommandResult) {
    this._view = view;
    this._commandResult = commandResult;
  }

  public abstract play(): number;
}