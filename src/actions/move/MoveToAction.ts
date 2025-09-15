import { Action } from '../../lib/Action';
import { IActionTicker } from '../../lib/IActionTicker';

export class MoveToAction extends Action {
  protected readonly x: number | null;
  protected readonly y: number | null;

  public constructor(
    x: number | null,
    y: number | null,
    duration: TimeInterval,
  ) {
    super(duration);

    this.x = x;
    this.y = y;
  }

  public reversed(): Action {
    return new MoveToAction(this.x, this.y, this.duration)._apply(this);
  }

  protected onSetupTicker(target: TargetNode): any {
    return {
      startX: target.x,
      startY: target.y
    };
  }

  protected onTick(target: TargetNode, t: number, dt: number, ticker: IActionTicker): void {
    const position = target.position;
    const data = ticker.data;

    position.set(
      this.x == null ? position._x : data.startX + (this.x - data.startX) * t,
      this.y == null ? position._y : data.startY + (this.y - data.startY) * t
    );
  }
}
