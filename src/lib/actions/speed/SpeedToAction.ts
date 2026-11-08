import { Action } from '../../ActionClass';
import { IActionTicker } from '../../IActionTicker';

export class SpeedToAction extends Action {
  protected readonly s1: number;

  public constructor(speed: number, duration: TimeInterval) {
    super(duration);
    this.s1 = speed;
  }

  public reversed(): Action {
    return new SpeedToAction(this.s1, this.duration)._apply(this);
  }

  public _onTickerAdded(target: Target, { data }: IActionTicker): any {
    if (data === undefined) return { s0: target.speed };

    data.s0 = target.speed;

    return data;
  }

  public _onTickerUpdate(target: Target, { data, t }: IActionTicker): void {
    target.speed = data.s0 + (this.s1 - data.s0) * t;
  }
}
