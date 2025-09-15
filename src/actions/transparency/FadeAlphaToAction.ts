import { Action } from '../../lib/Action';
import { IActionTicker } from '../../lib/IActionTicker';

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
    return new FadeAlphaToAction(this.a1, this.duration)._mutate(this);
  }

  protected onSetupTicker({ alpha }: TargetNode): any {
    return { a0: alpha };
  }

  protected onTick(
    target: TargetNode,
    t: number,
    dt: number,
    { data }: IActionTicker
  ): void {
    target.alpha = data.a0 + (this.a1 - data.a0) * t;
  }
}
