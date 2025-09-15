import { Action } from '../../lib/Action';
import { IActionTicker } from '../../lib/IActionTicker';
import { ActionTicker } from '../../lib/ActionTicker';

export class GroupAction extends Action {
  protected readonly actions: Action[];

  public constructor(actions: Action[]) {
    const duration = Math.max(...actions.map(action => action.scaledDuration));
    super(duration);
    this.actions = actions;
  }

  public reversed(): Action {
    const reversedActions = this.actions.map(action => action.reversed());
    return new GroupAction(reversedActions)._mutate(this);
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
