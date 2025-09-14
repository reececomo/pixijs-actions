import { Action } from '../../lib/Action';
import { IActionTicker } from '../../lib/IActionTicker';

export class ScaleToSizeAction extends Action {
  public constructor(
    protected readonly width: number,
    protected readonly height: number,
    duration: TimeInterval,
  ) {
    super(duration);
  }

  public reversed(): Action {
    return new ScaleToSizeAction(this.width, this.height, this.duration)._copyFrom(this);
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
    const data = ticker.data;

    target.width = data.width + (this.width - data.width) * t;
    target.height = data.height + (this.height - data.height) * t;
  }
}
