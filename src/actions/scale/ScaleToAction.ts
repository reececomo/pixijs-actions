import { Action } from '../../lib/Action';
import { IActionTicker } from '../../lib/IActionTicker';

export class ScaleToAction extends Action {
  public constructor(
    protected readonly x: number | undefined,
    protected readonly y: number | undefined,
    duration: TimeInterval,
  ) {
    super(duration);
  }

  public reversed(): Action {
    return new ScaleToAction(this.x, this.y, this.duration)._copyFrom(this);
  }

  protected onSetupTicker(target: TargetNode): any {
    return {
      startX: target.scale.x,
      startY: target.scale.y
    };
  }

  protected onTick(target: TargetNode, t: number, dt: number, ticker: IActionTicker): void {
    const scale = target.scale;
    const data = ticker.data;

    if (this.x != null && this.y != null) {
      scale.set(
        data.startX + (this.x - data.startX) * t,
        data.startY + (this.y - data.startY) * t
      );
    }
    else if (this.x != null) {
      scale.x = data.startX + (this.x - data.startX) * t;
    }
    else {
      scale.y = data.startY + (this.y - data.startY) * t;
    }
  }
}
