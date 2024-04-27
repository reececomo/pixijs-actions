import { Action } from '../../lib/Action';

export class RunOnChildAction extends Action {
  public constructor(
    protected readonly action: Action,
    protected readonly nameOrLabel: string,
  ) {
    super(0);
  }

  public reversed(): Action {
    return new RunOnChildAction(this.action.reversed(), this.nameOrLabel)
      .setTimingMode(this.timingMode)
      .setSpeed(this.speed);
  }

  protected onTick(target: TargetNode): void {
    if (target.children === undefined || !Array.isArray(target.children)) {
      throw new TypeError('The target did not have children.');
    }

    const child: any = target.children
      .find((child: any) => child.name === this.nameOrLabel || child.label === this.nameOrLabel);

    if (child) {
      child.run(this.action);
      return;
    }

    throw new ReferenceError(`The target did not have a child matching '${this.nameOrLabel}'.`);
  }
}
