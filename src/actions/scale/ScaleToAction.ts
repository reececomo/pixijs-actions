import { Action } from '../../lib/Action';
import { IActionTicker } from '../../lib/IActionTicker';
import { DelayAction } from '../delay';

export class ScaleToAction extends Action {
  public constructor(
    protected readonly x: number | undefined,
    protected readonly y: number | undefined,
    duration: TimeInterval,
  ) {
    super(duration);
  }

  public reversed(): Action {
    return new DelayAction(this.scaledDuration);
  }

  protected onSetupTicker(target: TargetNode): any {
    return {
      startX: target.scale.x,
      startY: target.scale.y
    };
  }

  protected onTick(target: TargetNode, t: number, dt: number, ticker: IActionTicker): void {
    target.scale.set(
      this.x === undefined ? target.scale.x : ticker.data.startX + (this.x - ticker.data.startX) * t,
      this.y === undefined ? target.scale.y : ticker.data.startY + (this.y - ticker.data.startY) * t
    );
  }
}
