import { Action } from '../../lib/Action';
import { IActionTicker } from '../../lib/IActionTicker';
import { DelayAction } from '../delay';

export class RotateToAction extends Action {
  public constructor(
    protected readonly rotation: number,
    duration: TimeInterval,
  ) {
    super(duration);
  }

  public reversed(): Action {
    return new DelayAction(this.scaledDuration);
  }

  protected onSetupTicker(target: TargetNode): any {
    return {
      startRotation: target.rotation
    };
  }

  protected onTick(target: TargetNode, t: number, dt: number, ticker: IActionTicker): void {
    target.rotation = ticker.data.startRotation + (this.rotation - ticker.data.startRotation) * t;
  }
}
