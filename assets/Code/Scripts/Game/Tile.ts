import { Color } from './Color';

export type ColorTile = {
  type: 'color';
  color: Color;
}

export type BaseBonusTile = {
  type: 'bonus';
  color?: Color;
}

export type RocketBonusTile = BaseBonusTile & {
  bonusType: 'rocket';
  directions: ('horizontal' | 'vertical')[];
}

export type BonusTile = RocketBonusTile;

export type Tile = ColorTile | BonusTile;