import { Action } from "./ActionClass";
import { TimingFunction } from "./Timing";


export interface TickerLike
{
  /**
   * Scalar time elapsed in milliseconds from last frame to this frame.
   */
  deltaMS: number;
}

type TickerMap = Map<string | ActionTicker, ActionTicker>;

const EPSILON_1 = 1 - 1e-15;

/**
 * An internal utility class that runs (or "ticks") stateless
 * actions for the duration of their lifespan.
 */
export class ActionTicker {
  /**
   * All currently executing actions.
   */
  private static tickers = new Map<Target, TickerMap>(); // TODO: weakmap

  //
  // ----- Global ticker: -----
  //

  /**
   * Tick all actions forward.
   *
   * @param value Ticker instance or delta time given in milliseconds.
   * @param onErrorHandler Error handler for individual action errors.
   */
  public static tickAll(
    value: number | TickerLike,
    onErrorHandler?: (error: any) => void
  ): void {
    const deltaMS = typeof value === "number" ? value : value.deltaMS;
    const deltaTime = deltaMS * 0.001;

    let _leaf: Target;
    let _isPaused: boolean;
    let _speed: number;

    for (const [target, tickers] of ActionTicker.tickers) {
      // calculate global isPaused and speed
      _leaf = target;
      _isPaused = target.isPaused;
      _speed = target.speed;

      while (!_isPaused && _leaf.parent != null) {
        _leaf = _leaf.parent;
        _isPaused = _leaf.isPaused;
        _speed *= _leaf.speed;
      }

      if (_isPaused || _speed <= 0 || !tickers) {
        continue;
      }

      for (const actionTicker of tickers.values()) {
        try {
          actionTicker.tick(deltaTime * _speed);

          if (actionTicker.isDone) {
            ActionTicker._removeActionTicker(actionTicker);
          }
        }
        catch (error) {
          // Report individual action errors.
          if (onErrorHandler === undefined) {
            console.error('Action failed with error: ', error);
          }
          else {
            onErrorHandler(error);
          }

          // Remove offending ticker.
          ActionTicker._removeActionTicker(actionTicker);
        }
      }
    }
  }

  //
  // ----- Ticker Management: -----
  //

  /** Adds an action to the list of actions executed by the node. */
  public static runAction(target: Target, action: Action, key?: string): void {
    if (!this.tickers.has(target)) {
      this.tickers.set(target, new Map());
    }

    const actionTicker = new ActionTicker(target, action, key);

    // Replaces any existing, identical-keyed actions on insert.
    this.tickers.get(target).set(key ?? actionTicker, actionTicker);
  }

  /** Whether a target has any actions. */
  public static hasTargetActions(target: Target): boolean {
    return this.tickers.has(target);
  }

  /** Retrieve an action with a key from a specific target. */
  public static getTargetActionForKey(target: Target, key: string): Action | undefined {
    return this.tickers.get(target)?.get(key)?.action;
  }

  /** Remove an action with a key from a specific target. */
  public static removeTargetActionForKey(target: Target, key: string): void {
    const actionTicker = this.tickers.get(target)?.get(key);
    if (actionTicker) {
      this._removeActionTicker(actionTicker);
    }
  }

  /** Remove all actions for a specific target. */
  public static removeAllTargetActions(target: Target): void {
    const actionTickers = this.tickers.get(target);
    if (!actionTickers) return;

    for (const ticker of [...actionTickers.values()]) {
      this._removeActionTicker(ticker);
    }
  }

  /** Remove all actions for every target. */
  public static removeAll(): void {
    for (const target of this.tickers.keys()) {
      this.removeAllTargetActions(target);
    }
  }

  //
  // ----- Internal helpers: -----
  //

  /**
   * Remove an action ticker for a target.
   *
   * This cleans up any references to target too.
   */
  protected static _removeActionTicker(ticker: ActionTicker, propagate = true): void {
    const target = ticker.target;
    const targetTickers = this.tickers.get(target);

    if (targetTickers === undefined) {
      return; // No change.
    }

    if (propagate) {
      ticker.action._onTickerRemoved?.(target, ticker);
    }

    targetTickers.delete(ticker.key ?? ticker);

    // if no more actions then remove target from map
    if (targetTickers.size === 0) {
      this.tickers.delete(target);
    }

    ticker.destroy();
  }

  //
  // ----- Properties: -----
  //

