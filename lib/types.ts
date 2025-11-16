export type DPCell = {
  value: number;
  i: number;
  w: number;
  chosen?: boolean;
};

export type DPTableSnapshot = {
  dp: number[][];
  highlighted?: { i: number; w: number }[];
  pseudocodeLine?: number;
  note?: string;
  parents?: (number | null)[][];
  selectedItems?: (number | string)[];
};

export type DPStep = {
  snapshot: DPTableSnapshot;
  stepId: number;
};

export type KnapsackGeneratorOpts = {
  jumpToFinal?: boolean;
};
