import { Action } from '../../ActionClass';

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

  public _onTickerUpdate(target: Target, t: number, dt: number): void {
    target.speed += this._speed * dt;
  }
}
