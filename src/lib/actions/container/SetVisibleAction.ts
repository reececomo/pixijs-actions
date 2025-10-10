import { Action } from '../../ActionClass';

export class SetVisibleAction extends Action {
  protected readonly visible: boolean;

  public constructor(visible: boolean) {
    super(0);
    this.visible = visible;
  }

  public reversed(): Action {
    return new SetVisibleAction(!this.visible)._apply(this);
  }

  public _onTickerTick(target: TargetNode): void {
    target.visible = this.visible;
  }
}
