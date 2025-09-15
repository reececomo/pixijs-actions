import { Action } from '../../lib/Action';
import { IActionTicker } from '../../lib/IActionTicker';
import { ActionTicker } from '../../lib/ActionTicker';
import { TimingMode } from '../../TimingMode';

export class SequenceAction extends Action {
  protected actions: Action[];

  public constructor(actions: Action[]) {
    const duration = actions.reduce((d, action) => d + action.scaledDuration, 0);
    super(duration);
    this.actions = actions;
  }

  public reversed(): Action {
    const reversedActions = this.actions.map(action => action.reversed()).reverse();
    return new SequenceAction(reversedActions)._mutate(this);
  }

  protected onSetupTicker(target: TargetNode, ticker: IActionTicker): any {
    ticker.autoComplete = false;

    return {
      childTickers: this._squashedActions().map(action => {
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
    let remainingDeltaTime = ticker.scaledDuration === Infinity
      ? deltaTime * this.speed
      : dt * ticker.scaledDuration;

    for (const childTicker of ticker.data.childTickers as IActionTicker[]) {
      if (childTicker.isDone) continue;

      remainingDeltaTime = childTicker.tick(remainingDeltaTime);

      if (remainingDeltaTime < 0) {
        return; // Cannot continue to next: Current action not completed yet.
      }
    }

    ticker.isDone = true;
  }

  protected onTickerDidReset(ticker: IActionTicker): any {
    if (!ticker.data) return;
    ticker.data.childTickers.forEach((ticker: IActionTicker) => ticker.reset());
  }

  protected onTickerRemoved(target: TargetNode, ticker: IActionTicker): any {
    if (!ticker.data) return;
    ticker.data.childTickers.forEach((ticker: IActionTicker) => ticker.destroy());
  }

  // ----- Implementation: -----

  protected _squashedActions(): Action[] {
    const actions: Action[] = [];

    for (const action of this.actions) {
      if (
        action instanceof SequenceAction
        && action.speed === 1
        && action.timingMode === TimingMode.linear
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
