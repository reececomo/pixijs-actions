
import { Action } from '../../lib/Action';
import { IActionTicker } from '../../lib/IActionTicker';
import { ActionTicker } from '../../lib/ActionTicker';

export class RepeatAction extends Action {
  public constructor(
      protected readonly action: Action,
      protected readonly repeats: number,
  ) {
    super(
      // Duration:
      action.scaledDuration * repeats
    );

    if (Math.round(repeats) !== repeats || repeats < 0) {
      throw new Error('Repeats must be a positive integer.');
    }
  }

  public reversed(): Action {
    return new RepeatAction(this.action.reversed(), this.repeats)
      .setTimingMode(this.timingMode)
      .setSpeed(this.speed);
  }

  protected onSetupTicker(target: TargetNode, ticker: IActionTicker): any {
    ticker.autoComplete = false;

    const childTicker = new ActionTicker(undefined, target, this.action);
    childTicker.timingMode = (x: number) => ticker.timingMode(childTicker.timingMode(x));

    return {
      childTicker,
      n: 0,
    };
  }

  protected onTick(target: TargetNode, t: number, dt: number, ticker: IActionTicker, deltaTime: number): void {
    let childTicker: IActionTicker = ticker.data.childTicker;
    let remainingTimeDelta = deltaTime * this.speed;

    remainingTimeDelta = childTicker.tick(remainingTimeDelta);

    if (remainingTimeDelta > 0 || childTicker.scaledDuration === 0) {
      if (++ticker.data.n >= this.repeats) {
        ticker.isDone = true;
        return;
      }

      childTicker.reset();
      remainingTimeDelta = childTicker.tick(remainingTimeDelta);
    }
  }

  protected onTickerDidReset(ticker: IActionTicker): any {
    ticker.data.childTicker.reset();
    ticker.data.n = 0;
  }
}
