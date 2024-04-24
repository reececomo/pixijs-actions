
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

  protected onSetupTicker(target: TargetNode, ticker: IActionTicker): any {
    return {
      startSpeed: target.speed
    };
  }

  protected onTick(target: TargetNode, t: number, dt: number, ticker: IActionTicker): void {
    target.rotation = ticker.data.startRotation + (this._speed - ticker.data.startSpeed) * t;
  }

  public reversed(): Action {
    return new DelayAction(this.scaledDuration);
  }
}
