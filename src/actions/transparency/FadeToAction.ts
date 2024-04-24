
import { Action } from '../../lib/Action';
import { IActionTicker } from '../../lib/IActionTicker';
import { DelayAction } from '../delay';

export class FadeToAction extends Action {
  public constructor(
      protected readonly alpha: number,
      duration: TimeInterval
  ) {
    super(duration);
  }

  protected onSetupTicker(target: TargetNode, ticker: IActionTicker): any {
    return {
      startAlpha: target.alpha
    };
  }

  protected onTick(target: TargetNode, t: number, dt: number, ticker: IActionTicker): void {
    target.alpha = ticker.data.startAlpha + (this.alpha - ticker.data.startAlpha) * t;
  }

  public reversed(): Action {
    return new DelayAction(this.scaledDuration);
  }
}
