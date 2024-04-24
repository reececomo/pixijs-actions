
import { Action } from '../../lib/Action';

export class MoveByAction extends Action {
  public constructor(
      protected readonly x: number,
      protected readonly y: number,
      duration: number,
  ) {
    super(duration);
  }

  public reversed(): Action {
    return new MoveByAction(-this.x, -this.y, this.duration)
      .setTimingMode(this.timingMode)
      .setSpeed(this.speed);
  }

  protected onTick(target: TargetNode, t: number, dt: number): void {
    target.position.x += this.x * dt;
    target.position.y += this.y * dt;
  }
}
