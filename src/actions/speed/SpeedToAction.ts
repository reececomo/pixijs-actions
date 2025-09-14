import { Action } from '../../lib/Action';
import { IActionTicker } from '../../lib/IActionTicker';

export class SpeedToAction extends Action {
  public constructor(
    protected readonly _speed: number,
    duration: TimeInterval,
  ) {
    super(duration);
  }

  public reversed(): Action {
    return new SpeedToAction(this._speed, this.duration)._copyFrom(this);
  }

  protected onSetupTicker(target: TargetNode): any {
    return {
      startSpeed: target.speed,
    };
  }

  protected onTick(
    target: TargetNode,
    t: number,
    dt: number,
    ticker: IActionTicker
  ): void {
    target.speed = ticker.data.startSpeed + (this._speed - ticker.data.startSpeed) * t;
  }
}
