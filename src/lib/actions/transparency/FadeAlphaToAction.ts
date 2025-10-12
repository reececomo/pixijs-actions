import { Action } from '../../ActionClass';
import { IActionTicker } from '../../IActionTicker';

export class FadeAlphaToAction extends Action {
  protected readonly a1: number;

  public constructor(
    alpha: number,
    duration: TimeInterval,
  ) {
    super(duration);
    this.a1 = alpha;
  }

  public reversed(): Action {
    return new FadeAlphaToAction(this.a1, this.duration)._apply(this);
  }

  public _onTickerAdded({ alpha }: Target): any {
    return { a0: alpha };
  }

  public _onTickerUpdate(
    target: Target,
    t: number,
    dt: number,
    { data }: IActionTicker
  ): void {
    target.alpha = data.a0 + (this.a1 - data.a0) * t;
  }
}
