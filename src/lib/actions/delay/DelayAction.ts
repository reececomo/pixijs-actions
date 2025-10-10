import { Action } from '../../ActionClass';

export class DelayAction extends Action {
  public constructor(duration: number) {
    super(duration);
  }

  public _onTickerTick(): void {
  }

  public reversed(): Action {
    return new DelayAction(this.duration)._apply(this);
  }
}
