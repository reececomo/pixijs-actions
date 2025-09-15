import { Action } from '../../lib/Action';
import { IActionTicker } from '../../lib/IActionTicker';

export class ScaleToAction extends Action {
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
    return new ScaleToAction(this.x, this.y, this.duration)._apply(this);
  }

  protected onSetupTicker(target: TargetNode): any {
    return {
      startX: target.scale.x,
      startY: target.scale.y
    };
  }

  protected onTick(
    { scale }: TargetNode,
    t: number,
    _: number,
    { data }: IActionTicker
  ): void {
    scale.set(
      this.x == null ? scale._x : data.startX + (this.x - data.startX) * t,
      this.y == null ? scale._y : data.startY + (this.y - data.startY) * t
    );
  }
}
