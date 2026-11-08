import { Action } from '../../ActionClass';
import { IActionTicker } from '../../IActionTicker';

export class RotateToAction extends Action {
  protected readonly r1: number;

  public constructor(
    rotation: number,
    duration: TimeInterval,
  ) {
    super(duration);

    this.r1 = rotation;
  }

  public reversed(): Action {
    return new RotateToAction(this.r1, this.duration)._apply(this);
  }

  public _onTickerAdded({ rotation }: Target, { data }: IActionTicker): any {
    if (data === undefined) return { r0: rotation };

    data.r0 = rotation;

    return data;
  }

  public _onTickerUpdate(target: Target, { data, t }: IActionTicker): void {
    target.rotation = data.r0 + (this.r1 - data.r0) * t;
  }
}
