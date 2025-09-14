import { Action } from '../../lib/Action';
import { FadeAlphaToAction } from './FadeAlphaToAction';

export class FadeOutAction extends FadeAlphaToAction {
  public constructor(duration: number) {
    super(0, duration);
  }

  public reversed(): Action {
    return new FadeAlphaToAction(1, this.duration)._copyFrom(this);
  }
}
