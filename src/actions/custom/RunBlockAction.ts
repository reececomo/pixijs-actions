import { Action } from '../../lib/Action';

export class RunBlockAction extends Action {
  public constructor(
    protected readonly block: (target: TargetNode) => void
  ) {
    super(0);
  }

  public reversed(): Action {
    return this;
  }

  protected onTick(target: TargetNode): void {
    this.block(target);
  }
}
