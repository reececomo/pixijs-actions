import type * as PIXI from "pixi.js";

import { Action } from "./lib";
import { ActionTicker } from "./lib/ActionTicker";


/**
 * Register the mixin for PIXI.Container.
 *
 * @param containerType A reference to `PIXI.Container`.
 */
export function registerPixiJSActionsMixin(containerType: any): void {
  const prototype = (containerType as typeof PIXI.Container).prototype;

  //
  // ----------------- Container Action Properties: -----------------
  //

  prototype.speed = 1;
  prototype.isPaused = false;

  //
  // ----------------- Container Action Methods: -----------------
  //

  prototype.run = function (this: PIXI.Container, action: Action, completion?: () => void): void {
    if (completion) action = Action.sequence([action, Action.run(completion)]);
    return ActionTicker.runAction(this, action);
  };

  prototype.runWithKey = function (this: PIXI.Container, k, a): void {
    if (typeof a === "string") [ a, k ] = [ k, a ];
    ActionTicker.runAction(this, a as any, k as any);
  };

  prototype.runAsPromise = function (this: PIXI.Container, action: Action): Promise<void> {
    return new Promise((resolve) => this.run(action, () => resolve()));
  };

  prototype.action = function (this: PIXI.Container, forKey: string): Action | undefined {
    return ActionTicker.getTargetActionForKey(this, forKey);
  };

  prototype.hasActions = function (this: PIXI.Container): boolean {
    return ActionTicker.hasTargetActions(this);
  };

  prototype.removeAllActions = function (this: PIXI.Container): void {
    ActionTicker.removeAllTargetActions(this);
  };

  prototype.removeAction = function (this: PIXI.Container, forKey: string): void {
    ActionTicker.removeTargetActionForKey(this, forKey);
  };
}
