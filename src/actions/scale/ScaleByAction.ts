import { Action } from '../../lib/Action';
import { IActionTicker } from '../../lib/IActionTicker';

export class ScaleByAction extends Action {
  public constructor(
    protected readonly x: number,
    protected readonly y: number,
    duration: TimeInterval,
  ) {
    super(duration);
  }

  public reversed(): Action {
    return new ScaleByAction(-this.x, -this.y, this.duration)._copyFrom(this);
  }

  protected onSetupTicker(target: TargetNode): any {
    return {
      dx: target.scale.x * this.x - target.scale.x,
      dy: target.scale.y * this.y - target.scale.y
    };
  }

  protected onTick(target: TargetNode, t: number, dt: number, ticker: IActionTicker): void {
    const scale = target.scale;
    const data = ticker.data;

    scale.set(
      scale._x + data.dx * dt,
      scale._y + data.dy * dt,
    );
  }
}
