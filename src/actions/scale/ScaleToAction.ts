import { Action } from '../../lib/Action';
import { IActionTicker } from '../../lib/IActionTicker';

export class ScaleToAction extends Action {
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
    return new ScaleToAction(this.x1, this.y1, this.duration)._apply(this);
  }

  public _onTickerInit({ scale }: TargetNode): any {
    return { x0: scale._x, y0: scale._y };
  }

  public _onTickerTick(
    { scale }: TargetNode,
    t: number,
    _: number,
    { data }: IActionTicker
  ): void {
    scale.set(
      this.x1 == null ? scale._x : data.x0 + (this.x1 - data.x0) * t,
      this.y1 == null ? scale._y : data.y0 + (this.y1 - data.y0) * t
    );
  }
}
