import { Action } from '../../lib/Action';
import { IActionTicker } from '../../lib/IActionTicker';
import { ActionTicker } from '../../lib/ActionTicker';

export class RepeatForeverAction extends Action {
  public constructor(
    protected readonly action: Action
  ) {
    super(Infinity);

    if (action.scaledDuration <= 0) {
      throw new TypeError('The action to be repeated must have a non-instantaneous duration.');
    }
  }

  public reversed(): Action {
    return new RepeatForeverAction(this.action.reversed())
      .setTimingMode(this.timingMode)
      .setSpeed(this.speed);
  }

  protected onSetupTicker(target: TargetNode, ticker: IActionTicker): any {
    ticker.autoComplete = false;

    const childTicker = new ActionTicker(undefined, target, this.action);
    childTicker.timingMode = (x: number) => ticker.timingMode(childTicker.timingMode(x));

    return {
      childTicker
    };
  }

  protected onTick(
    target: TargetNode,
    t: number,
    dt: number,
    ticker: IActionTicker,
    deltaTime: number
  ): void {
    const childTicker: IActionTicker = ticker.data.childTicker;
    let remainingTimeDelta = deltaTime * ticker.speed;

    remainingTimeDelta = childTicker.tick(remainingTimeDelta);

    if (remainingTimeDelta > 0) {
      childTicker.reset();
      remainingTimeDelta = childTicker.tick(remainingTimeDelta);
    }
  }

  protected onTickerDidReset(ticker: IActionTicker): any {
    ticker.data.childTicker.reset();
  }
}
