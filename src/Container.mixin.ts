import { type Container } from "pixi.js";

import { Action } from "./lib";
import { ActionTicker } from "./lib/ActionTicker";


/**
 * Register the mixin for PIXI.Container.
 *
 * @param containerType A reference to `PIXI.Container`.
 */
export function registerPixiJSActionsMixin(containerType: any): void {
  const prototype = (containerType as typeof Container).prototype;

  //
  // ----------------- Container Action Properties: -----------------
  //

  prototype.speed = 1;
  prototype.isPaused = false;

  //
  // ----------------- Container Action Methods: -----------------
  //

  prototype.run = function (this: TargetNode, action: Action, completion?: () => void): void {
    if (completion) action = Action.sequence([action, Action.run(completion)]);
    return ActionTicker.runAction(this, action);
  };

  prototype.runWithKey = function (this: TargetNode, k, a): void {
    if (typeof a === "string") [ a, k ] = [ k, a ];
    ActionTicker.runAction(this, a as any, k as any);
  };

  prototype.runAsPromise = function (this: TargetNode, action: Action): Promise<void> {
    return new Promise((resolve) => this.run(action, () => resolve()));
  };

  prototype.action = function (this: TargetNode, forKey: string): Action | undefined {
    return ActionTicker.getTargetActionForKey(this, forKey);
  };

  prototype.hasActions = function (this: TargetNode): boolean {
    return ActionTicker.hasTargetActions(this);
  };

  prototype.removeAllActions = function (this: TargetNode): void {
    ActionTicker.removeAllTargetActions(this);
  };

  prototype.removeAction = function (this: TargetNode, forKey: string): void {
    ActionTicker.removeTargetActionForKey(this, forKey);
  };
}
