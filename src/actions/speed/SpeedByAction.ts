import { Action } from '../../lib/Action';
import { IActionTicker } from '../../lib/IActionTicker';

export class SpeedByAction extends Action {
  public constructor(
      protected readonly _speed: number,
      duration: TimeInterval,
  ) {
    super(duration);
  }

  protected onTick(target: TargetNode, t: number, dt: number, ticker: IActionTicker): void {
    target.rotation += this._speed * dt;
  }

  public reversed(): Action {
    return new SpeedByAction(-this._speed, this.duration);
  }
}
