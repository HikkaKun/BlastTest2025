export type Tile<Type extends string = string, Color extends string = string> = Readonly<{
    type: Type;
    color: Color;
}>;