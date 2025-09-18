import { Action } from '../../lib/Action';
import { IActionTicker } from '../../lib/IActionTicker';
import { ActionTicker } from '../../lib/ActionTicker';
import { Timing } from '../../Timing';

interface SequenceTickerData {
  childTickers: IActionTicker[];
}

export class SequenceAction extends Action {
  protected actions: Action[];

  public constructor(actions: Action[]) {
    const duration = actions.reduce((total, action) => total + action.scaledDuration, 0);

    super(duration, true);
    this.actions = actions;
  }

  public reversed(): Action {
    const reversedActions = this.actions.map(action => action.reversed()).reverse();
    return new SequenceAction(reversedActions)._apply(this);
  }

  public _onTickerInit(
    target: TargetNode,
    ticker: IActionTicker<any>,
  ): any {
    const actions = this._squashedActions();
    const childTickers = actions.map((action) => new ActionTicker(target, action));

    return { childTickers };
  }

  public _onTickerTick(
    target: TargetNode,
    t: number,
    dt: number,
    ticker: IActionTicker<SequenceTickerData>,
    deltaTime: number,
  ): void {
    let remainingDeltaTime = deltaTime;
    let allDone = true;

    for (const childTicker of ticker.data.childTickers) {
      if (childTicker.isDone) continue;

      remainingDeltaTime = childTicker.tick(remainingDeltaTime);

      if (!childTicker.isDone) allDone = false;

      if (remainingDeltaTime < 0) {
        // Stop sequence, no more time remaining.
        // (0 = continue for instant actions)
        break;
      }
    }

    if (allDone) ticker.isDone = true;
  }

  public _onTickerDidReset(ticker: IActionTicker<SequenceTickerData>): SequenceTickerData {
    if (!ticker.data) return;
    ticker.data.childTickers.forEach((ticker) => ticker.reset());
  }

  public _onTickerRemoved(target: TargetNode, ticker: IActionTicker<SequenceTickerData>): void {
    if (!ticker.data) return;
    ticker.data.childTickers.forEach((ticker) => ticker.reset());
  }

  // ----- Implementation: -----

  protected _squashedActions(): Action[] {
    const actions: Action[] = [];

    for (const action of this.actions) {
      if (
        action instanceof SequenceAction
          && action.speed === 1
          && action.timing === Timing.linear
      ) {
        actions.push(...action._squashedActions());
      }
      else {
        actions.push(action);
      }
    }

    return actions;
  }
}
