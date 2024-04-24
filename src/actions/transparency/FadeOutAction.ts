
import { Action } from '../../lib/Action';
import { IActionTicker } from '../../lib/IActionTicker';
import { FadeInAction } from './FadeInAction';

export class FadeOutAction extends Action {
  public reversed(): Action {
    return new FadeInAction(this.duration)
      .setTimingMode(this.timingMode)
      .setSpeed(this.speed);
  }

  protected onSetupTicker(target: TargetNode): any {
    return {
      startAlpha: target.alpha
    };
  }

  protected onTick(target: TargetNode, t: number, dt: number, ticker: IActionTicker): void {
    target.alpha = ticker.data.startAlpha + (0.0 - ticker.data.startAlpha) * t;
  }
}
