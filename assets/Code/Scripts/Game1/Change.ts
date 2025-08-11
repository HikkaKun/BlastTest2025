export type SetChange = {
  type: 'set',
  position: IVec2Like;
  value: string;
}

export type SwapChange = {
  type: 'swap',
  from: IVec2Like;
  to: IVec2Like;
}

export type MergeChange = {
  type: 'merge',
  from: IVec2Like;
  to: IVec2Like;
  mergeValue: string;
}

export type Change = SetChange | SwapChange | MergeChange;