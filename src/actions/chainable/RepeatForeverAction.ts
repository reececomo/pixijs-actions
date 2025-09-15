import { Action } from '../../lib/Action';
import { IActionTicker } from '../../lib/IActionTicker';
import { ActionTicker } from '../../lib/ActionTicker';

export class RepeatForeverAction extends Action {
  protected readonly action: Action;

  public constructor(action: Action) {
    if (action.scaledDuration <= 0) {
      throw new TypeError('The action to be repeated must have a non-instantaneous duration.');
    }

    super(Infinity);

    this.action = action;
  }

  public reversed(): Action {
    const reversedAction = this.action.reversed();
    return new RepeatForeverAction(reversedAction)._mutate(this);
  }

  protected onSetupTicker(target: TargetNode, ticker: IActionTicker): any {
    ticker.autoComplete = false;

    const childTicker = new ActionTicker(undefined, target, this.action);
    childTicker.timingMode = (x: number) => ticker.timingMode(childTicker.timingMode(x));
    childTicker.autoDestroy = false; // manually destroy

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
    let remainingDeltaTime = deltaTime * ticker.speed;

    remainingDeltaTime = childTicker.tick(remainingDeltaTime);

    if (remainingDeltaTime > 0) {
      childTicker.reset();
      remainingDeltaTime = childTicker.tick(remainingDeltaTime);
    }
  }

  protected onTickerDidReset(ticker: IActionTicker): any {
    if (!ticker.data) return;
    ticker.data.childTicker.reset();
  }

  protected onTickerRemoved(target: TargetNode, ticker: IActionTicker): void {
    if (!ticker.data) return;
    ticker.data.childTicker.destroy();
  }
}
