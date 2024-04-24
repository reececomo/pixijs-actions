import { Action } from '../../lib/Action';

export class SetVisibleAction extends Action {
  public constructor(
      protected readonly visible: boolean,
  ) {
    super(0);
  }

  protected onTick(target: TargetNode): void {
    target.visible = this.visible;
  }

  public reversed(): Action {
    return new SetVisibleAction(!this.visible);
  }
}
