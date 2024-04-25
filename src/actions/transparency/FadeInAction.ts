import { Action } from '../../lib/Action';
import { FadeAlphaToAction } from './FadeAlphaToAction';

export class FadeInAction extends FadeAlphaToAction {
  public constructor(duration: number) {
    super(1, duration);
  }

  public reversed(): Action {
    return new FadeAlphaToAction(0, this.duration)
      .setTimingMode(this.timingMode)
      .setSpeed(this.speed);
  }
}
