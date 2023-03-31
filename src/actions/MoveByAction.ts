import * as PIXI from 'pixi.js';

import { Action } from '../Action';
import { TimingModeFn } from '../ActionTimingMode';

export class MoveByAction extends Action {
  protected startX!: number;
  protected startY!: number;
  protected x: number;
  protected y: number;

  constructor(
    target: PIXI.DisplayObject,
    x: number,
    y: number,
    duration: number,
    timingMode: TimingModeFn = Action.DefaultTimingMode,
  ) {
    super(target, duration);
    this.timingMode = timingMode;
    this.x = x;
    this.y = y;
  }

  public tick(delta: number): boolean {
    if (this.time === 0) {
      this.startX = this.target.x;
      this.startY = this.target.y;
    }

    this.time += delta;

    const factor: number = this.easedTimeDistance;
    this.target.position.set(
      this.startX + this.x * factor,
      this.startY + this.y * factor,
    );

    return this.timeDistance >= 1;
  }
}
