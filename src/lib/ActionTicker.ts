import { Action } from "./ActionClass";
import { TimingFunction } from "./Timing";


export interface TickerLike
{
  /**
   * Scalar time elapsed in milliseconds from last frame to this frame.
   */
  deltaMS: number;
}

class TickerMap extends Map<string | ActionTicker, ActionTicker> {
  public readonly target: Target;
  public readonly list: (ActionTicker | undefined)[] = [];
  public index = -1;
  public holes = 0;

  public constructor(target: Target) {
    super();
    this.target = target;
  }
}

const EPSILON_1 = 1 - 1e-15;

/**
 * An internal utility class that runs (or "ticks") stateless
 * actions for the duration of their lifespan.
 */
export class ActionTicker {
  /**
   * All currently executing actions.
   */
  protected static tickers = new Map<Target, TickerMap>(); // TODO: weakmap

  protected static _active: (TickerMap | undefined)[] = [];
  protected static _dirty = false;
  protected static _depth = 0;

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

    const active = ActionTicker._active;

    if (ActionTicker._dirty && ActionTicker._depth === 0) {
      ActionTicker._compact();
    }

    ActionTicker._depth++;

    try {
      for (let i = 0; i < active.length; i++) {
        const tickers = active[i];
        if (tickers === undefined) continue;

        // calculate global isPaused and speed
        let _leaf: Target = tickers.target;
        let _isPaused: boolean = _leaf.isPaused;
        let _speed: number = _leaf.speed;

        while (!_isPaused && _leaf.parent != null) {
          _leaf = _leaf.parent;
          _isPaused = _leaf.isPaused;
          _speed *= _leaf.speed;
        }

        if (_isPaused || _speed <= 0) {
          continue;
        }

        const scaledDeltaTime = deltaTime * _speed;
        const list = tickers.list;

        for (let j = 0; j < list.length; j++) {
          const actionTicker = list[j];
          if (actionTicker === undefined) continue;

          try {
            actionTicker._delta = scaledDeltaTime;
            actionTicker._step();

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
    finally {
      ActionTicker._depth--;

      if (ActionTicker._dirty && ActionTicker._depth === 0) {
        ActionTicker._compact();
      }
    }
  }

  //
  // ----- Ticker Management: -----
  //

  /** Adds an action to the list of actions executed by the node. */
  public static runAction(target: Target, action: Action, key?: string): void {
    let tickers = this.tickers.get(target);

    if (tickers === undefined) {
      tickers = new TickerMap(target);
      tickers.index = this._active.length;
      this._active.push(tickers);
      this.tickers.set(target, tickers);
    }

    const actionTicker = new ActionTicker(target, action, key);
    const mapKey = key ?? actionTicker;
    const existing = tickers.get(mapKey);

    // Replaces any existing, identical-keyed actions on insert.
    if (existing === undefined) {
      tickers.list.push(actionTicker);
    }
    else {
      tickers.list[tickers.list.indexOf(existing)] = actionTicker;
    }

    tickers.set(mapKey, actionTicker);
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

    const mapKey = ticker.key ?? ticker;
    const removed = targetTickers.get(mapKey);

    if (removed !== undefined) {
      const list = targetTickers.list;
      list[list.indexOf(removed)] = undefined;
      targetTickers.holes++;
      targetTickers.delete(mapKey);
      this._dirty = true;
    }

    // if no more actions then remove target from map
    if (targetTickers.size === 0) {
      this.tickers.delete(target);
      this._active[targetTickers.index] = undefined;
      this._dirty = true;
    }

    ticker.destroy();
  }

  protected static _compact(): void {
    const active = this._active;
    let w = 0;

    for (let r = 0; r < active.length; r++) {
      const tickers = active[r];
      if (tickers === undefined) continue;

      if (tickers.holes > 0) {
        const list = tickers.list;
        let lw = 0;

        for (let lr = 0; lr < list.length; lr++) {
          const ticker = list[lr];
          if (ticker !== undefined) list[lw++] = ticker;
        }

        list.length = lw;
        tickers.holes = 0;
      }

      tickers.index = w;
      active[w++] = tickers;
    }

    active.length = w;
    this._dirty = false;
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
   * Expected duration of the action ticker, before speed is applied.
   *
   * Copy-on-run: Copies the action's duration when the action is run.
   */
  public duration: number;

  /** @internal */
  public t: number = 0;

  /** @internal */
  public dt: number = 0;

  /** @internal */
  public deltaTime: number = 0;

  /** @internal */
  public _delta: number = 0;

  /** @internal */
  public _remaining: number = 0;

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

  protected _tScaled: number = 0;

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
    this.duration = action.duration;
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
    this._delta = deltaTime;
    this._step();

    return this._remaining;
  }

  /** @internal */
  public _step(): void {
    const action = this.action;
    const target = this.target;
    const deltaTime = this._delta;

    if (!this._init) {
      // Copy-on-run attributes:
      this.speed = action.speed;
      this.timing = action.timing;
      this.duration = action.duration;
      this._tScaled = this.timing(0);

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
      this._remaining = -1;

      ActionTicker.removeAllTargetActions(target);

      return;
    }

    const speed = this.speed;
    const scaledDeltaTime = deltaTime * speed;
    const duration = this.duration;

    // Instantaneous actions:
    if (duration === 0) {
      this._elapsed = 1;
      this.t = 1;
      this.dt = 1;
      this.deltaTime = scaledDeltaTime;
      action._onTickerUpdate(target, this);

      // remove ticker on next tick
      this.isDone = true;

      // relinquish full time
      this._remaining = deltaTime;

      return;
    }

    const elapsed = this._elapsed + scaledDeltaTime;
    const t = Math.max(Math.min(elapsed / duration, 1), 0);
    const tScaled = this.timing(t);

    // apply
    this._elapsed = elapsed;
    this.t = tScaled;
    this.dt = tScaled - this._tScaled;
    this.deltaTime = scaledDeltaTime;
    this._tScaled = tScaled;
    action._onTickerUpdate(target, this);

    // queue completed actions to auto remove
    if (!action.hasChildren && t >= EPSILON_1) {
      this.isDone = true;
    }

    // relinquish no time if still in progress left in this action
    this._remaining = this.isDone
      ? Math.max(this._elapsed - duration, 0) / speed
      : -1;
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
    else {
      this._tScaled = this.timing(0);
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
