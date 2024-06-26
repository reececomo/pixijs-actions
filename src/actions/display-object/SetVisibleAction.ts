import { Action } from '../../lib/Action';

export class SetVisibleAction extends Action {
  public constructor(
    protected readonly visible: boolean,
  ) {
    super(0);
  }

  public reversed(): Action {
    return new SetVisibleAction(!this.visible)
      .setTimingMode(this.timingMode)
      .setSpeed(this.speed);
  }

  protected onTick(target: TargetNode): void {
    target.visible = this.visible;
  }
}
