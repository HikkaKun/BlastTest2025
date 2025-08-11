export type Direction = 'vertical' | 'horizontal';

export type ClearLineEffect = {
  type: 'clear_line';
  directions: Direction | Direction[];
}

export type ClearRadiusEffect = {
  type: 'clear_radius';
  radius: number;
}

export type ClearColorEffect = {
  type: 'clear_color'
  color: string;
}

export type Effect = ClearLineEffect | ClearRadiusEffect | ClearColorEffect;

export type Tile = {
  effect?: Effect;
};

export type TileGroup = Record<string, Tile>;

export type GameTile = {
  type: string;
  effect?: Partial<Effect>;
};

export type MinMaxMatchRule = {
  type: "min_max";
  min?: number;
  max?: number;
}

export type MatchRule = MinMaxMatchRule;

export type MinMaxMergeRule = {
  min?: number;
  max?: number;
}

export type MergeRule = { result: string | string[] } & MinMaxMergeRule;

export type ComboRule = {
  include: (string | string[])[];
  result: string | string[] | string[][];
};

export type ScoreObjective = {
  type: 'score';
  target: number;
}

export type Objectives = ScoreObjective;

export type Config = {
  id: string;
  width: number;
  height: number;
  movesLimit: number;
  tileTypes: Record<string, TileGroup>;
  grid?: GameTile[][];
  defaultTiles: Record<string, string[]>;
  matchRules: Record<string, Record<string, MatchRule>>;
  mergeRules: Record<string, Record<string, MergeRule>>;
  comboRules: Record<string, Record<string, ComboRule>>;
  objectives: Objectives[];
}
