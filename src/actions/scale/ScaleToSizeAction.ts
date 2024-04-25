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

  public reversed(): Action {
    return new DelayAction(this.scaledDuration);
  }

  protected onSetupTicker(target: SizedTargetNode): any {
    if (typeof target.width !== 'number' || typeof target.height !== 'number') {
      throw new TypeError("The target must have numeric 'width' and 'height'.");
    }

    return {
      width: target.width,
      height: target.height,
    };
  }

  protected onTick(target: SizedTargetNode, t: number, dt: number, ticker: IActionTicker): void {
    target.width = ticker.data.width + (this.width - ticker.data.width) * t;
    target.height = ticker.data.height + (this.height - ticker.data.height) * t;
  }
}
