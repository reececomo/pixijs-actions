import { Action } from '../../lib/Action';
import { IActionTicker } from '../../lib/IActionTicker';

export class ScaleByAction extends Action {
  public constructor(
    protected readonly x: number,
    protected readonly y: number,
    duration: TimeInterval,
  ) {
    super(duration);
  }

  public reversed(): Action {
    return new ScaleByAction(-this.x, -this.y, this.duration)
      .setTimingMode(this.timingMode)
      .setSpeed(this.speed);
  }

  protected onTick(target: TargetNode, t: number, dt: number, ticker: IActionTicker): void {
    target.scale.set(
      target.scale.x + this.x * dt,
      target.scale.y + this.y * dt,
    );
  }
}
