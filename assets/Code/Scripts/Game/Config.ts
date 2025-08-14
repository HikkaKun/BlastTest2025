export type ScoreObjective = {
  type: 'score',
  target: number;
}

export type Objective = ScoreObjective;

export type Config = {
  width: number;
  height: number;
  moves: number;
  boosters: {
    swap: number;
    bomb: number;
  },
  objectives: Objective[],
}