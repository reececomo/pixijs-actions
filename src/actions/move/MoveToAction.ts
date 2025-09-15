import { Action } from '../../lib/Action';
import { IActionTicker } from '../../lib/IActionTicker';

export class MoveToAction extends Action {
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
    return new MoveToAction(this.x1, this.y1, this.duration)._mutate(this);
  }

  protected onSetupTicker({ position }: TargetNode): any {
    return { x0: position._x, y0: position._y };
  }

  protected onTick(
    { position }: TargetNode,
    t: number,
    dt: number,
    { data }: IActionTicker,
  ): void {
    position.set(
      this.x1 == null ? position._x : data.x0 + (this.x1 - data.x0) * t,
      this.y1 == null ? position._y : data.y0 + (this.y1 - data.y0) * t
    );
  }
}
