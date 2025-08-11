export type DestroyEffect = {
  type: 'destroy';
}

export type DestroyLineEffect = {
  type: 'destroy_line';
  directions: ('horizontal' | 'vertical')[];
}

export type Effect = DestroyEffect | DestroyLineEffect;

export type Tile = {
  id: string;
  effect?: Effect;
  sprite: string;
}

export type TileGroup = {
  group_id: string;
  base_effect?: Effect;
  tiles: Tile[];
};

export type MatchMatchRule = {
  type: 'match';
  min: number;
}

export type MatchRule = { matchBy: 'id' | 'group_id'; } & MatchMatchRule;

export type MatchRuleGroup = {
  group_id: string;
  match_rule: MatchRule;
}

export type DefaultTiles = {
  groups: string[];
  tiles: string[];
}

export type MinMaxMergeRule = {
  type: "min_max";
  min: number;
}

export type MergeRule = {
  activate_after_merge?: true;
  result: string[];
} & MinMaxMergeRule;

export type MergeRuleGroup = {
  group_id: string;
  merge_rules: MergeRule[];
}

export type Config = {
  id: string;
  width: number;
  height: number;
  maxShuffles: number;
  tile_groups: TileGroup[];
  match_rule_groups: MatchRuleGroup[];
  default_tiles: DefaultTiles;
  merge_rule_groups: MergeRuleGroup[];
}