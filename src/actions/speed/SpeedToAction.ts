import { Action } from '../../lib/Action';
import { IActionTicker } from '../../lib/IActionTicker';

export class SpeedToAction extends Action {
  protected readonly s1: number;

  public constructor(speed: number, duration: TimeInterval) {
    super(duration);
    this.s1 = speed;
  }

  public reversed(): Action {
    return new SpeedToAction(this.s1, this.duration)._mutate(this);
  }

  protected onSetupTicker(target: TargetNode): any {
    return { s0: target.speed };
  }

  protected onTick(
    target: TargetNode,
    t: number,
    dt: number,
    { data }: IActionTicker
  ): void {
    target.speed = data.s0 + (this.s1 - data.s0) * t;
  }
}
