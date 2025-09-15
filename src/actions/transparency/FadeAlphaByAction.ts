import { Action } from '../../lib/Action';

export class FadeByAction extends Action {
  protected readonly alpha: number;

  public constructor(
    alpha: number,
    duration: TimeInterval,
  ) {
    super(duration);
    this.alpha = alpha;
  }

  public reversed(): Action {
    return new FadeByAction(-this.alpha, this.duration)._mutate(this);
  }

  protected onTick(target: TargetNode, t: number, dt: number): void {
    target.alpha += this.alpha * dt;
  }
}
