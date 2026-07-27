import { TimingFunction } from "./Timing";

export interface IActionTicker<TickerData = any>
{
  // ----- Write-on-run state: -----
  readonly timing: TimingFunction;
  readonly duration: number;
  readonly speed: number;
  readonly elapsed: number;

  // ----- State: -----
  isDone: boolean;
  data: TickerData;

  // ----- Methods: -----
  tick(deltaTime: number): number;
  seek(deltaTime: number): void;
  reset(): void;
  destroy(): void;
}
