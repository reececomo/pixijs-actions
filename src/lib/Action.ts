import { TimingMode, TimingModeFn } from '../TimingMode';
import { IActionTicker } from './IActionTicker';

export abstract class Action {
  public log = false;

  // ----- Default Timing Modes: -----

  protected static _defaultAnimateTimePerFrame: TimeInterval = 1/60;
  protected static _defaultTimingModeEaseIn = TimingMode.easeInSine;
  protected static _defaultTimingModeEaseOut = TimingMode.easeOutSine;
  protected static _defaultTimingModeEaseInOut = TimingMode.easeInOutSine;

  //
  // ----------------- Action: -----------------
  //

  /**
   * The duration required to complete an action.
   */
  public readonly duration: TimeInterval;

  /**
   * A speed factor that modifies how fast an action runs.
   */
  public speed: number = 1.0;

  /**
   * A setting that controls the speed curve of an animation.
   */
  public timingMode: TimingModeFn = TimingMode.linear;

  protected constructor(duration: TimeInterval) {
    if (duration < 0) {
      throw new RangeError('Action duration must be 0 or more.');
    }

    this.duration = duration;
  }

  /**
   * Whether action completes instantly.
   */
  public get isInstant(): boolean {
    return this.duration === 0;
  }

  /**
   * Whether action never completes.
   */
  public get isInfinite(): boolean {
    return Math.abs(this.duration) === Infinity;
  }

  /**
   * Duration of the action, factoring in local speed.
   */
  public get scaledDuration(): number {
    return this.duration / this.speed;
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
   * Adjust the speed curve of an animation. Default: `TimingMode.linear`.
   *
   * This function mutates the underlying action.
   *
   * @see {TimingMode}
   */
  public setTimingMode(timingMode: TimingModeFn): this {
    this.timingMode = timingMode;
    return this;
  }

  /**
   * Apply the base properties from another action to this action.
   *
   * This function mutates the underlying action.
   */
  public _mutate(action: Action): this {
    this.timingMode = action.timingMode;
    this.speed = action.speed;
    return this;
  }

  //
  // ----------------- Default TimingMode Shortcuts: -----------------
  //

  /**
   * Default `timingMode`. Sets the speed curve of the action to linear pacing. Linear pacing causes
   * an animation to occur evenly over its duration.
   *
   * This function mutates the underlying action.
   *
   * @see {TimingMode.linear}
   */
  public linear(): this {
    return this.setTimingMode(TimingMode.linear);
  }

  /**
   * Sets the speed curve of the action to the default ease-in pacing. Ease-in pacing causes the
   * animation to begin slowly and then speed up as it progresses.
   *
   * This function mutates the underlying action.
   *
   * @see {Action.DefaultTimingModeEaseIn}
   */
  public easeIn(): this {
    return this.setTimingMode(Action._defaultTimingModeEaseIn);
  }

  /**
   * Sets the speed curve of the action to the default ease-out pacing. Ease-out pacing causes the
   * animation to begin quickly and then slow as it completes.
   *
   * This function mutates the underlying action.
   *
   * @see {Action.DefaultTimingModeEaseOut}
   */
  public easeOut(): this {
    return this.setTimingMode(Action._defaultTimingModeEaseOut);
  }

  /**
   * Sets the speed curve of the action to the default ease-in, ease-out pacing. Ease-in, ease-out
   * pacing causes the animation to begin slowly, accelerate through the middle of its duration,
   * and then slow again before completing.
   *
   * This function mutates the underlying action.
   *
   * @see {Action.DefaultTimingModeEaseInOut}
   */
  public easeInOut(): this {
    return this.setTimingMode(Action._defaultTimingModeEaseInOut);
  }

  //
  // ----------------- Action Ticker Methods: -----------------
  //

  /**
   * (optional)
   * @throws an error thrown here will abort adding the action to a target
   */
  protected onSetupTicker(target: TargetNode, ticker: IActionTicker): any {
    return undefined;
  }

  /** (optional) */
  protected onTickerDidReset(ticker: IActionTicker): any {
    return undefined;
  }

  /** (optional) */
  protected onTickerRemoved(target: TargetNode, ticker: IActionTicker): void {
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
   * @param dt Relative change in progress since the previous animation change. Use this for relative actions.
   * @param ticker The action ticker running this update.
   * @param deltaTime The amount of time elapsed in this tick. This number is scaled by both speed of target and any parent actions.
   */
  protected abstract onTick<Target extends TargetNode>(
    target: Target,
    t: number,
    dt: number,
    ticker: IActionTicker,
    deltaTime: number
  ): void;
}
