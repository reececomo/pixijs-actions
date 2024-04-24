import { Action } from '../../lib/Action';

export class RunOnChildWithNameAction extends Action {
  public constructor(
      protected readonly action: Action,
      protected readonly name: string,
  ) {
    super(0);
  }

  protected onTick(target: TargetNode, t: number, dt: number): void {
    if (!('children' in target) || !Array.isArray(target.children)) {
      return;
    }

    const child: TargetNode | undefined = target.children.find((c: any) => c.name === this.name);
    child?.run(this.action);
  }

  public reversed(): Action {
    return new RunOnChildWithNameAction(this.action.reversed(), this.name);
  }
}
