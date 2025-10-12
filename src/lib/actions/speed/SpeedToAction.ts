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

  public _onTickerAdded(target: Target): any {
    return { s0: target.speed };
  }

  public _onTickerUpdate(
    target: Target,
    t: number,
    dt: number,
    { data }: IActionTicker
  ): void {
    target.speed = data.s0 + (this.s1 - data.s0) * t;
  }
}
