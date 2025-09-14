import { Action } from '../../lib/Action';
import { IActionTicker } from '../../lib/IActionTicker';

export class FadeAlphaToAction extends Action {
  public constructor(
    protected readonly alpha: number,
    duration: TimeInterval
  ) {
    super(duration);
  }

  public reversed(): Action {
    return new FadeAlphaToAction(this.alpha, this.duration)._copyFrom(this);
  }

  protected onSetupTicker(target: TargetNode): any {
    return {
      startAlpha: target.alpha
    };
  }

  protected onTick(target: TargetNode, t: number, dt: number, ticker: IActionTicker): void {
    target.alpha = ticker.data.startAlpha + (this.alpha - ticker.data.startAlpha) * t;
  }
}
