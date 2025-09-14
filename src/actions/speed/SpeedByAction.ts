import { Action } from '../../lib/Action';

export class SpeedByAction extends Action {
  public constructor(
    protected readonly _speed: number,
    duration: TimeInterval,
  ) {
    super(duration);
  }

  public reversed(): Action {
    return new SpeedByAction(-this._speed, this.duration)._copyFrom(this);
  }

  protected onTick(target: TargetNode, t: number, dt: number): void {
    target.speed += this._speed * dt;
  }
}
