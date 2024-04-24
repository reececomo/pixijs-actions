import { Action } from '../../lib/Action';
import { IActionTicker } from '../../lib/IActionTicker';
import { ActionTicker } from '../../lib/ActionTicker';

export class GroupAction extends Action {
  public constructor(
    protected readonly actions: Action[]
  ) {
    super(
      // Max duration:
      Math.max(...actions.map(action => action.scaledDuration))
    );

    this.actions = actions;
  }

  public reversed(): Action {
    return new GroupAction(this.actions.map(action => action.reversed()));
  }

  protected onTick(
    target: TargetNode,
    t: number,
    dt: number,
    ticker: IActionTicker,
  ): void {
    const relativeTimeDelta = dt * ticker.scaledDuration;
    let allDone = true;

    for (const childTicker of ticker.data.childTickers as IActionTicker[]) {
      if (!childTicker.isDone) {
        allDone = false;
        childTicker.tick(relativeTimeDelta);
      }
    }

    if (allDone) {
      ticker.isDone = true;
    }
  }

  protected onSetupTicker(target: TargetNode, ticker: IActionTicker): any {
    ticker.autoComplete = false;

    return {
      childTickers: this.actions.map(action => new ActionTicker(undefined, target, action))
    };
  }

  protected onTickerDidReset(ticker: IActionTicker): any {
    ticker.data.childTickers.forEach((ticker: IActionTicker) => ticker.reset());
  }
}
