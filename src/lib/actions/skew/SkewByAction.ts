import { Action } from '../../ActionClass';
import { IActionTicker } from '../../IActionTicker';

export class SkewByAction extends Action {
  protected readonly dx: number;
  protected readonly dy: number;

  public constructor(
    dx: number,
    dy: number,
    duration: TimeInterval,
  ) {
    super(duration);

    this.dx = dx;
    this.dy = dy;
  }

  public reversed(): Action {
    return new SkewByAction(-this.dx, -this.dy, this.duration)._apply(this);
  }

  public _onTickerUpdate(
    { skew }: Target,
    t: number,
    dt: number,
  ): void {
    skew.set(skew._x + this.dx * dt, skew._y + this.dy * dt);
  }
}
