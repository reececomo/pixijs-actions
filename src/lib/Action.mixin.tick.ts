/* eslint-disable @typescript-eslint/no-namespace */

import { Action } from './ActionClass';
import { ActionTicker, TickerLike } from './ActionTicker';


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

}

//
// ----------------- Implementation: -----------------
//

Action.tick = ActionTicker.tickAll;
