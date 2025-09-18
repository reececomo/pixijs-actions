import { Action } from "./lib/Action";
import { PixiJSActions as _ } from "./Action";
import { ActionTicker } from "./lib/ActionTicker";

/**
 * Register the mixin for PIXI.Container.
 *
 * @param containerType A reference to `PIXI.Container`.
 */
export function registerPixiJSActionsMixin(containerType: any): void {
  const prototype = containerType.prototype;

  // - Properties:
  prototype.speed = 1;
  prototype.isPaused = false;

  // - Methods:
  prototype.run = function (this: TargetNode, action: Action, completion?: () => void): void {
    return completion
      ? ActionTicker.runAction(undefined, this, _.sequence([action, _.run(completion)]))
      : ActionTicker.runAction(undefined, this, action);
  };

  prototype.runWithKey = function (this: TargetNode, a: Action | string, b: Action | string): void {
    if (typeof b === "string") ActionTicker.runAction(b, this, a as Action);
    else ActionTicker.runAction(a as string, this, b);
  };

  prototype.runAsPromise = function (this: TargetNode, action: Action): Promise<void> {
    return new Promise(resolve => this.run(action, () => resolve()));
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
