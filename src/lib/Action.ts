import { Timing, type TimingFunction, type TimingKey } from '../Timing';
import { ActionSettings } from './ActionSettings';
import { IActionTicker } from './IActionTicker';

export abstract class Action {

  // ----- Properties: -----

  /**
   * The duration required to complete an action.
   */
  public readonly duration: TimeInterval;

  /**
   * Whether this action owns child actions.
   */
  public readonly hasChildren: boolean;

  /**
   * A speed factor that modifies how fast an action runs.
   */
  public speed: number = 1;

  /**
   * A function that controls the speed curve of an action.
   */
  public timing: TimingFunction = Timing.linear;

  // ----- Methods: -----

  protected constructor(
    duration: TimeInterval,
    hasChildren: boolean = false,
  ) {
    if (duration < 0) {
      throw new RangeError('Action duration must be 0 or more.');
    }

    this.duration = duration;
    this.hasChildren = hasChildren;
  }

  /**
   * Duration of the action, after factoring in local speed.
   *
   * @internal
   */
  public get scaledDuration(): number {
    return this.duration / this.speed;
  }

  /**
   * Adjust the timing curve of an animation.
   *
   * This function mutates the underlying action.
   *
   * @see {Timing}
   */
  public setTiming(timingMode: TimingFunction): this
  public setTiming(timingModeKey: TimingKey): this
  public setTiming(v: TimingFunction | TimingKey): this {
    this.timing = typeof v === 'string' ? Timing[v] : v;
    return this;
  }

  /**
   * Set the action's speed scale. Default: `1.0`.
   *
   * This function mutates the underlying action.
   */
  public setSpeed(speed: number): this {
    this.speed = speed;

    return this;
  }

  /**
   * Apply the base properties from another action to this action.
   *
   * This function mutates the underlying action.
   *
   * @internal
   */
  public _apply(action: Action): this {
    this.timing = action.timing;
    this.speed = action.speed;
    return this;
  }

  //
  // ----------------- Default Timing: -----------------
  //

  /**
   * Default `timingMode`. Sets the speed curve of the action to linear pacing. Linear pacing causes
   * an animation to occur evenly over its duration.
   *
   * This function mutates the underlying action.
   *
   * @see {Timing.linear}
   */
  public linear(): this {
    return this.setTiming(Timing.linear);
  }

  /**
   * Sets the speed curve of the action to the default ease-in pacing. Ease-in pacing causes the
   * animation to begin slowly and then speed up as it progresses.
   *
   * This function mutates the underlying action.
   *
   * @see {Action.DefaultTimingEaseIn}
   */
  public easeIn(): this {
    return this.setTiming(ActionSettings.timingEaseIn);
  }

  /**
   * Sets the speed curve of the action to the default ease-out pacing. Ease-out pacing causes the
   * animation to begin quickly and then slow as it completes.
   *
   * This function mutates the underlying action.
   *
   * @see {Action.DefaultTimingEaseOut}
   */
  public easeOut(): this {
    return this.setTiming(ActionSettings.timingEaseOut);
  }

  /**
   * Sets the speed curve of the action to the default ease-in, ease-out pacing. Ease-in, ease-out
   * pacing causes the animation to begin slowly, accelerate through the middle of its duration,
   * and then slow again before completing.
   *
   * This function mutates the underlying action.
   *
   * @see {Action.DefaultTimingEaseInOut}
   */
  public easeInOut(): this {
    return this.setTiming(ActionSettings.timingEaseInOut);
  }

  //
  // ----------------- Action Ticker Methods: -----------------
  //

  /**
   * @internal
   * @throws an error thrown here will abort adding the action to a target
   */
  public _onTickerInit(
    target: TargetNode,
    ticker: IActionTicker<any>,
  ): any {
    return undefined;
  }

  /**
   * @internal
   */
  public _onTickerDidReset(ticker: IActionTicker<any>): void {
    return undefined;
  }

  /**
   * @internal
   */
  public _onTickerRemoved(target: TargetNode, ticker: IActionTicker<any>): void {
    return undefined;
  }

  /**
   * Creates an action that reverses the behavior of another action.
   *
   * This method always returns an action object; however, not all actions are reversible.
   * When reversed, some actions return an object that either does nothing or that performs the same
   * action as the original action.
   */
  public abstract reversed(): Action;

  /**
   * Update function for the action.
   *
   * @param target The affected node.
   * @param t The elapsed progress of the action, with the timing mode function applied. Generally a scalar number between 0.0 and 1.0.
   * @param dt Change in progress since the previous animation change. Use this for relative actions.
   * @param ticker The action ticker running this update.
   * @param deltaTime The amount of time elapsed in this tick. This number is scaled by both speed of target and any parent actions.
   *
   * @internal
   */
  public abstract _onTickerTick<Target extends TargetNode>(
    target: Target,
    t: number,
    dt: number,
    ticker: IActionTicker<any>,
    deltaTime: number,
  ): void;
}
