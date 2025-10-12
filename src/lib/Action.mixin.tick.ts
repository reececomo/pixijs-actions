/* eslint-disable @typescript-eslint/no-namespace */

import { Action } from './ActionClass';
import { ActionTicker, TickerLike } from './ActionTicker';
import { IActionTicker } from './IActionTicker';


declare module './ActionClass' {

  export namespace Action {

    //
    // ----------------- Global Methods: -----------------
    //

    /**
     * Tick all actions forward.
     *
     * @param ticker Ticker instance.
     * @param onErrorHandler Error handler for individual action errors.
     */
    function tick(ticker: TickerLike, onErrorHandler?: (error: any) => void): void;

    /**
     * Tick all actions forward.
     *
     * @param deltaMS Delta time given in milliseconds.
     * @param onErrorHandler Error handler for individual action errors.
     */
    function tick(deltaMS: number, onErrorHandler?: (error: any) => void): void;

  }

  /**
   * @internal
   */
  export interface Action {

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
    _onTickerAdded(
      target: any,
      ticker: IActionTicker<any>,
    ): any;

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
    _onTickerUpdate(
      target: any,
      t: number,
      dt: number,
      ticker: IActionTicker<any>,
      deltaTime: number,
    ): void;

    /**
     * @internal
     *
     * An action ticker was removed.
     */
    _onTickerRemoved(
      target: any,
      ticker: IActionTicker<any>
    ): void;

    /**
     * @internal
     *
     * An action ticker was reset.
     */
    _onTickerDidReset(
      ticker: IActionTicker<any>
    ): void;
  }
}

//
// ----------------- Implementation: -----------------
//

Action.tick = ActionTicker.tickAll;

Action.prototype._onTickerAdded = function(): undefined {
  return undefined;
};

const EMPTY = function(): void {};
Action.prototype._onTickerUpdate = EMPTY;
Action.prototype._onTickerRemoved = EMPTY;
Action.prototype._onTickerDidReset = EMPTY;
