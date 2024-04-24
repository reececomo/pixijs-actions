import { Action } from '../../lib/Action';

export class RotateByAction extends Action {
  public constructor(
      protected readonly rotation: number,
      duration: TimeInterval,
  ) {
    super(duration);
  }

  protected onTick(target: TargetNode, t: number, dt: number): void {
    target.rotation += this.rotation * dt;
  }

  public reversed(): Action {
    return new RotateByAction(-this.rotation, this.duration)
      .setSpeed(this.speed)
      .setTimingMode(this.timingMode);
  }
}