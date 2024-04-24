import { Action } from '../../lib/Action';

export class RemoveFromParentAction extends Action {
  public constructor() {
    super(0);
  }

  protected onTick(target: TargetNode): void {
    target.parent?.removeChild(target);
  }

  public reversed(): Action {
    return this;
  }
}
