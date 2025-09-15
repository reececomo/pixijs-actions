import { Action } from '../../lib/Action';
import { IActionTicker } from '../../lib/IActionTicker';
import { ActionTicker } from '../../lib/ActionTicker';

export class RepeatAction extends Action {
  protected readonly action: Action;
  protected readonly repeats: number;

  public constructor(action: Action, repeats: number) {
    if (!Number.isInteger(repeats) || repeats < 0) {
      throw new RangeError('The number of repeats must be a positive integer.');
    }

    super(action.scaledDuration * repeats);
    this.action = action;
    this.repeats = repeats;
  }

  public reversed(): Action {
    const reversedAction = this.action.reversed();
    return new RepeatAction(reversedAction, this.repeats)._mutate(this);
  }

  protected onSetupTicker(target: TargetNode, ticker: IActionTicker): any {
    ticker.autoComplete = false;

    const childTicker = new ActionTicker(undefined, target, this.action);
    childTicker.timingMode = (x: number) => ticker.timingMode(childTicker.timingMode(x));
    childTicker.autoDestroy = false;

    return {
      childTicker,
      n: 0,
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
    let remainingDeltaTime = deltaTime * this.speed;

    remainingDeltaTime = childTicker.tick(remainingDeltaTime);

    if (remainingDeltaTime > 0 || childTicker.scaledDuration === 0) {
      if (++ticker.data.n >= this.repeats) {
        ticker.isDone = true;
        ticker.autoDestroy = true;
        return;
      }

      childTicker.reset();
      remainingDeltaTime = childTicker.tick(remainingDeltaTime);
    }
  }

  protected onTickerDidReset(ticker: IActionTicker): any {
    if (!ticker.data) return;
    ticker.data.childTicker.reset();
    ticker.data.n = 0;
  }

  protected onTickerRemoved(target: TargetNode, ticker: IActionTicker): void {
    if (!ticker.data) return;
    ticker.data.childTicker.destroy();
  }
}
