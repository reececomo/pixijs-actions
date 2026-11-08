import { Action } from '../../ActionClass';
import { IActionTicker } from '../../IActionTicker';
import { ActionTicker } from '../../ActionTicker';

interface GroupTickerData {
  childTickers: IActionTicker[];
}

export class GroupAction extends Action {
  protected readonly actions: Action[];

  public constructor(actions: Action[]) {
    const duration = Math.max(...actions.map((action) => action.scaledDuration));

    super(duration, true);
    this.actions = actions;
  }

  public reversed(): Action {
    const reversedActions = this.actions.map((action) => action.reversed());
    return new GroupAction(reversedActions)._apply(this);
  }

  public _onTickerAdded(target: Target): GroupTickerData {
    const actions = this.actions;
    const childTickers = actions.map((action) => new ActionTicker(target, action));

    return { childTickers };
  }

  public _onTickerUpdate(
    target: Target,
    t: number,
    dt: number,
    ticker: IActionTicker<GroupTickerData>,
    deltaTime: number,
  ): void {
    const childTickers = ticker.data.childTickers;
    let allDone = true;

    for (let i = 0; i < childTickers.length; i++) {
      const childTicker = childTickers[i];
      if (childTicker.isDone) continue;

      childTicker.tick(deltaTime);

      if (!childTicker.isDone) allDone = false;
    }

    if (allDone) ticker.isDone = true;
  }

  public _onTickerDidReset(ticker: IActionTicker<GroupTickerData>): GroupTickerData {
    if (!ticker.data) return;
    const childTickers = ticker.data.childTickers;
    for (let i = 0; i < childTickers.length; i++) childTickers[i].reset();
  }

  public _onTickerRemoved(target: Target, ticker: IActionTicker<GroupTickerData>): void {
    if (!ticker.data) return;
    const childTickers = ticker.data.childTickers;
    for (let i = 0; i < childTickers.length; i++) childTickers[i].destroy();
  }
}
