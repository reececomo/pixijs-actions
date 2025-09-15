import { Action } from '../../lib/Action';
import { IActionTicker } from '../../lib/IActionTicker';

export class SpeedToAction extends Action {
  protected readonly speed1: number;

  public constructor(
    speed: number,
    duration: TimeInterval,
  ) {
    super(duration);
    this.speed1 = speed;
  }

  public reversed(): Action {
    return new SpeedToAction(this.speed1, this.duration)._apply(this);
  }

  protected onSetupTicker(target: TargetNode): any {
    return { speed0: target.speed };
  }

  protected onTick(
    target: TargetNode,
    t: number,
    dt: number,
    { data }: IActionTicker
  ): void {
    target.speed = data.speed0 + (this.speed1 - data.speed0) * t;
  }
}
