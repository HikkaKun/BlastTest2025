import { Tile } from './Tile';

export type Field<Type extends string = string, Color extends string = string> = (Tile<Type, Color> | null)[][];