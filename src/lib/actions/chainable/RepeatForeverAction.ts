import { Action } from '../../ActionClass';
import { IActionTicker } from '../../IActionTicker';
import { ActionTicker } from '../../ActionTicker';
import { Timing } from '../../Timing';

interface RepeatForeverTickerData {
  childTicker: IActionTicker<any>;
}

export class RepeatForeverAction extends Action {
  protected readonly action: Action;

  public constructor(action: Action) {
    if (action.scaledDuration <= 0) {
      throw new RangeError('The action to be repeated must have a non-instantaneous duration.');
    }

    super(action.scaledDuration, true);

    this.action = action;
  }

  public reversed(): Action {
    const reversedAction = this.action.reversed();
    return new RepeatForeverAction(reversedAction)._apply(this);
  }

  public _onTickerAdded(
    target: Target,
    ticker: IActionTicker<RepeatForeverTickerData>
  ): RepeatForeverTickerData {
    const childTicker = new ActionTicker(target, this.action);

    // inject timing mode into child ticker
    if (ticker.timing !== Timing.linear) {
      childTicker.timing = (x) => ticker.timing(childTicker.timing(x));
    }

    return { childTicker };
  }

  public _onTickerUpdate(
    target: Target,
    t: number,
    dt: number,
    ticker: IActionTicker<RepeatForeverTickerData>,
    deltaTime: number
  ): void {
    const childTicker = ticker.data.childTicker;
    let remainingDeltaTime = deltaTime;

    remainingDeltaTime = childTicker.tick(remainingDeltaTime);

    if (remainingDeltaTime > 0) {
      childTicker.reset();
      remainingDeltaTime = childTicker.tick(remainingDeltaTime);
    }
  }

  public _onTickerDidReset(ticker: IActionTicker<RepeatForeverTickerData>): any {
    if (!ticker.data) return;
    ticker.data.childTicker.reset();
  }

  public _onTickerRemoved(target: Target, ticker: IActionTicker<RepeatForeverTickerData>): void {
    if (!ticker.data) return;
    ticker.data.childTicker.destroy();
  }
}
