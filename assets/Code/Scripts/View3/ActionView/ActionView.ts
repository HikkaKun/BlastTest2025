import { Action } from '../../Game3/Actions/Action';
import { Tile } from '../../Game3/Tile';
import GameView from '../GameView3';

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