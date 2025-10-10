import { Action } from '../../ActionClass';
import { IActionTicker } from '../../IActionTicker';

export class ScaleByAction extends Action {
  protected readonly x: number;
  protected readonly y: number;

  public constructor(
    x: number,
    y: number,
    duration: TimeInterval,
  ) {
    super(duration);

    this.x = x;
    this.y = y;
  }

  public reversed(): Action {
    return new ScaleByAction(1/this.x, 1/this.y, this.duration)._apply(this);
  }

  public _onTickerInit({ scale }: TargetNode): any {
    return {
      dx: scale.x * this.x - scale.x,
      dy: scale.y * this.y - scale.y
    };
  }

  public _onTickerTick(
    { scale }: TargetNode,
    t: number,
    dt: number,
    { data }: IActionTicker
  ): void {
    scale.set(scale._x + data.dx * dt, scale._y + data.dy * dt);
  }
}