  /**
   * Unique key when running action on a target.
   *
   * Cancels existing actions.
   */
  public key?: string;

  /**
   * The container receiving the action.
   */
  public target: Target;

  /**
   * The action to apply.
   */
  public action: Action;

  /**
   * Relative speed of the action ticker.
   *
   * Copy-on-run: Copies the action's `speed` when the action is run.
   */
  public speed: number;

  /**
   * Relative speed of the action ticker.
   *
   * Copy-on-run: Copies the action's `timing` when the action is run.
   */
  public timing: TimingFunction;

  /**
   * Expected duration of the action ticker.
   *
   * Copy-on-run: Copies the action's scaled duration when the action is run.
   */
  public duration: number;

  /**
   * Any instance data that will live for the duration of the ticker.
   *
   * @see {Action._onTickerSetup()}
   */
  public data: any;

  /**
   * Whether the action has completed.
   *
   * Used by chainable actions.
   */
  public isDone: boolean = false;

  //
  // ----- Private properties: -----
  //

  /**
   * Whether the action ticker has initialized.
   *
   * Triggered on the first iteration to copy-on-run the attributes
   * from the action to the ticker.
   */
  protected _init = false;

  /**
   * Time elapsed in the action.
   */
  protected _elapsed: number = 0;

  //
  // ----- Constructor: -----
  //

  public constructor(
    target: Target,
    action: Action,
    key?: string,
  ) {
    this.key = key;
    this.target = target;
    this.action = action;
    this.speed = action.speed;
    this.duration = action.scaledDuration;
    this.timing = action.timing;
  }

  //
  // ----- Methods: -----
  //

  /**
   * @param deltaTime Maximum amount of time to increment forward.
   * @returns Any unused time delta. Negative value means action is still in progress.
   */
  public tick(deltaTime: number): number {
    const action = this.action;
    const target = this.target;

    if (!this._init) {
      // Copy-on-run attributes:
      this.speed = action.speed;
      this.timing = action.timing;
      this.duration = action.scaledDuration;

      // Perform first time setup:
      try {
        this.data = action._onTickerAdded(target, this);
      }
      catch (error) {
        // remove action if failed on launch
        ActionTicker._removeActionTicker(this, false);

        // rethrow
        throw error;
      }

      this._init = true;
    }

    // If target no longer valid, we garbage collect its runners.
    if (target.destroyed || target == null) {
      this.isDone = true;

      ActionTicker.removeAllTargetActions(target);

      return;
    }

    const scaledDeltaTime = deltaTime * this.speed;
    const duration = this.duration;

    // Instantaneous actions:
    if (duration === 0) {
      this._elapsed = 1;
      action._onTickerUpdate(this.target, 1, 1, this, scaledDeltaTime);

      // remove ticker on next tick
      this.isDone = true;

      // relinquish full time
      return deltaTime;
    }

    const timingFn = this.timing;

    // before
    const elapsed0 = this._elapsed;
    const t0 = Math.max(Math.min(elapsed0 / duration, 1), 0);
    const tScaled0 = timingFn(t0);

    // after
    const elapsed1 = elapsed0 + scaledDeltaTime;
    const t1 = Math.max(Math.min(elapsed1 / duration, 1), 0);
    const tScaled1 = timingFn(t1);
    const tDelta = tScaled1 - tScaled0;

    // apply
    this._elapsed = elapsed1;
    action._onTickerUpdate(this.target, tScaled1, tDelta, this, scaledDeltaTime);

    // queue completed actions to auto remove
    if (!action.hasChildren && t1 >= EPSILON_1) {
      this.isDone = true;
    }

    // relinquish no time if still in progress left in this action
    if (!this.isDone) {
      return -1;
    }

    return Math.max(this._elapsed - duration, 0);
  }

  /**
   * Reset the ticker for this run.
   *
   * Used by chainable actions to reset their child action's tickers.
   */
  public reset(): void {
    const action = this.action;

    if (!action.hasChildren) {
      // allow non-chainable actions to re-initialize
      this._init = false;
    }

    this._elapsed = 0;
    this.isDone = false;

    action._onTickerDidReset(this);
  }

  /**
   * Destroy ticker and clean up references.
   */
  public destroy(): void {
    this.key = undefined;
    this.data = undefined;
    this.target = undefined;
    this.isDone = true;
  }
}
