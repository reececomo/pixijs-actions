import { Action } from '../../ActionClass';

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
    return new FadeByAction(-this.alpha, this.duration)._apply(this);
  }

  public _onTickerUpdate(target: Target, t: number, dt: number): void {
    target.alpha += this.alpha * dt;
  }
}
