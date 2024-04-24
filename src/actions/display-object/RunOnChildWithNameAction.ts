import { Action } from '../../lib/Action';

export class RunOnChildWithNameAction extends Action {
  public constructor(
      protected readonly action: Action,
      protected readonly name: string,
  ) {
    super(0);
  }

  public reversed(): Action {
    return new RunOnChildWithNameAction(this.action.reversed(), this.name)
      .setTimingMode(this.timingMode)
      .setSpeed(this.speed);
  }

  protected onTick(target: TargetNode): void {
    if (!('children' in target) || !Array.isArray(target.children)) {
      return;
    }

    const child: TargetNode | undefined = target.children.find((c: any) => c.name === this.name);
    child?.run(this.action);
  }
}
