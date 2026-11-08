import { Action } from '../../ActionClass';
import { IActionTicker } from '../../IActionTicker';
import { ActionTicker } from '../../ActionTicker';

interface RepeatTickerData {
  childTicker: IActionTicker;
  i: number;
}

export class RepeatAction extends Action {
  protected readonly action: Action;
  protected readonly count: number;

  public constructor(action: Action, count: number) {
    if (!Number.isInteger(count) || count < 0) {
      throw new RangeError('The number of repeats must be a positive integer.');
    }

    super(action.scaledDuration * count, true);
    this.action = action;
    this.count = count;
  }

  public reversed(): Action {
    const action = this.action.reversed();
    return new RepeatAction(action, this.count)._apply(this);
  }

  public _onTickerAdded(
    target: Target,
    ticker: IActionTicker<RepeatTickerData>
  ): RepeatTickerData {
    const childTicker = new ActionTicker(target, this.action);

    // inherit timing mode from this action
    childTicker.timing = (x) => ticker.timing(childTicker.timing(x));

    return {
      childTicker,
      i: 0,
    };
  }

  public _onTickerUpdate(target: Target, ticker: IActionTicker<RepeatTickerData>): void {
    const childTicker = ticker.data.childTicker;

    childTicker._delta = ticker.deltaTime;
    childTicker._step();

    const remainingDeltaTime = childTicker._remaining;

    if (remainingDeltaTime > 0 || childTicker.duration === 0) {
      ticker.data.i += 1;

      if (ticker.data.i >= this.count) {
        ticker.isDone = true;

        return;
      }

      childTicker.reset();
      childTicker._delta = remainingDeltaTime;
      childTicker._step();
    }
  }

  public _onTickerDidReset(ticker: IActionTicker<RepeatTickerData>): any {
    if (!ticker.data) return;
    ticker.data.childTicker.reset();
    ticker.data.i = 0;
  }

  public _onTickerRemoved(target: Target, ticker: IActionTicker<RepeatTickerData>): void {
    if (!ticker.data) return;
    ticker.data.childTicker.destroy();
  }
}
