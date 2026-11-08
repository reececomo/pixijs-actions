import { Action } from '../../ActionClass';
import { IActionTicker } from '../../IActionTicker';

export class RotateByAction extends Action {
  protected readonly rotation: number;

  public constructor(
    rotation: number,
    duration: TimeInterval,
  ) {
    super(duration);

    this.rotation = rotation;
  }

  public reversed(): Action {
    return new RotateByAction(-this.rotation, this.duration)._apply(this);
  }

  public _onTickerUpdate(target: Target, { dt }: IActionTicker): void {
    target.rotation += this.rotation * dt;
  }
}
