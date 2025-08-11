import { Tile } from './Data/Tile';
import { TileStrategy } from './TileStrategy';

export type GameConfig<Type extends string = string, Color extends string = string> = {
  width: number;
  height: number;
  tileStrategies: Record<Type, TileStrategy>;
  defaultTiles: { weight: number, tile: Tile<Type, Color> }[];
  minTilesGroupForSuperTile: number;
  superTiles: { weight: number, tile: Tile<Type, Color> }[];
}