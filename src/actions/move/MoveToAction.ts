import { Action } from '../../lib/Action';
import { IActionTicker } from '../../lib/IActionTicker';
import { DelayAction } from '../delay';

export class MoveToAction extends Action {
  public constructor(
      protected readonly x: number | undefined,
      protected readonly y: number | undefined,
      duration: TimeInterval,
  ) {
    super(duration);
  }

  protected onSetupTicker(target: TargetNode, ticker: IActionTicker): any {
    return {
      startX: target.x,
      startY: target.y
    };
  }

  protected onTick(target: TargetNode, t: number, dt: number, ticker: IActionTicker): void {
    target.position.set(
      this.x === undefined ? target.position.x : ticker.data.startX + (this.x - ticker.data.startX) * t,
      this.y === undefined ? target.position.y : ticker.data.startY + (this.y - ticker.data.startY) * t
    );
  }

  public reversed(): Action {
    return new DelayAction(this.scaledDuration);
  }
}
