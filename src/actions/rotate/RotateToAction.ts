import { Action } from '../../lib/Action';
import { IActionTicker } from '../../lib/IActionTicker';

export class RotateToAction extends Action {
  protected readonly rotation: number;

  public constructor(
    rotation: number,
    duration: TimeInterval,
  ) {
    super(duration);

    this.rotation = rotation;
  }

  public reversed(): Action {
    return new RotateToAction(this.rotation, this.duration)._apply(this);
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
