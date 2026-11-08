import { TimingFunction } from "./Timing";

export interface IActionTicker<TickerData = any>
{
  // ----- Write-on-run state: -----
  readonly timing: TimingFunction;
  readonly duration: number;
  readonly speed: number;

  // ----- Update state: -----
  readonly t: number;
  readonly dt: number;
  readonly deltaTime: number;

  // ----- State: -----
  isDone: boolean;
  data: TickerData;

  // ----- Stepping: -----
  _delta: number;
  readonly _remaining: number;
  _step(): void;

  // ----- Methods: -----
  tick(deltaTime: number): number;
  reset(): void;
  destroy(): void;
}
