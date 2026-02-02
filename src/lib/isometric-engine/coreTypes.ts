export type CardinalDirection = 'north' | 'east' | 'south' | 'west';

export interface DirectionMeta {
  step: { x: number; y: number };
  vec: { dx: number; dy: number };
  angle: number;
  normal: { nx: number; ny: number };
}
