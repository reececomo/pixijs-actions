import { Action } from '../../lib/Action';
import { IActionTicker } from '../../lib/IActionTicker';
import { ActionTicker } from '../../lib/ActionTicker';

export class GroupAction extends Action {
  public constructor(
    protected readonly actions: Action[]
  ) {
    super(Math.max(...actions.map(action => action.scaledDuration)));
  }

  public reversed(): Action {
    return new GroupAction(this.actions.map(action => action.reversed()))._copyFrom(this);
  }

  protected onSetupTicker(target: TargetNode, ticker: IActionTicker): any {
    ticker.autoComplete = false;

    return {
      childTickers: this.actions.map(action => {
        const ticker = new ActionTicker(undefined, target, action);
        ticker.autoDestroy = false;
        return ticker;
      })
    };
  }

  protected onTick(
    target: TargetNode,
    t: number,
    dt: number,
    ticker: IActionTicker,
    deltaTime: number,
  ): void {
    const relativeDeltaTime = ticker.scaledDuration === Infinity
      ? deltaTime * this.speed
      : dt * ticker.scaledDuration;

    let allDone = true;
    for (const childTicker of ticker.data.childTickers as IActionTicker[]) {
      if (childTicker.isDone) continue;

      allDone = false;
      childTicker.tick(relativeDeltaTime);
    }

    if (allDone) ticker.isDone = true;
  }

  protected onTickerDidReset(ticker: IActionTicker): any {
    if (!ticker.data) return;
    ticker.data.childTickers.forEach((ticker: IActionTicker) => ticker.reset());
  }

  protected onTickerRemoved(target: TargetNode, ticker: IActionTicker): any {
    if (!ticker.data) return;
    ticker.data.childTickers.forEach((ticker: IActionTicker) => ticker.destroy());
  }
}
