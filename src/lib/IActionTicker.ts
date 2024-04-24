import { TimingModeFn } from "../TimingMode";

export interface IActionTicker {
  // Action write-on-run settings:
  readonly scaledDuration: number;
  readonly speed: number;
  readonly timingMode: TimingModeFn;

  // Iteration:
  readonly timeDistance: number;

  // State:
  autoComplete: boolean;
  isDone: boolean;
  data: any;

  // Methods:
  tick(deltaTime: number): number;
  reset(): void;
}
