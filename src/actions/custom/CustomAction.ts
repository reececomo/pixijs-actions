
import { Action } from '../../lib/Action';

export class CustomAction extends Action {
  public constructor(
    duration: TimeInterval,
      protected readonly stepFn: (target: TargetNode, t: number, dt: number) => void
  ) {
    super(duration);
  }

  protected onTick(target: TargetNode, t: number, dt: number): void {
    this.stepFn(target, t, dt);
  }

  public reversed(): Action {
    return this;
  }
}
