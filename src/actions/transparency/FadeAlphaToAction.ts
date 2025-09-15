import { Action } from '../../lib/Action';
import { IActionTicker } from '../../lib/IActionTicker';

export class FadeAlphaToAction extends Action {
  protected readonly alpha1: number;

  public constructor(
    alpha: number,
    duration: TimeInterval,
  ) {
    super(duration);
    this.alpha1 = alpha;
  }

  public reversed(): Action {
    return new FadeAlphaToAction(this.alpha1, this.duration)._apply(this);
  }

  protected onSetupTicker(target: TargetNode): any {
    return { alpha0: target.alpha };
  }

  protected onTick(
    target: TargetNode,
    t: number,
    dt: number,
    { data }: IActionTicker
  ): void {
    target.alpha = data.alpha0 + (this.alpha1 - data.alpha0) * t;
  }
}
