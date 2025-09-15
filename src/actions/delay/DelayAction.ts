import { Action } from '../../lib/Action';

export class DelayAction extends Action {
  protected onTick(): void {
  }

  public reversed(): Action {
    return new DelayAction(this.duration)._apply(this);
  }
}
