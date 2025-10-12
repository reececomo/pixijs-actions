import { Timing, type TimingFunction, type TimingKey } from './Timing';
import { Defaults } from './Defaults';
import { IActionTicker } from './IActionTicker';


type UnknownTarget = Target;

/**
 * Create, configure, and run actions in PixiJS.
 *
 * An action is an animation that is executed by a target node.
 *
 * ### Setup:
 * @example
 * Ticker.shared.add( Action.tick )
 */
export abstract class Action<
  TargetType = Target,
  TickerData = any
> {

  //
  // ----------------- Global Defaults: -----------------
  //

  /**
   * @deprecated Use `Action.defaults.animateTimePerFrame` instead.
   */
  public static get DefaultAnimateTimePerFrame(): TimeInterval {
    return Defaults.animateTimePerFrame;
  }

  public static set DefaultAnimateTimePerFrame(value: TimeInterval) {
    Defaults.animateTimePerFrame = value;
  }

  /**
   * @deprecated Use `Action.defaults.timingEaseIn` instead.
   */
  public static get DefaultTimingEaseIn(): TimingFunction {
    return Defaults.timingEaseIn;
  }

  public static set DefaultTimingEaseIn(v: TimingFunction | TimingKey) {
    Defaults.timingEaseIn = typeof v === 'string' ? Timing[v] : v;
  }

  /**
   * @deprecated Use `Action.defaults.timingEaseOut` instead.
   */
  public static get DefaultTimingEaseOut(): TimingFunction {
    return Defaults.timingEaseOut;
  }

  public static set DefaultTimingEaseOut(v: TimingFunction | TimingKey) {
    Defaults.timingEaseOut = typeof v === 'string' ? Timing[v] : v;
  }

  /**
   * @deprecated Use `Action.defaults.timingEaseInOut` instead.
   */
  public static get DefaultTimingEaseInOut(): TimingFunction {
    return Defaults.timingEaseInOut;
  }

  public static set DefaultTimingEaseInOut(v: TimingFunction | TimingKey) {
    Defaults.timingEaseInOut = typeof v === 'string' ? Timing[v] : v;
  }

  /**
   * @deprecated Use `Action.defaults.timingEaseIn` instead.
   */
  public static get DefaultTimingModeEaseIn(): TimingFunction {
    return this.DefaultTimingEaseIn;
  }

  public static set DefaultTimingModeEaseIn(v: TimingFunction | TimingKey) {
    this.DefaultTimingEaseIn = typeof v === 'string' ? Timing[v] : v;
  }

  /**
   * @deprecated Use `Action.defaults.timingEaseOut` instead.
   */
  public static get DefaultTimingModeEaseOut(): TimingFunction {
    return this.DefaultTimingEaseOut;
  }

  public static set DefaultTimingModeEaseOut(v: TimingFunction | TimingKey) {
    this.DefaultTimingEaseOut = v;
  }

  /**
   * @deprecated Use `Action.defaults.timingEaseInOut` instead.
   */
  public static get DefaultTimingModeEaseInOut(): TimingFunction {
    return this.DefaultTimingEaseInOut;
  }

  public static set DefaultTimingModeEaseInOut(v: TimingFunction | TimingKey) {
    this.DefaultTimingEaseInOut = v;
  }

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
    hasChildren?: true | undefined,
  ) {
    if (duration < 0) {
      throw new RangeError('Action duration must be 0 or more.');
    }

    this.duration = duration;
    this.hasChildren = !!hasChildren;
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
   * This method mutates the underlying action.
   *
   * @see {Timing}
   */
  public setTiming(timingMode: TimingFunction): this
  public setTiming(timingModeKey: TimingKey): this
  public setTiming(v: TimingFunction | TimingKey): this {
    this.timing = typeof v === 'string' ? Timing[v] : v;
    return this;
  }

  /** @deprecated Use `setTiming()` instead. */
  public setTimingMode = this.setTiming;

  /**
   * Set the action's speed scale. Default: `1.0`.
   *
   * This method mutates the underlying action.
   */
  public setSpeed(speed: number): this {
    this.speed = speed;
    return this;
  }

  /**
   * @internal
   *
   * Apply the base properties from another action to this action.
   *
   * This method mutates the underlying action.
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
   * This method mutates the underlying action.
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
   * This method mutates the underlying action.
   *
   * @see {Action.DefaultTimingEaseIn}
   */
  public easeIn(): this {
    return this.setTiming(Defaults.timingEaseIn);
  }

  /**
   * Sets the speed curve of the action to the default ease-out pacing. Ease-out pacing causes the
   * animation to begin quickly and then slow as it completes.
   *
   * This method mutates the underlying action.
   *
   * @see {Action.DefaultTimingEaseOut}
   */
  public easeOut(): this {
    return this.setTiming(Defaults.timingEaseOut);
  }

  /**
   * Sets the speed curve of the action to the default ease-in, ease-out pacing. Ease-in, ease-out
   * pacing causes the animation to begin slowly, accelerate through the middle of its duration,
   * and then slow again before completing.
   *
   * This method mutates the underlying action.
   *
   * @see {Action.DefaultTimingEaseInOut}
   */
  public easeInOut(): this {
    return this.setTiming(Defaults.timingEaseInOut);
  }

  //
  // ----------------- Action Ticker Methods: -----------------
  //

  /**
   * @internal
   *
   * An action ticker started running.
   *
   * @param target The affected node.
   * @param t Ticker runner.
   *
   * @throws TypeError - If target is not correct type.
   */
  public _onTickerAdded(
    target: UnknownTarget,
    ticker: IActionTicker<TickerData>,
  ): any {
    return undefined;
  }

  /**
   * @internal
   *
   * An action ticker updated.
   *
   * @param target The affected node.
   * @param t Progress of the action (0, 1). Values may under/overshoot if timingMode allows.
   * @param dt Change in `t`. Use for relative actions.
   * @param ticker The action ticker running this update.
   * @param deltaTime The amount of scaled time elapsed in this tick.
   *
   * @throws Error - any runtime error.
   */
  public _onTickerUpdate(
    target: TargetType,
    t: number,
    dt: number,
    ticker: IActionTicker<TickerData>,
    deltaTime: number,
  ): void {}

  /**
   * @internal
   *
   * An action ticker was removed.
   */
  public _onTickerRemoved(
    target: TargetType,
    ticker: IActionTicker<TickerData>
  ): void {}

  /**
   * @internal
   *
   * An action ticker was reset.
   */
  public _onTickerDidReset(
    ticker: IActionTicker<TickerData>
  ): void {}

  //
  // ----------------- Abstract Methods: -----------------
  //

  /**
   * Creates an action that reverses the behavior of another action.
   *
   * This method always returns an action object; however, not all actions are reversible.
   * When reversed, some actions return an object that either does nothing or that
   * performs the same action as the original action.
   */
  public abstract reversed(): Action;
}
