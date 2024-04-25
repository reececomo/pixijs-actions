import { Action } from '../../lib/Action';
import { IActionTicker } from '../../lib/IActionTicker';
import { DelayAction } from '../delay';

export class SpeedToAction extends Action {
  public constructor(
    protected readonly _speed: number,
    duration: TimeInterval,
  ) {
    super(duration);
  }

  public reversed(): Action {
    return new DelayAction(this.scaledDuration);
  }

  protected onSetupTicker(target: TargetNode, ticker: IActionTicker): any {
    return {
      startSpeed: target.speed,
    };
  }

  protected onTick(
    target: TargetNode,
    t: number,
    dt: number,
    ticker: IActionTicker,
    deltaTime: number,
  ): void {
    target.speed = ticker.data.startSpeed + (this._speed - ticker.data.startSpeed) * t;
  }
}
