import { Action } from '../../lib/Action';

export class SetVisibleAction extends Action {
  protected readonly visible: boolean;

  public constructor(visible: boolean) {
    super(0);
    this.visible = visible;
  }

  public reversed(): Action {
    return new SetVisibleAction(!this.visible)._mutate(this);
  }

  protected onTick(target: TargetNode): void {
    target.visible = this.visible;
  }
}
