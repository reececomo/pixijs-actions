import { Action } from '../../lib/Action';
import { IActionTicker } from '../../lib/IActionTicker';
import { ActionTicker } from '../../lib/ActionTicker';
import { TimingMode } from '../../TimingMode';

export class SequenceAction extends Action {
  public constructor(
    protected actions: Action[]
  ) {
    super(actions.reduce((total, action) => total + action.scaledDuration, 0));
  }

  public reversed(): Action {
    return new SequenceAction(this.actions.map(action => action.reversed()).reverse())
      .setTimingMode(this.timingMode)
      .setSpeed(this.speed);
  }

  protected onSetupTicker(target: TargetNode, ticker: IActionTicker): any {
    ticker.autoComplete = false;

    return {
      childTickers: this._squashedActions()
        .map(action => new ActionTicker(undefined, target, action))
    };
  }

  protected onTick(
    target: TargetNode,
    t: number,
    dt: number,
    ticker: IActionTicker,
    deltaTime: number,
  ): void {
    let allDone = true;
    let remainingTimeDelta = ticker.scaledDuration === Infinity
      ? deltaTime * this.speed
      : dt * ticker.scaledDuration;

    for (const childTicker of ticker.data.childTickers as IActionTicker[]) {
      if (!childTicker.isDone) {

        if (remainingTimeDelta > 0 || childTicker.scaledDuration === 0) {
          remainingTimeDelta = childTicker.tick(remainingTimeDelta);
        }
        else {
          allDone = false;
          break;
        }

        if (remainingTimeDelta < 0) {
          allDone = false;
          break;
        }
      }
    }

    if (allDone) {
      ticker.isDone = true;
    }
  }

  protected onTickerDidReset(ticker: IActionTicker): any {
    ticker.data.childTickers.forEach((ticker: IActionTicker) => ticker.reset());
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
