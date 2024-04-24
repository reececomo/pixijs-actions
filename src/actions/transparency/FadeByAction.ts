
import { Action } from '../../lib/Action';

export class FadeByAction extends Action {
  public constructor(
      protected readonly alpha: number,
      duration: TimeInterval,
  ) {
    super(duration);
  }

  protected onTick(target: TargetNode, t: number, dt: number): void {
    target.alpha += this.alpha * dt;
  }

  public reversed(): Action {
    return new FadeByAction(-this.alpha, this.duration)
      .setSpeed(this.speed)
      .setTimingMode(this.timingMode);
  }
}
