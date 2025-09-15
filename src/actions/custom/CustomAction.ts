import { Action } from '../../lib/Action';

export type StepFunction = (target: TargetNode, t: number, dt: number) => void;

export class CustomAction extends Action {
  protected readonly stepFn: StepFunction;

  public constructor(duration: TimeInterval, stepFn: StepFunction) {
    super(duration);
    this.stepFn = stepFn;
  }

  protected onTick(target: TargetNode, t: number, dt: number): void {
    this.stepFn(target, t, dt);
  }

  public reversed(): Action {
    return new CustomAction(this.duration, this.stepFn)._mutate(this);
  }
}
