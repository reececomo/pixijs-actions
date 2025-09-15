import { Action } from '../../lib/Action';

export class MoveByAction extends Action {
  protected readonly x: number;
  protected readonly y: number;

  public constructor(
    x: number,
    y: number,
    duration: number,
  ) {
    super(duration);

    this.x = x;
    this.y = y;
  }

  public reversed(): Action {
    return new MoveByAction(-this.x, -this.y, this.duration)._mutate(this);
  }

  protected onTick(target: TargetNode, t: number, dt: number): void {
    target.position.x += this.x * dt;
    target.position.y += this.y * dt;
  }
}
