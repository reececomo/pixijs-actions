import { Action } from '../../lib/Action';

export class RunOnChildAction extends Action {
  public constructor(
    protected readonly action: Action,
    protected readonly label: string,
  ) {
    super(0);
  }

  public reversed(): Action {
    return new RunOnChildAction(this.action.reversed(), this.label)
      .setTimingMode(this.timingMode)
      .setSpeed(this.speed);
  }

  protected onTick(target: TargetNode): void {
    if (target.children && Array.isArray(target.children)) {
      let child: any;

      if ('getChildByLabel' in target as any) {
        child = (target as any).getChildByLabel(this.label); // pixi.js V8+
      }
      else {
        child = target.children
          .find((child: any) => child.label === this.label || child.name === this.label);
      }

      if (child) {
        child.run(this.action);
        return;
      }
    }

    throw new ReferenceError(`The target did not have a child matching '${this.label}'.`);
  }
}
