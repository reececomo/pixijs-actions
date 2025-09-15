import { Action } from '../../lib/Action';
import { IActionTicker } from '../../lib/IActionTicker';

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
    return new RotateToAction(this.r1, this.duration)._mutate(this);
  }

  protected onSetupTicker({ rotation }: TargetNode): any {
    return { r0: rotation };
  }

  protected onTick(
    target: TargetNode,
    t: number,
    dt: number,
    { data }: IActionTicker,
  ): void {
    target.rotation = data.r0 + (this.r1 - data.r0) * t;
  }
}
