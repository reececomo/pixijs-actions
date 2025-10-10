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

  public _onTickerInit(target: TargetNode): GroupTickerData {
    const actions = this.actions;
    const childTickers = actions.map((action) => new ActionTicker(target, action));

    return { childTickers };
  }

  public _onTickerTick(
    target: TargetNode,
    t: number,
    dt: number,
    ticker: IActionTicker<GroupTickerData>,
    deltaTime: number,
  ): void {
    let allDone = true;

    for (const childTicker of ticker.data.childTickers) {
      if (childTicker.isDone) continue;

      childTicker.tick(deltaTime);

      if (!childTicker.isDone) allDone = false;
    }

    if (allDone) ticker.isDone = true;
  }

  public _onTickerDidReset(ticker: IActionTicker<GroupTickerData>): GroupTickerData {
    if (!ticker.data) return;
    ticker.data.childTickers.forEach((ticker) => ticker.reset());
  }

  public _onTickerRemoved(target: TargetNode, ticker: IActionTicker<GroupTickerData>): void {
    if (!ticker.data) return;
    ticker.data.childTickers.forEach((ticker) => ticker.destroy());
  }
}
