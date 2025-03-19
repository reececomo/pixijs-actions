import { Action } from "./Action";
import { TimingModeFn } from "../TimingMode";

const EPSILON = 0.0000000001;
const EPSILON_1 = 1 - EPSILON;

/**
 * An internal utility class that runs (or "ticks") stateless
 * actions for the duration of their lifespan.
 */
export class ActionTicker {

  /** All currently executing actions. */
  protected static _tickers: Map<TargetNode, Map<string | ActionTicker, ActionTicker>> = new Map();

  //
  // ----- Global ticker: -----
  //

  /**
   * Tick all actions forward.
   *
   * @param deltaTimeMs Delta time given in milliseconds.
   * @param onErrorHandler Handle action errors.
   */
  public static tickAll(deltaTimeMs: number, onErrorHandler?: (error: any) => void): void {
    const deltaTime = deltaTimeMs * 0.001;

    let _leaf: TargetNode;
    let _isPaused: boolean;
    let _speed: number;

    for (const [target, tickers] of this._tickers) {
      // Calculate global isPaused and speed
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
          this._removeActionTicker(actionTicker);
        }
      }
    }
  }

  //
  // ----- Ticker Management: -----
  //

  /** Adds an action to the list of actions executed by the node. */
  public static runAction(key: string | undefined, target: TargetNode, action: Action): void {
    if (!this._tickers.has(target)) {
      this._tickers.set(target, new Map());
    }

    const actionTicker = new ActionTicker(key, target, action);

    // Replaces any existing, identical-keyed actions on insert.
    this._tickers.get(target).set(key ?? actionTicker, actionTicker);
  }

  /** Whether a target has any actions. */
  public static hasTargetActions(target: TargetNode): boolean {
    return this._tickers.has(target);
  }

  /** Retrieve an action with a key from a specific target. */
  public static getTargetActionForKey(target: TargetNode, key: string): Action | undefined {
    return this._tickers.get(target)?.get(key)?.action;
  }

  /** Remove an action with a key from a specific target. */
  public static removeTargetActionForKey(target: TargetNode, key: string): void {
    const actionTicker = this._tickers.get(target)?.get(key);
    if (actionTicker) {
      this._removeActionTicker(actionTicker);
    }
  }

  /** Remove all actions for a specific target. */
  public static removeAllTargetActions(target: TargetNode): void {
    const actionTickers = this._tickers.get(target);
    if (!actionTickers) return;

    for (const ticker of [...actionTickers.values()]) {
      this._removeActionTicker(ticker);
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

    const tickers = this._tickers.get(target);
    if (tickers === undefined) {
      return; // No change.
    }

    if (propagate) {
      (ticker.action as any).onTickerRemoved?.(target, ticker);
    }

    tickers.delete(ticker.key ?? ticker);

    if (ticker.autoDestroy) {
      ticker.destroy();
    }

    if (tickers.size === 0) {
      this._tickers.delete(target);
    }
  }

  //
  // ----- Properties: -----
  //

  /**
   * Relative speed of the action ticker.
   *
   * Copy-on-run: Copies the action's `speed` when the action is run.
   */
  public speed: number;

  /**
   * Relative speed of the action ticker.
   *
   * Copy-on-run: Copies the action's `timingMode` when the action is run.
   */
  public timingMode: TimingModeFn;

  /**
   * Expected duration of the action ticker.
   *
   * Copy-on-run: Copies the action's `scaledDuration` when the action is run.
   */
  public scaledDuration: number;

  /**
   * Any instance data that will live for the duration of the ticker.
   *
   * @see {Action.onSetupTicker()}
   */
  public data: any;

  /**
   * Whether the action has completed.
   *
   * Needs to be manually updated when `this.autoComplete = false`.
   *
   * Used by chainable actions.
   */
  public isDone: boolean = false;

  /**
   * Whether the action ticker destroys when removed.
   *
   * Repeatable actions should set this to false.
   */
  public autoDestroy: boolean = true;

  /**
   * Whether the action ticker will mark the action as done when time
   * `this._elapsed >= this.scaledDuration`.
   *
   * Disable to manually control when `isDone` is triggered.
   *
   * Used by chainable actions.
   */
  public autoComplete: boolean = true;

  //
  // ----- Private properties: -----
  //

  /** Time elapsed in the action. */
  protected _elapsed: number = 0.0;

  /**
   * Whether the action ticker has been setup.
   *
   * Triggered on the first iteration to copy-on-run the attributes
   * from the action to the ticker.
   */
  protected _isSetup = false;

  //
  // ----- Constructor: -----
  //

  public constructor(
    public key: string | undefined,
    public target: TargetNode,
    public action: Action,
  ) {
    this.speed = action.speed;
    this.scaledDuration = action.scaledDuration;
    this.timingMode = action.timingMode;
  }

  //
  // ----- Accessors: -----
  //

  /** The relative time elapsed between 0 and 1. */
  public get timeDistance(): number {
    return this.scaledDuration === 0 ? 1 : Math.min(1, this._elapsed / this.scaledDuration);
  }

  /**
   * The relative time elapsed between 0 and 1, eased by the timing mode function.
   *
   * Can be a value beyond 0 or 1 depending on the timing mode function.
   */
  protected get easedTimeDistance(): number {
    return this.timingMode(this.timeDistance);
  }

  //
  // ----- Methods: -----
  //

  /** @returns Any unused time delta. Negative value means action is still in progress. */
  public tick(deltaTime: number): number {
    if (!this._isSetup) {
      // Copy action attributes:
      this.speed = this.action.speed;
      this.scaledDuration = this.action.duration;
      this.timingMode = this.action.timingMode;

      // Perform first time setup:
      try {
        this.data = (this.action as any).onSetupTicker(this.target, this);
      }
      catch (error) {
        ActionTicker._removeActionTicker(this, false); // invalid target, failed on launch
        throw error; // rethrow
      }

      this._isSetup = true;
    }

    const target = this.target;
    const action = this.action;

    // If action no longer valid, we garbage collect its runners.
    if (target == null || target.destroyed) {
      ActionTicker._removeActionTicker(this);

      return;
    }

    const scaledDeltaTime = deltaTime * this.speed;

    // Instantaneous actions:
    if (this.scaledDuration === 0) {
      (action as any).onTick(this.target, 1.0, 1.0, this, scaledDeltaTime);
      this.isDone = true;

      // Remove completed action.
      ActionTicker._removeActionTicker(this);

      return deltaTime; // relinquish the full time.
    }

    if (deltaTime === 0 && this.timeDistance < EPSILON_1) {
      return -1; // Early exit, no progress.
    }

    const b = this.easedTimeDistance;

    this._elapsed += scaledDeltaTime;

    const t = this.easedTimeDistance;
    const dt = t - b;

    (action as any).onTick(this.target, t, dt, this, scaledDeltaTime);

    if (this.isDone || (this.autoComplete && this.timeDistance >= EPSILON_1)) {
      this.isDone = true;

      // Remove completed action.
      ActionTicker._removeActionTicker(this);

      return this._elapsed > this.scaledDuration
        ? this._elapsed - this.scaledDuration
        : 0;
    }

    return -1; // relinquish no time
  }

  /**
   * Reset the ticker for this run.
   *
   * Used by chainable actions to reset their child action's tickers.
   */
  public reset(): void {
    this._elapsed = 0.0;
    this.isDone = false;
    this._isSetup = false;
    (this.action as any).onTickerDidReset(this);
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
