import { Color } from './Color';

export type ColorTile = {
  type: 'color';
  color: Color;
}

export type RocketBonusTile = {
  bonusType: 'rocket';
  directions: ('horizontal' | 'vertical')[];
}

export type BonusTile = {
  type: 'bonus';
  color?: Color;
} & RocketBonusTile;

export type Tile = ColorTile | BonusTile;