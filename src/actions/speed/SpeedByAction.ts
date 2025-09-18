import { Action } from '../../lib/Action';

export class SpeedByAction extends Action {
  protected readonly _speed: number;

  public constructor(
    speed: number,
    duration: TimeInterval,
  ) {
    super(duration);

    this._speed = speed;
  }

  public reversed(): Action {
    return new SpeedByAction(-this._speed, this.duration)._apply(this);
  }

  public _onTickerTick(target: TargetNode, t: number, dt: number): void {
    target.speed += this._speed * dt;
  }
}
