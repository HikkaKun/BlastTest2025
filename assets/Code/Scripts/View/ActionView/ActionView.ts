import { Action } from '../../Game/Actions/Action';
import { Tile } from '../../Game/Tile';
import GameView from '../GameView';

export abstract class ActionView<T extends Tile = Tile> {
  protected _action: Action<T>;
  protected _isPlaying = false;
  public get isPlaying() {
    return this._isPlaying;
  }

  constructor(action: Action<T>) {
    this._action = action;
  }

  public abstract play(view: GameView): typeof this;
}