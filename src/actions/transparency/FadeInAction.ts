import { Action } from '../../lib/Action';
import { IActionTicker } from '../../lib/IActionTicker';
import { FadeOutAction } from './FadeOutAction';

export class FadeInAction extends Action {
  protected onSetupTicker(target: TargetNode, ticker: IActionTicker): any {
    return {
      startAlpha: target.alpha
    };
  }

  protected onTick(target: TargetNode, t: number, dt: number, ticker: IActionTicker): void {
    target.alpha = ticker.data.startAlpha + (1.0 - ticker.data.startAlpha) * t;
  }

  public reversed(): Action {
    return new FadeOutAction(this.duration)
      .setSpeed(this.speed)
      .setTimingMode(this.timingMode);
  }
}