import { Action } from '../../ActionClass';
import { FadeAlphaToAction } from './FadeAlphaToAction';

export * from './FadeAlphaByAction';
export * from './FadeAlphaToAction';

export class FadeInAction extends FadeAlphaToAction {
  public constructor(duration: number) {
    super(1, duration);
  }

  public reversed(): Action {
    return new FadeOutAction(this.duration)._apply(this);
  }
}

export class FadeOutAction extends FadeAlphaToAction {
  public constructor(duration: number) {
    super(0, duration);
  }

  public reversed(): Action {
    return new FadeInAction(this.duration)._apply(this);
  }
}
