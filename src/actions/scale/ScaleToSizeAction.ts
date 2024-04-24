import { Action } from '../../lib/Action';
import { IActionTicker } from '../../lib/IActionTicker';
import { DelayAction } from '../delay';

export class ScaleToSizeAction extends Action {
  public constructor(
        protected readonly width: number,
        protected readonly height: number,
        duration: TimeInterval,
  ) {
    super(duration);
  }

  protected onSetupTicker(target: SizedTargetNode): any {
    if (target.width === undefined) {
      throw new Error('Action can only be run against a target with a width & height.');
    }

    return {
      sW: target.width,
      sH: target.height,
    };
  }

  protected onTick(target: SizedTargetNode, t: number, dt: number, ticker: IActionTicker): void {
    target.width = ticker.data.sW + (this.width - ticker.data.sW) * t;
    target.height = ticker.data.sH + (this.height - ticker.data.sH) * t;
  }

  public reversed(): Action {
    return new DelayAction(this.scaledDuration);
  }
}
