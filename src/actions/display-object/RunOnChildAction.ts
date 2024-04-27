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

    let child: any;

    if ('getChildByLabel' in target as any) {
      child = (target as any).getChildByLabel(this.nameOrLabel); // PixiJS v8
    }
    else {
      child = target.children
        .find((child: any) => child.label === this.nameOrLabel || child.name === this.nameOrLabel);
    }

    if (child) {
      child.run(this.action);
      return;
    }

    throw new ReferenceError(`The target did not have a child matching '${this.nameOrLabel}'.`);
  }
}
