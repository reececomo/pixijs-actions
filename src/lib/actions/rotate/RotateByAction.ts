import { Action } from '../../ActionClass';

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

  public _onTickerTick(target: TargetNode, t: number, dt: number): void {
    target.rotation += this.rotation * dt;
  }
}
