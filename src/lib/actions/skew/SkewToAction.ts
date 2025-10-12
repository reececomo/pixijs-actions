import { Action } from '../../ActionClass';
import { IActionTicker } from '../../IActionTicker';

export class SkewToAction extends Action {
  protected readonly x1: number | null;
  protected readonly y1: number | null;

  public constructor(
    x: number | null,
    y: number | null,
    duration: TimeInterval,
  ) {
    super(duration);

    this.x1 = x;
    this.y1 = y;
  }

  public reversed(): Action {
    return new SkewToAction(this.x1, this.y1, this.duration)._apply(this);
  }

  public _onTickerInit({ skew }: TargetNode): any {
    return { x0: skew._x, y0: skew._y };
  }

  public _onTickerTick(
    { skew }: TargetNode,
    t: number,
    _: number,
    { data }: IActionTicker
  ): void {
    skew.set(
      this.x1 == null ? skew._x : data.x0 + (this.x1 - data.x0) * t,
      this.y1 == null ? skew._y : data.y0 + (this.y1 - data.y0) * t
    );
  }
}
